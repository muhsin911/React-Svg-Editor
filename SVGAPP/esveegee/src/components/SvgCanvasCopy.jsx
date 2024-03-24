import React, { useState, useRef, useEffect } from 'react';

const SvgCanvas = ({ currentTool }) => {
    const [elements, setElements] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationStart, setTranslationStart] = useState({ x: 0, y: 0 });
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [selectedElementIndex, setSelectedElementIndex] = useState(null);
    const [isRotating, setIsRotating] = useState(false);
    
    
    const svgRef = useRef(null);

    const handleSvgClick = (e) => {
        // Check if the clicked target is the svg element itself
        if (e.target === svgRef.current) {
            setSelectedElementIndex(null); // Deselect any selected element
        }
    };

    const handleMouseDown = (e) => {
        const svgRect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const y = e.clientY - svgRect.top;

        
       
        if (selectedElementIndex != null && !isDrawing) {
            setTranslationStart({ x, y });
            setIsTranslating(true);
        } else if (currentTool && !isDrawing) {
            setStartPoint({ x, y });
            setIsDrawing(true);

            const newElement = {
                id: Date.now(),
                type: currentTool,
                x, y,
                ...(currentTool === 'rect' ? { width: 0, height: 0 } : {}),
                ...(currentTool === 'circle' ? { r: 0 } : {}),
                fill: 'red',
            };

            setElements(prevElements => [...prevElements, newElement]);
        }
        
    };

    const handleMouseMove = (e) => {
        if (!isDrawing && !isTranslating && !isRotating) return;
    
        const svgRect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const y = e.clientY - svgRect.top;
    
        if (isTranslating && selectedElementIndex != null) {
            const dx = x - translationStart.x;
            const dy = y - translationStart.y;
    
            const updatedElements = elements.map((el, idx) => {
                if (idx === selectedElementIndex) {
                    return { ...el, x: el.x + dx, y: el.y + dy };
                }
                return el;
            });
            setElements(updatedElements);
    
            setTranslationStart({ x, y });
        } else if (isDrawing) {
            const newElements = [...elements];
            const lastIndex = newElements.length - 1;
            const newElement = { ...newElements[lastIndex] };
    
            if (newElement.type === 'rect') {
                newElement.width = Math.abs(x - startPoint.x);
                newElement.height = Math.abs(y - startPoint.y);
                newElement.x = Math.min(x, startPoint.x);
                newElement.y = Math.min(y, startPoint.y);
            } else if (newElement.type === 'circle') {
                const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
                newElement.r = radius;
            }
    
            newElements[lastIndex] = newElement;
            setElements(newElements);
        } else if (isRotating && selectedElementIndex != null) {
            // Ensure the selectedElement is defined before calculating the rotation.
            const selectedElement = elements[selectedElementIndex];
            if (selectedElement) {
                const centerX = selectedElement.x + (selectedElement.width / 2 || 0);
                const centerY = selectedElement.y + (selectedElement.height / 2 || 0);
                const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
                
                // Update the selected element with the new rotation angle
                const updatedElements = elements.map((el, idx) => 
                    idx === selectedElementIndex ? { ...el, rotate: angle } : el
                );
                setElements(updatedElements);
            }
        }
        
    };
    

    const handleMouseUp = () => {
        setIsDrawing(false);
        setIsTranslating(false);
        setIsRotating(false);
    };

    const handleElementClick = (idx, e) => {
        e.stopPropagation();
        setSelectedElementIndex(idx);
    };

    const updateElementFill = (color) => {
        if (selectedElementIndex == null) return;
        const newElements = [...elements];
        newElements[selectedElementIndex].fill = color;
        setElements(newElements);
    };

    const deleteSelectedElement = () => {
        if (selectedElementIndex == null) return;
        setElements(elements.filter((_, idx) => idx !== selectedElementIndex));
        setSelectedElementIndex(null);
    };

    const exportSVG = () => {
        const svg = svgRef.current;
        const serializer = new XMLSerializer();
        const svgBlob = new Blob([serializer.serializeToString(svg)], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'exported-svg.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const startRotation = (e, index) => {
        e.stopPropagation(); // Prevent triggering element selection
        setIsRotating(true);
        setSelectedElementIndex(index);
    };
    
    
    const handleSvgImport = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            // This is a basic implementation and might need adjustments based on your SVG structure
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(text, "image/svg+xml");
            const newElements = [];

            // Parse rectangles
            svgDoc.querySelectorAll('rect').forEach(rect => {
                newElements.push({
                    id: Date.now() + Math.random(), // Ensure unique ID
                    type: 'rect',
                    x: parseFloat(rect.getAttribute('x')),
                    y: parseFloat(rect.getAttribute('y')),
                    width: parseFloat(rect.getAttribute('width')),
                    height: parseFloat(rect.getAttribute('height')),
                    fill: rect.getAttribute('fill') || 'none',
                });
            });

            // Parse circles
            svgDoc.querySelectorAll('circle').forEach(circle => {
                newElements.push({
                    id: Date.now() + Math.random(), // Ensure unique ID
                    type: 'circle',
                    x: parseFloat(circle.getAttribute('cx')),
                    y: parseFloat(circle.getAttribute('cy')),
                    r: parseFloat(circle.getAttribute('r')),
                    fill: circle.getAttribute('fill') || 'none',
                });
            });

            setElements(newElements);
        };
        reader.readAsText(file);
    };

    return (
        <div>

            

            <input type="file" accept=".svg" onChange={handleSvgImport} />
            <input
                type="color"
                disabled={selectedElementIndex == null}
                onChange={(e) => updateElementFill(e.target.value)}
                value={selectedElementIndex != null ? elements[selectedElementIndex].fill : '#000000'}
            />
            <button onClick={deleteSelectedElement} disabled={selectedElementIndex == null}>
                Delete
            </button>
            <button onClick={exportSVG}>
                Export SVG
            </button>
            <svg
                ref={svgRef}
                width="800"
                height="600"
                style={{ border: '1px solid black' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleSvgClick}
            >
                {elements.map((el, idx) => {
    const isSelected = idx === selectedElementIndex;
    const centerX = el.type === 'circle' ? el.x : el.x + el.width / 2;
    const centerY = el.type === 'circle' ? el.y : el.y + el.height / 2;
    const transform = el.rotate ? `rotate(${el.rotate} ${centerX} ${centerY})` : '';
    
    const elementProps = {
        key: el.id,
        onClick: (e) => handleElementClick(idx, e),
        transform,
        fill: el.fill,
    };

    // Render the element itself (circle or rectangle)
    let svgElement = null;
    switch (el.type) {
        case 'rect':
            svgElement = <rect {...elementProps} x={el.x} y={el.y} width={el.width} height={el.height} />;
            break;
        case 'circle':
            svgElement = <circle {...elementProps} cx={el.x} cy={el.y} r={el.r} />;
            break;
        // case 'text':
        //     svgElement = (
        //         <text {...elementProps} x={el.x} y={el.y} fontSize={el.fontSize}>
        //             {el.text}
        //         </text>
        //     );
        //     break;    
        default:
            svgElement = null;
    }

    // Optionally render a rotation handle for the selected element
    const rotationHandle = isSelected ? (
        <circle
            cx={centerX}
            cy={centerY - (el.height / 2 || el.r) - 20} // Positioned above the element
            r="5"
            fill="blue"
            cursor="pointer"
            onMouseDown={(e) => startRotation(e, idx)}
            key={`handle-${el.id}`}
        />
    ) : null;

    return (
        <React.Fragment key={idx}>
            {svgElement}
            {rotationHandle}
        </React.Fragment>
    );
})}


            </svg>
        </div>
    );
};

export default SvgCanvas;
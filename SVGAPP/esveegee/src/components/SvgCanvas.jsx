import React, { useState, useRef } from 'react';
import Controls from './Controls';
import DrawableElement from './DrawableElement';
import './svgcanvas.css';

const SvgCanvas = ({ currentTool }) => {
    const [elements, setElements] = useState([]);
    const [selectedElementIndex, setSelectedElementIndex] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [translationStart, setTranslationStart] = useState({ x: 0, y: 0 });
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);

    // Clears the selected element if the SVG canvas itself is clicked
    const handleSvgClick = (e) => {
        if (e.target === svgRef.current) {
            setSelectedElementIndex(null);
        }
    };

    // Starts a new drawing, translation, or rotation based on the current tool and state
    const handleMouseDown = (e) => {
        const { left, top } = svgRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        if (selectedElementIndex != null && !isDrawing) {
            initiateTranslation(x, y);
        } else if (currentTool && !isDrawing) {
            initiateDrawing(x, y);
        }
    };

    // Handles the drawing, translation, or rotation of elements on mouse move
    const handleMouseMove = (e) => {
        if (!isDrawing && !isTranslating && !isRotating) return;

        const { left, top } = svgRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        if (isTranslating) {
            translateElement(x, y);
        } else if (isDrawing) {
            drawElement(x, y);
        } else if (isRotating) {
            rotateElement(x, y);
        }
    };

    // Resets the drawing, translation, and rotation states on mouse up
    const handleMouseUp = () => {
        setIsDrawing(false);
        setIsTranslating(false);
        setIsRotating(false);
    };

    // Updates the properties of an element
    const updateElement = (index, updates) => {
        setElements((prev) => prev.map((el, idx) => (idx === index ? { ...el, ...updates } : el)));
    };

    // Deletes an element from the canvas
    const deleteElement = (index) => {
        setElements((prev) => prev.filter((_, idx) => idx !== index));
        setSelectedElementIndex(null);
    };

    // Exports the current SVG canvas as an SVG file
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

    // Imports an SVG file and parses its elements to be added to the canvas
    const handleSvgImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            parseAndSetElementsFromSVG(text);
        };
        reader.readAsText(file);
    };

    // Initiates the drawing process
    const initiateDrawing = (x, y) => {
        setStartPoint({ x, y });
        setIsDrawing(true);
        createNewElement(x, y);
    };

    // Initiates the translation process
    const initiateTranslation = (x, y) => {
        setTranslationStart({ x, y });
        setIsTranslating(true);
    };
    
    // Creates a new element based on the current tool
    const createNewElement = (x, y) => {
        const newElement = {
            id: Date.now(),
            type: currentTool,
            x, y,
            ...(currentTool === 'rect' ? { width: 0, height: 0 } : {}),
            ...(currentTool === 'circle' ? { r: 0 } : {}),
            fill: 'white', // Set the fill to transparent
        };
    
        setElements(prevElements => [...prevElements, newElement]);
    };
    
    // Translates the selected element based on mouse movements
    const translateElement = (x, y) => {
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
    };
    
    // Adjusts the size or position of the drawing element based on mouse movements
    const drawElement = (x, y) => {
        const newElements = [...elements];
        const lastIndex = newElements.length - 1;
        const newElement = { ...newElements[lastIndex] };
    
        if (newElement.type === 'rect') {
            newElement.width = Math.abs(x - startPoint.x);
            newElement.height = Math.abs(y - startPoint.y);
            newElement.x = Math.min(x, startPoint.x);
            newElement.y = Math.min(y, startPoint.y);
        } else if (newElement.type === 'circle') {
            const radius = Math.sqrt((x - startPoint.x) ** 2 + (y - startPoint.y) ** 2);
            newElement.r = radius;
        }
    
        newElements[lastIndex] = newElement;
        setElements(newElements);
    };
    
    // Rotates the selected element
    const rotateElement = (x, y) => {
        const selectedElement = elements[selectedElementIndex];
        if (selectedElement) {
            const centerX = selectedElement.x + (selectedElement.width / 2 || 0);
            const centerY = selectedElement.y + (selectedElement.height / 2 || 0);
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
            
            const updatedElements = elements.map((el, idx) => 
                idx === selectedElementIndex ? { ...el, rotate: angle } : el
            );
            setElements(updatedElements);
        }
    };
    
    // Parses and sets elements from an imported SVG
    const parseAndSetElementsFromSVG = (svgContent) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
        const newElements = [];
    
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
    
    // Component render
    return (
        <div className='container'>
            <Controls
                onImport={handleSvgImport}
                onColorChange={(color) => updateElement(selectedElementIndex, { fill: color })}
                onDelete={() => deleteElement(selectedElementIndex)}
                onExport={exportSVG}
                selectedElement={elements[selectedElementIndex]}
            />
            <svg
                className='svg-container'
                ref={svgRef}
                width="800"
                height="600"
                style={{ border: '1px solid black' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleSvgClick}
            >
                {elements.map((el, idx) => (
                    <DrawableElement
                        key={el.id}
                        element={el}
                        isSelected={idx === selectedElementIndex}
                        onSelect={() => setSelectedElementIndex(idx)}
                        onUpdate={(updates) => updateElement(idx, updates)}
                    />
                ))}
            </svg>
        </div>
    );
};

export default SvgCanvas;  

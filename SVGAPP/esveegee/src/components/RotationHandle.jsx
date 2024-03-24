import React, { useState, useEffect } from 'react';
import rotateIcon from '../images/rotation.png'; // Ensure the path to your rotate icon is correct

const RotationHandle = ({ element, onUpdate }) => {
    const [isRotating, setIsRotating] = useState(false);
    const [startAngle, setStartAngle] = useState(0); // Store the initial angle when rotation starts

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isRotating) return;

            const centerX = element.x + (element.width / 2 || 0);
            const centerY = element.y + (element.height / 2 || 0);
            const currentX = e.clientX;
            const currentY = e.clientY;
            const radians = Math.atan2(currentY - centerY, currentX - centerX);
            const currentAngle = radians * (180 / Math.PI);
            
            const angleDifference = currentAngle - startAngle; // Calculate the difference from the start angle
            const newAngle = (element.rotate || 0) + angleDifference; // Add the difference to the current rotation

            onUpdate({ rotate: newAngle });

            setStartAngle(currentAngle); 
        };

        const handleMouseUp = () => {
            setIsRotating(false);
        };

        if (isRotating) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isRotating, element, onUpdate, startAngle]);

    const startRotation = (e) => {
        e.stopPropagation();
        setIsRotating(true);

        const centerX = element.x + (element.width / 2 || 0);
        const centerY = element.y + (element.height / 2 || 0);
        const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const initialAngle = radians * (180 / Math.PI);

        setStartAngle(initialAngle);
    };

    // Calculate position for the rotation handle
    const handleX = element.x + (element.width / 2 || 0); // Adjusted to center of element
    const handleY = element.y - (element.height / 2 || element.r || 20); // Positioned above the element

    // Adjust width and height for the rotation handle icon
    const iconSize = 15; // Example size, adjust as needed

    return (
        <image
            href={rotateIcon}
            x={handleX - iconSize / 2} // Center the icon horizontally
            y={handleY - iconSize / 5} // Position the icon vertically above the element
            width={iconSize}
            height={iconSize}
            cursor="pointer"
            onMouseDown={startRotation}
        />
    );
};

export default RotationHandle;

import React from 'react';
import RotationHandle from './RotationHandle';

const DrawableElement = ({ element, isSelected, onSelect, onUpdate }) => {
    const { type, x, y, width, height, r, fill, rotate } = element;
    const props = {
        onClick: onSelect,
        fill,
        transform: rotate ? `rotate(${rotate} ${x + (width / 2 || 0)} ${y + (height / 2 || 0)})` : '',
    };

    let ElementComponent;
    switch (type) {
        case 'rect':
            ElementComponent = <rect {...props} x={x} y={y} width={width} height={height} />;
            break;
        case 'circle':
            ElementComponent = <circle {...props} cx={x} cy={y} r={r} />;
            break;
        
        default:
            ElementComponent = null;
    }

    return (
        <>
            {ElementComponent}
            {isSelected && <RotationHandle element={element} onUpdate={onUpdate} />}
        </>
    );
};

export default DrawableElement;

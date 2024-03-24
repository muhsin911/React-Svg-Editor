import React from "react";
import "./controls.css";

import deleteIcon from "../images/delete.png";
import exportIcon from "../images/export.png";
import importIcon from "../images/import.png";

// Component for SVG Canvas controls including import, color change, delete, and export functionality.
const Controls = ({
  onImport,
  onColorChange,
  onDelete,
  onExport,
  selectedElement,
}) => {
  return (
    <div className="controls-container">
      {/* Import button with hidden file input for importing SVG files */}
      <label htmlFor="import-file" className="button import-button tooltip">
        <img src={importIcon} alt="Import" />
        <span className="tooltip-text">Import SVG</span>
        <input
          type="file"
          id="import-file"
          accept=".svg"
          onChange={onImport}
          style={{ display: 'none' }}
        />
      </label>
      
      {/* Color picker for changing the color of the selected element */}
      <div className="color-input-wrapper tooltip"> 
        <input
          type="color"
          disabled={!selectedElement}
          onChange={(e) => onColorChange(e.target.value)}
          value={selectedElement ? selectedElement.fill : "#000000"}
          className="color-input"
          aria-label="Change Color"
        />
        <span className="tooltip-text">Change Color</span>
      </div>
      
      {/* Delete button for removing the selected element */}
      <button onClick={onDelete} disabled={!selectedElement} className="button delete-button tooltip" aria-label="Delete">
        <img src={deleteIcon} alt="Delete" />
        <span className="tooltip-text">Delete</span>
      </button>
      
      {/* Export button for saving the SVG canvas as an SVG file */}
      <button onClick={onExport} className="button export-button tooltip" aria-label="Export">
        <img src={exportIcon} alt="Export" />
        <span className="tooltip-text">Export SVG</span>
      </button>
    </div>
  );
};

export default Controls;

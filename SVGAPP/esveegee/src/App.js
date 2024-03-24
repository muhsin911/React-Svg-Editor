import React, { useState } from 'react';
import './App.css';
import SvgCanvas from './components/SvgCanvas';
import rectIcon from './images/rect.png';
import circleIcon from './images/circle.png';
import Footer from './components/Footer';
import Header from './components/Header';
import background from './images/background1.png';

function App() {
  const [currentTool, setCurrentTool] = useState('rect');
  
  // Define tools with their properties to iterate over
  const tools = [
    { id: 'rect', icon: rectIcon, label: 'Rectangle' },
    { id: 'circle', icon: circleIcon, label: 'Circle' },
    // Additional tools can be added here
  ];

  // Render a tool button for each tool
  const renderToolButton = (tool) => (
    <button key={tool.id} onClick={() => setCurrentTool(tool.id)} className="tool-button">
      <div className="tooltip">
        <img src={tool.icon} alt={tool.label} />
        <span className="tooltip-text">{tool.label}</span>
      </div>
    </button>
  );

  return (
    <div className="App" style={{ backgroundImage: `url(${background})` }}>
      <div className="tool-section">
        <div className="tool-buttons">
          {tools.map(renderToolButton)}
        </div>
      </div>
      <Header />
      <SvgCanvas currentTool={currentTool} />
      <Footer />
    </div>
  );
}

export default App;

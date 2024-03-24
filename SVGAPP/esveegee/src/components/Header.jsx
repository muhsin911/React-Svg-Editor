import React from 'react';
import './Header.css'; // Assuming you will create a CSS file for styling

// Import your project logo
import logo from '../images/logo.png'; // Adjust the path as needed

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
 
      </div>
      {/* Add additional navigation or header content here if needed */}
    </header>
  );
};

export default Header;
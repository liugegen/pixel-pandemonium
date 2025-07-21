// src/components/ColorPalette.jsx
import React from 'react';

// Daftar warna yang akan kita tampilkan
const COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

const ColorPalette = ({ selectedColor, onColorChange }) => {
  return (
    <div className="color-palette-container">
      {COLORS.map((color) => (
        <div
          key={color}
          className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
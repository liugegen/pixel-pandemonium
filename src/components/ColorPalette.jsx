import React from 'react';

const COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFB6C1', '#87CEEB', '#98FB98', '#F0E68C', '#DDA0DD',
  '#F5DEB3', '#FF7F50', '#40E0D0', '#EE82EE', '#90EE90'
];

const ColorPalette = ({ selectedColor, onColorChange }) => {
  return (
    <div className="color-palette-container">
      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
        🎨 Color Palette
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
        {COLORS.map((color) => (
          <div
            key={color}
            className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
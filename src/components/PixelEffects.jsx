import React, { useState, useEffect } from 'react';

const PixelEffects = () => {
  const [effects, setEffects] = useState([]);

  const addEffect = (type, position, color = '#00BFFF') => {
    const id = Date.now() + Math.random();
    const newEffect = {
      id,
      type,
      position,
      color,
      timestamp: Date.now()
    };
    
    setEffects(prev => [...prev, newEffect]);
    
    setTimeout(() => {
      setEffects(prev => prev.filter(effect => effect.id !== id));
    }, 1000);
  };

  useEffect(() => {
    window.addPixelEffect = addEffect;
    return () => {
      delete window.addPixelEffect;
    };
  }, []);

  return (
    <div className="pixel-effects-container">
      {effects.map(effect => (
        <div
          key={effect.id}
          className={`pixel-effect ${effect.type}`}
          style={{
            left: effect.position.x,
            top: effect.position.y,
            '--effect-color': effect.color
          }}
        >
          {effect.type === 'chaos' && '💥'}
          {effect.type === 'placement' && '✨'}
          {effect.type === 'notification' && effect.text}
        </div>
      ))}
    </div>
  );
};

export default PixelEffects;

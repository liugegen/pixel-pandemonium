import React, { useState, useEffect } from 'react';
import { useMultisynq } from './MultisynqProvider';
import { useAccount } from 'wagmi';

const PowerUps = () => {
  const [availablePowerUps, setAvailablePowerUps] = useState([]);
  const [userPowerUps, setUserPowerUps] = useState({});
  const [activePowerUps, setActivePowerUps] = useState({});
  const session = useMultisynq();
  const { address } = useAccount();

  const powerUpTypes = {
    PIXEL_SHIELD: {
      name: "🛡️ Pixel Shield",
      description: "Protect 5 pixels from chaos for 30 seconds",
      duration: 30000,
      cost: 10,
      cooldown: 60000,
      color: "#4CAF50"
    },
    COLOR_BOMB: {
      name: "💣 Color Bomb", 
      description: "Change 9 pixels in a 3x3 area at once",
      cost: 15,
      cooldown: 45000,
      color: "#FF5722"
    },
    CHAOS_IMMUNITY: {
      name: "✨ Chaos Immunity",
      description: "Your pixels can't be randomized for 20 seconds", 
      duration: 20000,
      cost: 20,
      cooldown: 90000,
      color: "#9C27B0"
    },
    RAINBOW_BRUSH: {
      name: "🌈 Rainbow Brush",
      description: "Next 5 pixels automatically rainbow",
      uses: 5,
      cost: 8,
      cooldown: 30000,
      color: "#FF9800"
    },
    PIXEL_MULTIPLIER: {
      name: "⚡ Pixel Multiplier",
      description: "Next pixel places 4 pixels at once",
      uses: 1,
      cost: 25,
      cooldown: 120000,
      color: "#2196F3"
    }
  };

  useEffect(() => {
    if (!session) return;

    const handlePowerUpUpdate = (data) => {
      setAvailablePowerUps(data.available || []);
      setUserPowerUps(data.userPowerUps || {});
      setActivePowerUps(data.active || {});
    };

    const handlePowerUpActivated = (data) => {
      if (data.playerAddress === address?.toLowerCase()) {
        // Show activation notification
        if (window.addPixelEffect) {
          window.addPixelEffect('notification', { x: window.innerWidth/2, y: 100 }, data.powerUp.color);
        }
      }
    };

    session.view.subscribe("powerUpScope", "powerUpUpdate", handlePowerUpUpdate);
    session.view.subscribe("powerUpScope", "powerUpActivated", handlePowerUpActivated);

    // Get initial power-ups
    if (session.model.userPowerUps) {
      const userKey = address?.toLowerCase();
      setUserPowerUps(session.model.userPowerUps[userKey] || {});
    }

    return () => {
      session.view.unsubscribe("powerUpScope", "powerUpUpdate", handlePowerUpUpdate);
      session.view.unsubscribe("powerUpScope", "powerUpActivated", handlePowerUpActivated);
    };
  }, [session, address]);

  const canAfford = (powerUpType) => {
    if (!session?.model?.playerStats || !address) return false;
    const stats = session.model.playerStats[address.toLowerCase()];
    return stats && stats.pixelsPlaced >= powerUpTypes[powerUpType].cost;
  };

  const isOnCooldown = (powerUpType) => {
    const userPowerUp = userPowerUps[powerUpType];
    if (!userPowerUp) return false;
    return Date.now() - userPowerUp.lastUsed < powerUpTypes[powerUpType].cooldown;
  };

  const buyPowerUp = (powerUpType) => {
    if (!session || !address || !canAfford(powerUpType) || isOnCooldown(powerUpType)) return;

    session.view.publish("powerUpScope", "buyPowerUp", {
      powerUpType,
      playerAddress: address,
      cost: powerUpTypes[powerUpType].cost
    });
  };

  const activatePowerUp = (powerUpType) => {
    if (!session || !address) return;
    
    const userPowerUp = userPowerUps[powerUpType];
    if (!userPowerUp || userPowerUp.quantity <= 0) return;

    session.view.publish("powerUpScope", "activatePowerUp", {
      powerUpType,
      playerAddress: address,
      config: powerUpTypes[powerUpType]
    });
  };

  const getCooldownTime = (powerUpType) => {
    const userPowerUp = userPowerUps[powerUpType];
    if (!userPowerUp) return 0;
    const cooldownLeft = powerUpTypes[powerUpType].cooldown - (Date.now() - userPowerUp.lastUsed);
    return Math.max(0, Math.ceil(cooldownLeft / 1000));
  };

  if (!session || !address) return null;

  return (
    <div className="power-ups-container">
      <h3>⚡ Power-Ups</h3>
      
      <div className="power-ups-grid">
        {Object.entries(powerUpTypes).map(([type, config]) => {
          const userPowerUp = userPowerUps[type];
          const quantity = userPowerUp?.quantity || 0;
          const affordable = canAfford(type);
          const onCooldown = isOnCooldown(type);
          const cooldownTime = getCooldownTime(type);
          const isActive = activePowerUps[`${address?.toLowerCase()}_${type}`];

          return (
            <div 
              key={type} 
              className={`power-up-card ${isActive ? 'active' : ''}`}
              style={{ '--power-up-color': config.color }}
            >
              <div className="power-up-header">
                <span className="power-up-name">{config.name}</span>
                {quantity > 0 && <span className="power-up-quantity">×{quantity}</span>}
              </div>
              
              <div className="power-up-description">
                {config.description}
              </div>
              
              <div className="power-up-cost">
                💰 {config.cost} pixels
              </div>
              
              <div className="power-up-actions">
                <button
                  onClick={() => buyPowerUp(type)}
                  disabled={!affordable || onCooldown}
                  className="buy-power-up-btn"
                >
                  {onCooldown ? `⏰ ${cooldownTime}s` : affordable ? '🛒 Beli' : '💸 Mahal'}
                </button>
                
                {quantity > 0 && (
                  <button
                    onClick={() => activatePowerUp(type)}
                    className="activate-power-up-btn"
                    disabled={isActive}
                  >
                    {isActive ? '✅ Aktif' : '🚀 Pakai'}
                  </button>
                )}
              </div>
              
              {isActive && config.duration && (
                <div className="power-up-timer">
                  Aktif: {Math.ceil((activePowerUps[`${address?.toLowerCase()}_${type}`] - Date.now()) / 1000)}s
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PowerUps;

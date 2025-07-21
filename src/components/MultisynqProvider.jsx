// src/components/MultisynqProvider.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useScript } from '../hooks/useScript';

const MultisynqContext = createContext(null);
export const useMultisynq = () => useContext(MultisynqContext);

export const MultisynqProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const status = useScript('https://cdn.jsdelivr.net/npm/@multisynq/client@1.0.4/bundled/multisynq-client.min.js');
  const initialized = useRef(false);

  useEffect(() => {
    if (status === 'ready' && !initialized.current) {
      initialized.current = true;
      
      const init = async () => {
        try {
          if (!window.Multisynq) throw new Error("window.Multisynq is not defined.");

          const { Model } = window.Multisynq;
          const GRID_SIZE = 32;
          const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;
          // Definisikan palet warna di sini agar Model bisa mengaksesnya
          const CHAOS_COLORS = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
          ];

          class CanvasModel extends Model {
            init() {
              this.pixels = Array(PIXEL_COUNT).fill('#FFFFFF');
              this.playerStats = {}; // Track player statistics
              this.totalPixels = 0; // Total pixels placed
              this.chatMessages = []; // Store chat messages
              this.currentEvent = null; // Current active event
              this.eventTimeLeft = 0; // Time left for current event
              this.eventTimer = null; // Timer for events
              this.userPowerUps = {}; // User power-ups inventory
              this.activePowerUps = {}; // Currently active power-ups
              this.nftMints = []; // NFT mint history
              this.protectedPixels = {}; // Pixels protected by shields
              this.subscribe("canvasScope", "setPixel", this.onSetPixel);
              this.subscribe("chatScope", "sendMessage", this.onSendMessage);
              this.subscribe("eventScope", "triggerEvent", this.onTriggerEvent);
              this.subscribe("powerUpScope", "buyPowerUp", this.onBuyPowerUp);
              this.subscribe("powerUpScope", "activatePowerUp", this.onActivatePowerUp);
              this.subscribe("nftScope", "mintNFT", this.onMintNFT);
              
              // Auto-trigger random events every 2-5 minutes
              this.scheduleNextEvent();
            }
            
            // INILAH PERUBAHANNYA: LOGIKA "KACAU"
            onSetPixel(data) {
              // Update player statistics
              const playerAddress = data.playerAddress?.toLowerCase();
              if (playerAddress) {
                if (!this.playerStats[playerAddress]) {
                  this.playerStats[playerAddress] = { pixelsPlaced: 0 };
                }
                
                // Check for double points event
                const multiplier = (this.currentEvent?.effect === 'double') ? 2 : 1;
                this.playerStats[playerAddress].pixelsPlaced += multiplier;
                this.totalPixels += multiplier;
              }

              // 1. Gambar pixel yang diinginkan pengguna
              this.pixels[data.index] = data.color;

              // 2. Skip chaos if freeze event is active
              if (this.currentEvent?.effect === 'freeze') {
                this.publish("canvasScope", "pixelsUpdated", this.pixels);
                this.publish("canvasScope", "statsUpdated", {
                  playerStats: this.playerStats,
                  totalPixels: this.totalPixels
                });
                return;
              }

              // 3. Determine chaos multiplier based on events
              let chaosMultiplier = 1;
              if (this.currentEvent?.multiplier) {
                chaosMultiplier = this.currentEvent.multiplier;
              }

              // 4. Apply chaos with multiplier
              for (let i = 0; i < chaosMultiplier; i++) {
                const randomIndex = Math.floor(Math.random() * PIXEL_COUNT);
                
                // Check if pixel is protected by shield
                if (this.protectedPixels[randomIndex] && this.protectedPixels[randomIndex] > Date.now()) {
                  continue; // Skip protected pixels
                }
                
                let randomColor;
                if (this.currentEvent?.effect === 'rainbow') {
                  // Rainbow mode: use rainbow colors
                  const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
                  randomColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
                } else {
                  // Normal chaos colors
                  randomColor = CHAOS_COLORS[Math.floor(Math.random() * CHAOS_COLORS.length)];
                }
                
                this.pixels[randomIndex] = randomColor;
              }

              // 5. Kirim (publish) kanvas yang sudah "kacau" ke semua pengguna
              this.publish("canvasScope", "pixelsUpdated", this.pixels);
              
              // 6. Update statistics
              this.publish("canvasScope", "statsUpdated", {
                playerStats: this.playerStats,
                totalPixels: this.totalPixels
              });
            }

            onSendMessage(messageData) {
              // Add message to chat history
              this.chatMessages.push(messageData);
              
              // Keep only last 50 messages to prevent memory issues
              if (this.chatMessages.length > 50) {
                this.chatMessages = this.chatMessages.slice(-50);
              }
              
              // Broadcast message to all clients
              this.publish("chatScope", "newMessage", messageData);
            }

            onTriggerEvent(eventData) {
              // Don't start new event if one is already active
              if (this.currentEvent) return;
              
              this.currentEvent = eventData.config;
              this.currentEvent.type = eventData.type;
              this.eventTimeLeft = eventData.config.duration;
              
              // Notify all clients that event started
              this.publish("eventScope", "eventStart", this.currentEvent);
              
              // Start event timer
              this.startEventTimer();
              
              // Special event effects
              if (eventData.type === 'PIXEL_RAIN') {
                this.startPixelRain();
              }
            }

            startEventTimer() {
              if (this.eventTimer) {
                clearInterval(this.eventTimer);
              }
              
              this.eventTimer = setInterval(() => {
                this.eventTimeLeft -= 1000;
                
                // Update time left
                this.publish("eventScope", "eventUpdate", { timeLeft: this.eventTimeLeft });
                
                if (this.eventTimeLeft <= 0) {
                  this.endEvent();
                }
              }, 1000);
            }

            endEvent() {
              if (this.eventTimer) {
                clearInterval(this.eventTimer);
                this.eventTimer = null;
              }
              
              this.currentEvent = null;
              this.eventTimeLeft = 0;
              
              // Notify all clients that event ended
              this.publish("eventScope", "eventEnd", {});
              
              // Schedule next event
              this.scheduleNextEvent();
            }

            scheduleNextEvent() {
              // Schedule next event in 2-5 minutes (for demo: 30-60 seconds)
              const delay = 30000 + Math.random() * 30000; // 30-60 seconds
              
              setTimeout(() => {
                if (!this.currentEvent) { // Only trigger if no event is active
                  const eventTypes = ['CHAOS_HOUR', 'RAINBOW_MODE', 'PIXEL_RAIN', 'DOUBLE_POINTS', 'FREEZE_CHAOS'];
                  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                  
                  const eventConfigs = {
                    CHAOS_HOUR: { name: "💥 Chaos Hour", description: "Kekacauan 3x lipat!", duration: 60000, color: "#ff4757", multiplier: 3 },
                    RAINBOW_MODE: { name: "🌈 Rainbow Mode", description: "Semua pixel berubah jadi warna rainbow!", duration: 45000, color: "#ffa726", effect: "rainbow" },
                    PIXEL_RAIN: { name: "🌧️ Pixel Rain", description: "Pixel acak turun dari atas!", duration: 30000, color: "#26a69a", effect: "rain" },
                    DOUBLE_POINTS: { name: "⚡ Double Points", description: "Statistik pixel dihitung 2x lipat!", duration: 90000, color: "#42a5f5", effect: "double" },
                    FREEZE_CHAOS: { name: "❄️ Freeze Chaos", description: "Tidak ada kekacauan pixel!", duration: 60000, color: "#66bb6a", effect: "freeze" }
                  };
                  
                  this.onTriggerEvent({
                    type: randomType,
                    config: eventConfigs[randomType]
                  });
                }
              }, delay);
            }

            startPixelRain() {
              // Create pixel rain effect every 2 seconds during the event
              const rainInterval = setInterval(() => {
                if (!this.currentEvent || this.currentEvent.effect !== 'rain') {
                  clearInterval(rainInterval);
                  return;
                }
                
                // Rain effect: change top row pixels randomly
                for (let i = 0; i < GRID_SIZE; i++) {
                  if (Math.random() < 0.3) { // 30% chance for each top pixel
                    const rainColor = CHAOS_COLORS[Math.floor(Math.random() * CHAOS_COLORS.length)];
                    this.pixels[i] = rainColor;
                  }
                }
                
                this.publish("canvasScope", "pixelsUpdated", this.pixels);
              }, 2000);
            }

            onBuyPowerUp(data) {
              const { powerUpType, playerAddress, cost } = data;
              const playerKey = playerAddress.toLowerCase();
              
              // Check if player has enough pixels
              if (!this.playerStats[playerKey] || this.playerStats[playerKey].pixelsPlaced < cost) {
                return;
              }
              
              // Deduct cost
              this.playerStats[playerKey].pixelsPlaced -= cost;
              
              // Add power-up to inventory
              if (!this.userPowerUps[playerKey]) {
                this.userPowerUps[playerKey] = {};
              }
              if (!this.userPowerUps[playerKey][powerUpType]) {
                this.userPowerUps[playerKey][powerUpType] = { quantity: 0, lastUsed: 0 };
              }
              
              this.userPowerUps[playerKey][powerUpType].quantity++;
              this.userPowerUps[playerKey][powerUpType].lastUsed = Date.now();
              
              // Update all clients
              this.publish("powerUpScope", "powerUpUpdate", {
                userPowerUps: this.userPowerUps[playerKey],
                active: this.activePowerUps
              });
              
              this.publish("canvasScope", "statsUpdated", {
                playerStats: this.playerStats,
                totalPixels: this.totalPixels
              });
            }

            onActivatePowerUp(data) {
              const { powerUpType, playerAddress, config } = data;
              const playerKey = playerAddress.toLowerCase();
              
              // Check if player has the power-up
              if (!this.userPowerUps[playerKey] || 
                  !this.userPowerUps[playerKey][powerUpType] || 
                  this.userPowerUps[playerKey][powerUpType].quantity <= 0) {
                return;
              }
              
              // Consume power-up
              this.userPowerUps[playerKey][powerUpType].quantity--;
              
              // Activate power-up
              const activationKey = `${playerKey}_${powerUpType}`;
              if (config.duration) {
                this.activePowerUps[activationKey] = Date.now() + config.duration;
                
                // Auto-deactivate after duration
                setTimeout(() => {
                  delete this.activePowerUps[activationKey];
                  this.publish("powerUpScope", "powerUpUpdate", {
                    userPowerUps: this.userPowerUps[playerKey],
                    active: this.activePowerUps
                  });
                }, config.duration);
              }
              
              // Special power-up effects
              if (powerUpType === 'PIXEL_SHIELD') {
                // Protect 5 random pixels
                for (let i = 0; i < 5; i++) {
                  const randomIndex = Math.floor(Math.random() * PIXEL_COUNT);
                  this.protectedPixels[randomIndex] = Date.now() + config.duration;
                }
              }
              
              // Notify activation
              this.publish("powerUpScope", "powerUpActivated", {
                powerUpType,
                playerAddress,
                powerUp: config
              });
              
              this.publish("powerUpScope", "powerUpUpdate", {
                userPowerUps: this.userPowerUps[playerKey],
                active: this.activePowerUps
              });
            }

            onMintNFT(nftData) {
              this.nftMints.unshift(nftData);
              
              // Keep only last 50 NFTs
              if (this.nftMints.length > 50) {
                this.nftMints = this.nftMints.slice(0, 50);
              }
              
              this.publish("nftScope", "nftMinted", nftData);
            }
          }
          
          CanvasModel.register("CanvasModel");
          
          const croquetSession = await window.Multisynq.Session.join({
            appId: import.meta.env.VITE_CROQUET_APP_ID,
            apiKey: import.meta.env.VITE_CROQUET_API_KEY,
            name: "pixel-pandemonium-session",
            password: "the-final-architecture-works",
            model: CanvasModel,
          });

          console.log("SUCCESS: Multisynq session initialized!");
          setSession(croquetSession);

        } catch (err) {
          console.error("FATAL: Could not initialize session", err);
          setError(err.message);
        }
      };
      init();
    } else if (status === 'error') {
      setError("Failed to load the Multisynq script.");
    }
  }, [status]);

  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Loading & Initializing Session...</div>;

  return (
    <MultisynqContext.Provider value={session}>
      {children}
    </MultisynqContext.Provider>
  );
};
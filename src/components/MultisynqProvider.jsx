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
              this.subscribe("canvasScope", "setPixel", this.onSetPixel);
            }
            
            // INILAH PERUBAHANNYA: LOGIKA "KACAU"
            onSetPixel(data) {
              // 1. Gambar pixel yang diinginkan pengguna
              this.pixels[data.index] = data.color;

              // 2. Buat kekacauan! Pilih satu pixel acak
              const randomIndex = Math.floor(Math.random() * PIXEL_COUNT);
              
              // 3. Pilih satu warna acak dari daftar
              const randomColor = CHAOS_COLORS[Math.floor(Math.random() * CHAOS_COLORS.length)];

              // 4. Ubah pixel acak tersebut dengan warna acak
              this.pixels[randomIndex] = randomColor;

              // 5. Kirim (publish) kanvas yang sudah "kacau" ke semua pengguna
              this.publish("canvasScope", "pixelsUpdated", this.pixels);
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
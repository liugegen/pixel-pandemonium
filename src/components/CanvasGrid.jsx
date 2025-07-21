// src/components/CanvasGrid.jsx
import React, { useState, useEffect } from 'react';
import { useMultisynq } from './MultisynqProvider';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { contractAddress, contractABI } from '../contracts/pixelPayment';

const GRID_SIZE = 32;
const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;

const CanvasGrid = ({ selectedColor }) => { 
  const [pixels, setPixels] = useState(Array(PIXEL_COUNT).fill('#FFFFFF'));
  const [statusMessage, setStatusMessage] = useState('');
  const session = useMultisynq();
  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    if (!session) return;
    const handleUpdate = (updatedPixels) => setPixels([...updatedPixels]);
    session.view.subscribe("canvasScope", "pixelsUpdated", handleUpdate);
    setPixels([...session.model.pixels]);
    return () => session.view.unsubscribe("canvasScope", "pixelsUpdated", handleUpdate);
  }, [session]);

  const handlePixelClick = (index) => {
    if (!session) {
      setStatusMessage("Sesi kolaboratif belum siap.");
      return;
    }
    setStatusMessage("Menyiapkan transaksi...");
    
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'placePixel',
      value: parseEther('0.00001'),
    }, {
      onSuccess: () => {
        setStatusMessage("Transaksi berhasil! Mengirim pixel...");
        session.view.publish("canvasScope", "setPixel", { index, color: selectedColor });
      },
      onError: (err) => {
        setStatusMessage(`Transaksi gagal: ${err.shortMessage || err.message}`);
      }
    });
  };

  useEffect(() => {
    if (isPending) {
      setStatusMessage("Menunggu konfirmasi di wallet Anda...");
    }
  }, [isPending]);

  return (
    <>
      <p className="status-message">{statusMessage}</p>
      <div className="canvas-container">
        <div className="canvas-grid">
          {pixels.map((color, index) => (
            <div
              key={index}
              className="pixel"
              style={{ backgroundColor: color }}
              onClick={() => handlePixelClick(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default CanvasGrid;
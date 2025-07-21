import React, { useState, useEffect, useRef } from 'react';
import { useMultisynq } from './MultisynqProvider';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { contractAddress, contractABI } from '../contracts/pixelPayment';
import { useAccount } from 'wagmi';

const GRID_SIZE = 32;
const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;

const CanvasGrid = ({ selectedColor }) => { 
  const [pixels, setPixels] = useState(Array(PIXEL_COUNT).fill('#FFFFFF'));
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [animatingPixels, setAnimatingPixels] = useState(new Set());
  const session = useMultisynq();
  const { writeContract, isPending } = useWriteContract();
  const { address } = useAccount();
  const lastPlacedPixel = useRef(null);

  useEffect(() => {
    if (!session) return;
    const handleUpdate = (updatedPixels) => {
      const previousPixels = pixels;
      const changedIndices = [];
      
      updatedPixels.forEach((color, index) => {
        if (previousPixels[index] !== color) {
          changedIndices.push(index);
        }
      });
      
      changedIndices.forEach(index => {
        if (index !== lastPlacedPixel.current) {
          const pixelElement = document.querySelector(`.pixel[data-index="${index}"]`);
          if (pixelElement) {
            pixelElement.classList.add('chaos-target');
            setTimeout(() => {
              pixelElement.classList.remove('chaos-target');
            }, 500);
            
            const rect = pixelElement.getBoundingClientRect();
            if (window.addPixelEffect) {
              window.addPixelEffect('chaos', {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              });
            }
          }
        }
      });
      
      setPixels([...updatedPixels]);
    };
    
    session.view.subscribe("canvasScope", "pixelsUpdated", handleUpdate);
    setPixels([...session.model.pixels]);
    return () => session.view.unsubscribe("canvasScope", "pixelsUpdated", handleUpdate);
  }, [session, pixels]);

  const handlePixelClick = (index) => {
    if (!session) {
      setStatusMessage("Collaborative session not ready.");
      setStatusType('error');
      return;
    }
    
    const pixelElement = document.querySelector(`.pixel[data-index="${index}"]`);
    if (pixelElement) {
      pixelElement.classList.add('placing');
      setTimeout(() => {
        pixelElement.classList.remove('placing');
      }, 300);
    }
    
    setStatusMessage("Preparing transaction...");
    setStatusType('pending');
    lastPlacedPixel.current = index;
    
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'placePixel',
      value: parseEther('0.00001'),
    }, {
      onSuccess: () => {
        setStatusMessage("Transaction successful! Sending pixel...");
        setStatusType('success');
        
        if (pixelElement) {
          const rect = pixelElement.getBoundingClientRect();
          if (window.addPixelEffect) {
            window.addPixelEffect('placement', {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            }, selectedColor);
          }
        }
        
        session.view.publish("canvasScope", "setPixel", { 
          index, 
          color: selectedColor, 
          playerAddress: address 
        });
        
        setTimeout(() => {
          setStatusMessage("");
          setStatusType('');
        }, 2000);
      },
      onError: (err) => {
        setStatusMessage(`Transaction failed: ${err.shortMessage || err.message}`);
        setStatusType('error');
        
        setTimeout(() => {
          setStatusMessage("");
          setStatusType('');
        }, 3000);
      }
    });
  };

  useEffect(() => {
    if (isPending) {
      setStatusMessage("Waiting for wallet confirmation...");
      setStatusType('pending');
    }
  }, [isPending]);

  return (
    <>
      {statusMessage && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}
      <div className="canvas-container">
        <div className="canvas-grid">
          {pixels.map((color, index) => (
            <div
              key={index}
              data-index={index}
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
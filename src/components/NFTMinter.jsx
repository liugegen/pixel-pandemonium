import React, { useState, useEffect } from 'react';
import { useMultisynq } from './MultisynqProvider';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { pixelNFTAddress, pixelNFTABI } from '../contracts/pixelNFT';
import { uploadImageToIPFS, uploadMetadataToIPFS } from '../utils/ipfs';

const NFTMinter = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [mintHistory, setMintHistory] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStep, setMintingStep] = useState('');
  const [lastTxHash, setLastTxHash] = useState(null);
  const session = useMultisynq();
  const { address } = useAccount();
  const { writeContract, isPending, data: txHash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess && lastTxHash) {
      setMintingStep('✅ NFT successfully minted!');
      setIsMinting(false);
      setCapturedImage(null);
      setLastTxHash(null);
      
      if (window.addPixelEffect) {
        window.addPixelEffect('notification', { 
          x: window.innerWidth/2, 
          y: 100,
          text: '🎉 NFT Minted!' 
        });
      }
    }
  }, [isSuccess, lastTxHash]);

  useEffect(() => {
    if (!session) return;

    const handleNFTMinted = (data) => {
      setMintHistory(prev => [data, ...prev].slice(0, 10));
    };

    session.view.subscribe("nftScope", "nftMinted", handleNFTMinted);

    if (session.model.nftMints) {
      setMintHistory(session.model.nftMints.slice(0, 10));
    }

    return () => {
      session.view.unsubscribe("nftScope", "nftMinted", handleNFTMinted);
    };
  }, [session]);

  const captureCanvas = () => {
    setIsCapturing(true);
    
    const canvas = document.querySelector('.canvas-grid');
    if (!canvas) {
      alert('Canvas not found!');
      setIsCapturing(false);
      return;
    }

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    const GRID_SIZE = 32;
    const PIXEL_SIZE = 8;
    
    tempCanvas.width = GRID_SIZE * PIXEL_SIZE;
    tempCanvas.height = GRID_SIZE * PIXEL_SIZE;

    const pixels = document.querySelectorAll('.pixel');
    
    pixels.forEach((pixel, index) => {
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      const color = pixel.style.backgroundColor || '#FFFFFF';
      
      ctx.fillStyle = color;
      ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    });

    const imageData = tempCanvas.toDataURL('image/png');
    setCapturedImage(imageData);
    setIsCapturing(false);
  };

  const mintNFT = async () => {
    if (!capturedImage || !address || !session) return;

    setIsMinting(true);
    setMintingStep('📤 Uploading image to IPFS...');

    try {
      // Step 1: Upload image to IPFS
      const imageUrl = await uploadImageToIPFS(capturedImage);
      console.log('Image uploaded to IPFS:', imageUrl);
      
      setMintingStep('📝 Creating metadata...');
      
      // Step 2: Create metadata
      const metadata = {
        name: `Pixel Pandemonium #${Date.now()}`,
        description: `Captured chaos from the collaborative canvas at ${new Date().toLocaleString()}. A unique piece of digital art born from the pandemonium of collaborative creativity.`,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Canvas Size",
            value: "32x32"
          },
          {
            trait_type: "Created On",
            value: "Monad Testnet"
          },
          {
            trait_type: "Creator",
            value: address
          },
          {
            trait_type: "Timestamp",
            value: new Date().toISOString()
          },
          {
            trait_type: "Game",
            value: "Pixel Pandemonium"
          }
        ],
        external_url: "https://pixel-pandemonium.vercel.app/"
      };

      setMintingStep('📤 Uploading metadata to IPFS...');
      
      // Step 3: Upload metadata to IPFS
      const metadataUrl = await uploadMetadataToIPFS(metadata);
      console.log('Metadata uploaded to IPFS:', metadataUrl);
      
      setMintingStep('💰 Preparing blockchain transaction...');
      
      // Step 4: Mint NFT on blockchain
      setLastTxHash(null);
      writeContract({
        address: pixelNFTAddress,
        abi: pixelNFTABI,
        functionName: 'mintPixelArt',
        args: [metadataUrl],
        value: parseEther('0.001'), // 0.001 MON mint fee
      });
      
      setMintingStep('⏳ Waiting for wallet confirmation...');

    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintingStep(`❌ Error: ${error.message}`);
      setIsMinting(false);
      
      // Show error notification
      if (window.addPixelEffect) {
        window.addPixelEffect('notification', { 
          x: window.innerWidth/2, 
          y: 100,
          text: '❌ Mint Failed!' 
        });
      }
      
      setTimeout(() => {
        setMintingStep('');
      }, 5000);
    }
  };

  const downloadImage = () => {
    if (!capturedImage) return;
    
    const link = document.createElement('a');
    link.download = `pixel-pandemonium-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
  };

  // Update minting step when transaction is pending
  useEffect(() => {
    if (isPending) {
      setMintingStep('⛓️ Transaction submitted! Waiting for confirmation...');
      setLastTxHash(txHash);
    }
  }, [isPending, txHash]);

  // Update minting step when confirming
  useEffect(() => {
    if (isConfirming) {
      setMintingStep('⏳ Confirming transaction on blockchain...');
    }
  }, [isConfirming]);

  if (!session || !address) return null;

  return (
    <div className="nft-minter-container">
      <h3>🖼️ NFT Pixel Art</h3>
      
      <div className="nft-actions">
        <button 
          onClick={captureCanvas}
          disabled={isCapturing}
          className="capture-btn"
        >
          {isCapturing ? '📸 Capturing...' : '📸 Capture Canvas'}
        </button>
        
        {capturedImage && (
          <div className="captured-preview">
            <img src={capturedImage} alt="Captured canvas" className="preview-image" />
            <div className="preview-actions">
              <button onClick={downloadImage} className="download-btn">
                💾 Download
              </button>
              <button 
                onClick={mintNFT} 
                disabled={isMinting || isPending || isConfirming}
                className="mint-btn"
              >
                {isMinting || isPending || isConfirming ? '⏳ Minting...' : '🚀 Mint NFT (0.001 MON)'}
              </button>
            </div>
            {(isMinting || isPending || isConfirming || mintingStep) && (
              <div className="minting-status">
                {mintingStep}
              </div>
            )}
          </div>
        )}
      </div>

      {mintHistory.length > 0 && (
        <div className="nft-history">
          <h4>📜 NFT History</h4>
          <div className="nft-grid">
            {mintHistory.map((nft) => (
              <div key={nft.id} className="nft-card">
                <img src={nft.imageData} alt={nft.name} className="nft-thumbnail" />
                <div className="nft-info">
                  <div className="nft-name">{nft.name}</div>
                  <div className="nft-creator">
                    By: {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                  </div>
                  <div className="nft-date">
                    {new Date(nft.mintedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMinter;

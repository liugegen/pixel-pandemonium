// src/utils/ipfs.js
// Utility untuk upload ke IPFS menggunakan Pinata

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;

export const uploadImageToIPFS = async (imageDataUrl) => {
  try {
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, `pixel-art-${Date.now()}.png`);
    
    // Upload to Pinata IPFS
    const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to IPFS');
    }
    
    const result = await uploadResponse.json();
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: JSON.stringify(metadata)
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload metadata to IPFS');
    }
    
    const result = await uploadResponse.json();
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    
  } catch (error) {
    console.error('Metadata IPFS upload error:', error);
    throw error;
  }
};

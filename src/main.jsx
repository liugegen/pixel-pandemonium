import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// RainbowKit and Wagmi imports
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Import the 'defineChain' utility from viem
import { defineChain } from 'viem';

// 1. Define your custom chain (Monad Testnet)
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});


// 2. Create a Wagmi config, loading the projectId from the .env file
const config = getDefaultConfig({
  appName: 'Pixel Pandemonium',
  // Securely access the environment variable
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [monadTestnet],
  ssr: false, // Set to false for client-side rendered apps
});

const queryClient = new QueryClient();

// 3. Render the App with all the providers
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Add the locale prop here to force English language */}
        <RainbowKitProvider locale="en-US">
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);

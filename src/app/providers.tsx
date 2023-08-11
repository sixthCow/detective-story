'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';

import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {zoraTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import {injectedWallet} from '@rainbow-me/rainbowkit/wallets';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

 const modeTestnet= {
   id: 919,
   name: "Mode Goerli Testnet",
   network: "Mode-testnet",
   nativeCurrency: {
       decimals: 18,
       name: "Mode Goerli",
       symbol: "ETH",
  },
   rpcUrls: {
       default: {
           http:  ["https://sepolia.mode.network"],
           webSocket:  ["wss://sepolia.mode.network"],
      },
       public: {
           http:  ["https://sepolia.mode.network"],
           webSocket:  ["wss://sepolia.mode.network"],
      },
  },
   blockExplorers: {
       etherscan: {
           name: "Mode",
           url: "https://sepolia.explorer.mode.network/",
      },
       default: {
           name: "Mode",
           url: "https://sepolia.explorer.mode.network/",
      },
  },
  
}


const { chains, publicClient, webSocketPublicClient } = configureChains(
  [zoraTestnet, modeTestnet],
  [publicProvider()]
);



const demoAppInfo = {
  appName: 'detective',
};

const connectors = connectorsForWallets([

  {
    groupName: 'recommended',
    wallets: [
        injectedWallet({ chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} appInfo={demoAppInfo}>
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
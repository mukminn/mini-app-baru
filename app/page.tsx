'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppKitAccount } from '@reown/appkit/react';

// Dynamic imports for better code splitting and mobile performance
const WalletButton = dynamic(() => import('@/components/WalletButton'), {
  ssr: false,
  loading: () => (
    <div className="w-48 h-12 bg-gray-700 rounded-lg animate-pulse" />
  ),
});

const TokenInfo = dynamic(() => import('@/components/TokenInfo'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-700 rounded w-3/4" />
    </div>
  ),
});

const TokenActions = dynamic(() => import('@/components/TokenActions'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-4" />
      <div className="h-10 bg-gray-700 rounded w-full mb-4" />
      <div className="h-10 bg-gray-700 rounded w-full" />
    </div>
  ),
});

// Lazy load ethers only when needed
let ethers: typeof import('ethers') | null = null;
const getEthers = async () => {
  if (!ethers) {
    ethers = await import('ethers');
  }
  return ethers;
};

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const [ethersProvider, setEthersProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [contractAddress] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isConnected && address && typeof window !== 'undefined' && window.ethereum) {
      // Lazy load ethers only when wallet is connected
      getEthers().then((ethersModule) => {
        try {
          const ethersProv = new ethersModule.BrowserProvider(window.ethereum as any);
          ethersProv.getSigner().then((sig: any) => {
            setEthersProvider(ethersProv);
            setSigner(sig);
          }).catch(() => {
            setEthersProvider(null);
            setSigner(null);
          });
        } catch {
          setEthersProvider(null);
          setSigner(null);
        }
      });
    } else {
      setEthersProvider(null);
      setSigner(null);
    }
  }, [isConnected, address]);

  const handleConnect = async (address: string) => {
    // Connection handled by AppKit
  };

  const handleDisconnect = () => {
    // Disconnection handled by AppKit
  };

  const handleTransactionComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-base-dark via-purple-900 to-base-dark p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            BaseToken dApp
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            Interact with your ERC20 token on Base blockchain
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span>🔐 One login for all of web3</span>
            <span>💼 A home for your digital assets</span>
            <span>🌐 Your gateway to a new web</span>
          </div>
        </div>

        {/* Network Switcher - AppKit handles this automatically */}

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletButton
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Info */}
          <div key={refreshKey}>
            <TokenInfo
              provider={ethersProvider}
              signer={signer}
              userAddress={address || null}
            />
          </div>

          {/* Token Actions */}
          <TokenActions
            signer={signer}
            userAddress={address || null}
            contractAddress={contractAddress}
            onTransactionComplete={handleTransactionComplete}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Built for Base blockchain • Powered by ethers.js & Next.js</p>
        </div>
      </div>
    </main>
  );
}

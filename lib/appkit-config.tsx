'use client';

import { AppKitProvider } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { base, baseSepolia } from '@reown/appkit/networks';
import { ReactNode } from 'react';

/**
 * Reown AppKit Configuration
 * Get your Project ID from: https://dashboard.reown.com
 */

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'fa10325c22836e4627c2321df96159fd';

const metadata = {
  name: 'BaseToken dApp',
  description: 'Mini dApp for BaseToken ERC20 on Base blockchain',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: [],
};

const ethersAdapter = new EthersAdapter();

// AppKit Provider Component
export function AppKitProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AppKitProvider
      adapters={[ethersAdapter]}
      networks={[base, baseSepolia]}
      projectId={projectId}
      metadata={metadata}
      features={{
        analytics: false,
        email: false,
        socials: [],
      }}
      themeMode="dark"
    >
      {children}
    </AppKitProvider>
  );
}

export { ethersAdapter };

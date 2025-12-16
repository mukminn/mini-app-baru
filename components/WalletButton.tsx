'use client';

import { AppKitButton } from '@reown/appkit/react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useEffect } from 'react';

interface WalletButtonProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export default function WalletButton({
  onConnect,
  onDisconnect,
}: WalletButtonProps) {
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) {
      onConnect(address);
    } else if (!isConnected) {
      onDisconnect();
    }
  }, [isConnected, address, onConnect, onDisconnect]);

  return <AppKitButton />;
}

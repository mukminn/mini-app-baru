import { ethers } from 'ethers';

// Wallet connection now handled by Reown AppKit
// See components/WalletButton.tsx and lib/appkit-config.tsx

export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: bigint, decimals: number = 18) => {
  return ethers.formatUnits(balance, decimals);
};

export const parseAmount = (amount: string, decimals: number = 18) => {
  return ethers.parseUnits(amount, decimals);
};

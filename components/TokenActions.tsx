'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { getContractWithSigner } from '@/lib/contract';
import { parseAmount, formatBalance } from '@/lib/wallet';
import {
  validateTransaction,
  sanitizeAddress,
  safeParseAmount,
  sanitizeError,
  detectAttackPattern,
  transactionRateLimiter,
} from '@/lib/security';

interface TokenActionsProps {
  signer: ethers.Signer | null;
  userAddress: string | null;
  contractAddress: string;
  onTransactionComplete: () => void;
}

export default function TokenActions({
  signer,
  userAddress,
  contractAddress,
  onTransactionComplete,
}: TokenActionsProps) {
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'transfer' | 'mint' | 'burn'>(
    'transfer'
  );

  const handleTransfer = async () => {
    // Security: Rate limiting
    if (!userAddress || !transactionRateLimiter.isAllowed(userAddress)) {
      alert('Too many requests. Please wait a moment before trying again.');
      return;
    }

    // Security: Input validation
    if (!signer || !transferTo || !transferAmount) {
      alert('Please fill all fields');
      return;
    }

    // Security: Detect attack patterns
    if (detectAttackPattern(transferTo) || detectAttackPattern(transferAmount)) {
      alert('Invalid input detected. Please check your inputs.');
      return;
    }

    // Security: Validate transaction
    const validation = validateTransaction(transferTo, transferAmount, userAddress);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      setLoading(true);
      
      // Security: Sanitize inputs
      const sanitizedTo = sanitizeAddress(transferTo);
      if (!sanitizedTo) {
        alert('Invalid recipient address');
        setLoading(false);
        return;
      }
      
      const parsedAmount = safeParseAmount(transferAmount);
      if (!parsedAmount) {
        alert('Invalid amount format');
        setLoading(false);
        return;
      }

      const contract = getContractWithSigner(signer, contractAddress);
      const tx = await contract.transfer(sanitizedTo, parsedAmount);
      
      // Wait for confirmation
      await tx.wait();

      alert('Transfer successful!');
      setTransferTo('');
      setTransferAmount('');
      onTransactionComplete();
    } catch (error: any) {
      console.error('Transfer error:', error);
      // Security: Sanitize error message
      const safeError = sanitizeError(error);
      alert(`Transfer failed: ${safeError}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    // Security: Rate limiting
    if (!userAddress || !transactionRateLimiter.isAllowed(userAddress)) {
      alert('Too many requests. Please wait a moment before trying again.');
      return;
    }

    // Security: Input validation
    if (!signer || !mintTo || !mintAmount) {
      alert('Please fill all fields');
      return;
    }

    // Security: Detect attack patterns
    if (detectAttackPattern(mintTo) || detectAttackPattern(mintAmount)) {
      alert('Invalid input detected. Please check your inputs.');
      return;
    }

    // Security: Validate address
    if (!sanitizeAddress(mintTo)) {
      alert('Invalid recipient address');
      return;
    }

    // Security: Validate amount
    const amountValidation = safeParseAmount(mintAmount);
    if (!amountValidation) {
      alert('Invalid amount format');
      return;
    }

    try {
      setLoading(true);
      
      // Security: Sanitize inputs
      const sanitizedTo = sanitizeAddress(mintTo);
      if (!sanitizedTo) {
        alert('Invalid recipient address');
        setLoading(false);
        return;
      }
      
      const parsedAmount = amountValidation;

      const contract = getContractWithSigner(signer, contractAddress);
      const tx = await contract.mint(sanitizedTo, parsedAmount);
      await tx.wait();

      alert('Mint successful!');
      setMintTo('');
      setMintAmount('');
      onTransactionComplete();
    } catch (error: any) {
      console.error('Mint error:', error);
      // Security: Sanitize error message
      const safeError = sanitizeError(error);
      alert(`Mint failed: ${safeError}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    // Security: Rate limiting
    if (!userAddress || !transactionRateLimiter.isAllowed(userAddress)) {
      alert('Too many requests. Please wait a moment before trying again.');
      return;
    }

    // Security: Input validation
    if (!signer || !burnAmount) {
      alert('Please enter amount to burn');
      return;
    }

    // Security: Detect attack patterns
    if (detectAttackPattern(burnAmount)) {
      alert('Invalid input detected. Please check your input.');
      return;
    }

    // Security: Validate amount
    const parsedAmount = safeParseAmount(burnAmount);
    if (!parsedAmount) {
      alert('Invalid amount format');
      return;
    }

    try {
      setLoading(true);
      const contract = getContractWithSigner(signer, contractAddress);
      const tx = await contract.burn(parsedAmount);
      await tx.wait();

      alert('Burn successful!');
      setBurnAmount('');
      onTransactionComplete();
    } catch (error: any) {
      console.error('Burn error:', error);
      // Security: Sanitize error message
      const safeError = sanitizeError(error);
      alert(`Burn failed: ${safeError}`);
    } finally {
      setLoading(false);
    }
  };

  if (!signer || !userAddress) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <p className="text-gray-400 text-center">
          Please connect your wallet to perform actions
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold mb-4 text-white">Token Actions</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'transfer'
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Transfer
        </button>
        <button
          onClick={() => setActiveTab('mint')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'mint'
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Mint
        </button>
        <button
          onClick={() => setActiveTab('burn')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'burn'
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Burn
        </button>
      </div>

      {/* Transfer Tab */}
      {activeTab === 'transfer' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              To Address
            </label>
            <input
              type="text"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="text"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </div>
      )}

      {/* Mint Tab */}
      {activeTab === 'mint' && (
        <div className="space-y-4">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-yellow-200 text-sm">
              ⚠️ Only contract owner can mint tokens
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              To Address
            </label>
            <input
              type="text"
              value={mintTo}
              onChange={(e) => setMintTo(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="text"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleMint}
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Mint'}
          </button>
        </div>
      )}

      {/* Burn Tab */}
      {activeTab === 'burn' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Burn
            </label>
            <input
              type="text"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleBurn}
            disabled={loading}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Burn'}
          </button>
        </div>
      )}
    </div>
  );
}

import { ethers } from 'ethers';

/**
 * Security utilities untuk melindungi dApp dari berbagai serangan
 */

// Rate limiting untuk mencegah spam transactions
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number = 5;
  private readonly timeWindow: number = 60000; // 1 minute

  isAllowed(address: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(address) || [];

    // Remove old requests outside time window
    const recentRequests = userRequests.filter(
      (time) => now - time < this.timeWindow
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(address, recentRequests);
    return true;
  }

  reset(address: string): void {
    this.requests.delete(address);
  }
}

export const transactionRateLimiter = new RateLimiter();

/**
 * Validasi alamat Ethereum
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check format: harus dimulai dengan 0x dan panjang 42 karakter
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }

  try {
    // Verify checksum jika address memiliki checksum
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Sanitize alamat - normalize dan validasi
 */
export function sanitizeAddress(address: string): string | null {
  if (!address) return null;

  const trimmed = address.trim();
  
  if (!isValidAddress(trimmed)) {
    return null;
  }

  // Return checksummed address
  try {
    return ethers.getAddress(trimmed);
  } catch {
    return null;
  }
}

/**
 * Deteksi pattern serangan umum (XSS, injection, dll)
 */
export function detectAttackPattern(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const attackPatterns = [
    // XSS patterns
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<img/i,
    /<svg/i,
    /eval\(/i,
    /expression\(/i,
    
    // SQL injection patterns (untuk keamanan umum)
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    
    // Command injection
    /[;&|`$(){}[\]]/,
    
    // Path traversal
    /\.\.\//,
    /\.\.\\/,
    
    // Null bytes
    /\0/,
    
    // Control characters
    /[\x00-\x1F\x7F]/,
  ];

  return attackPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validasi amount - pastikan format valid dan tidak negatif
 */
export function safeParseAmount(amount: string): bigint | null {
  if (!amount || typeof amount !== 'string') {
    return null;
  }

  // Remove whitespace
  const trimmed = amount.trim();

  // Check for attack patterns
  if (detectAttackPattern(trimmed)) {
    return null;
  }

  // Validate format: hanya angka dan satu titik desimal
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  try {
    const parsed = ethers.parseUnits(trimmed, 18);
    
    // Pastikan tidak negatif
    if (parsed < BigInt(0)) {
      return null;
    }

    // Pastikan tidak terlalu besar (max 1e30)
    const maxAmount = ethers.parseUnits('1000000000000000000000000000000', 18);
    if (parsed > maxAmount) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Validasi transaksi sebelum eksekusi
 */
export interface TransactionValidation {
  valid: boolean;
  error?: string;
}

export function validateTransaction(
  to: string,
  amount: string,
  from: string
): TransactionValidation {
  // Validasi alamat pengirim
  if (!isValidAddress(from)) {
    return { valid: false, error: 'Invalid sender address' };
  }

  // Validasi alamat penerima
  if (!isValidAddress(to)) {
    return { valid: false, error: 'Invalid recipient address' };
  }

  // Pastikan tidak transfer ke diri sendiri (tidak perlu, tapi untuk keamanan)
  if (from.toLowerCase() === to.toLowerCase()) {
    return { valid: false, error: 'Cannot transfer to yourself' };
  }

  // Validasi amount
  const parsedAmount = safeParseAmount(amount);
  if (!parsedAmount) {
    return { valid: false, error: 'Invalid amount format' };
  }

  // Pastikan amount tidak nol
  if (parsedAmount === BigInt(0)) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  return { valid: true };
}

/**
 * Sanitize error message untuk mencegah information disclosure
 */
export function sanitizeError(error: any): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  let errorMessage = '';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
  } else if (error.reason) {
    errorMessage = error.reason;
  } else {
    errorMessage = String(error);
  }

  // Remove sensitive information
  errorMessage = errorMessage
    .replace(/private key/gi, '[REDACTED]')
    .replace(/secret/gi, '[REDACTED]')
    .replace(/password/gi, '[REDACTED]')
    .replace(/mnemonic/gi, '[REDACTED]')
    .replace(/seed/gi, '[REDACTED]');

  // Limit length untuk mencegah DoS
  if (errorMessage.length > 200) {
    errorMessage = errorMessage.substring(0, 200) + '...';
  }

  // Remove potential XSS
  errorMessage = errorMessage
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return errorMessage;
}

/**
 * Validasi contract address sebelum interaksi
 */
export function validateContractAddress(address: string): boolean {
  if (!isValidAddress(address)) {
    return false;
  }

  // Pastikan bukan zero address
  if (address === ethers.ZeroAddress) {
    return false;
  }

  return true;
}

/**
 * Generate nonce untuk mencegah replay attacks (client-side)
 */
export function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validasi input umum
 */
export function validateInput(input: string, maxLength: number = 1000): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // Check length
  if (input.length > maxLength) {
    return false;
  }

  // Check for attack patterns
  if (detectAttackPattern(input)) {
    return false;
  }

  return true;
}

/**
 * Escape HTML untuk mencegah XSS
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Validasi network ID untuk mencegah wrong network attacks
 */
export function validateNetwork(chainId: number, allowedChainIds: number[]): boolean {
  return allowedChainIds.includes(chainId);
}

/**
 * Debounce function untuk mencegah spam clicks
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';

// Dynamic import for AppKit to reduce initial bundle size
// Note: AppKit must be loaded client-side only
const AppKitProviderWrapper = dynamic(
  () => import('@/lib/appkit-config').then((mod) => ({ default: mod.AppKitProviderWrapper })),
  {
    ssr: false,
  }
);

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Better font loading performance
  preload: true,
});

export const metadata: Metadata = {
  title: 'BaseToken dApp',
  description: 'Mini dApp for BaseToken ERC20 on Base blockchain',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppKitProviderWrapper>
          {children}
        </AppKitProviderWrapper>
      </body>
    </html>
  );
}

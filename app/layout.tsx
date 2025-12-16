import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppKitProviderWrapper } from '@/lib/appkit-config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BaseToken dApp',
  description: 'Mini dApp for BaseToken ERC20 on Base blockchain',
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

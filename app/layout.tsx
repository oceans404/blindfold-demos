import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './polyfills';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blindfold Demo',
  description: 'Demo application for @nillion/blindfold cryptographic library',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.className} bg-black text-white`}>
        <nav className="border-b border-gray-700 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <a href="/" className="hover:text-gray-300 transition-colors">
              <h1 className="text-2xl font-bold text-white">
                BLINDFOLD LIBRARY
              </h1>
            </a>

            <div className="space-x-4">
              <a
                href="/store"
                className="hover:text-gray-300 transition-colors"
              >
                STORE
              </a>
              <a
                href="/match"
                className="hover:text-gray-300 transition-colors"
              >
                MATCH
              </a>
              <a
                href="/sum"
                className="hover:text-gray-300 transition-colors"
              >
                SUM
              </a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4 min-h-screen">{children}</main>
      </body>
    </html>
  );
}

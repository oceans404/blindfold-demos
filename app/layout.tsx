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
              <a href="/sum" className="hover:text-gray-300 transition-colors">
                SUM
              </a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4 min-h-screen">{children}</main>
        <footer className="border-t border-gray-700 p-4 mt-8">
          <div className="container mx-auto text-center text-sm text-gray-400 font-mono">
            built by{' '}
            <a
              href="https://twitter.com/0ceans404"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              Steph
            </a>
            <span className="mx-2">|</span>
            check out the code on{' '}
            <a
              href="https://github.com/oceans404/blindfold-demos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

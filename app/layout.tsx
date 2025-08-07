import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';
import './polyfills';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blindfold Library',
  description: 'Demos for @nillion/blindfold cryptographic library',
  icons: {
    icon: [
      {
        url: '/blindfold.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/blindfold.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="6acd1022-ba4e-49ca-baa9-d88adcf1aa99"></script>
      </head>
      <body className={`${jetbrainsMono.className} bg-black text-white`}>
        <Navbar />
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

'use client';

import { useEffect, useRef } from 'react';
import { animate, createScope } from 'animejs';

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<any>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    
    scopeRef.current = createScope({ root: rootRef.current }).add((self: any) => {
      // Library implementation cards - slide in from left/right
      animate('.library-card-left', {
        translateX: ['-100%', 0],
        opacity: [0, 1],
        duration: 800,
        ease: 'out(3)',
        delay: 200,
      });

      animate('.library-card-right', {
        translateX: ['100%', 0],
        opacity: [0, 1],
        duration: 800,
        ease: 'out(3)',
        delay: 400,
      });

      // Demo operation cards - staggered entrance from bottom
      animate('.demo-card', {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 600,
        ease: 'out(2)',
        delay: (self: any) => 600 + self.index * 150,
      });

      // Operation reference table - fade in with slight scale
      animate('.operation-table', {
        scale: [0.95, 1],
        opacity: [0, 1],
        duration: 800,
        ease: 'out(2)',
        delay: 1200,
      });

      // Table rows - progressive reveal
      animate('.table-row', {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        ease: 'out(1.5)',
        delay: (self: any) => 1400 + self.index * 100,
      });

      // Key management cards - fade in
      animate('.key-card', {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        ease: 'out(2)',
        delay: (self: any) => 1800 + self.index * 200,
      });

      // Single node animations - continuous pulsing
      animate('.single-node', {
        scale: [1, 1.15, 1],
        opacity: [0.8, 1, 0.8],
        duration: 2500,
        ease: 'inOut(2)',
        loop: true,
        delay: 2000,
      });

      // Multiple nodes - staggered pulsing
      animate('.multi-node', {
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        duration: 1800,
        ease: 'inOut(1.5)',
        loop: true,
        delay: (self: any) => 2200 + self.index * 300,
      });

      // Connection lines - subtle pulse animation
      animate('.connection-line', {
        scaleX: [0.8, 1, 0.8],
        opacity: [0.4, 0.8, 0.4],
        duration: 2000,
        ease: 'inOut(1.5)',
        loop: true,
        delay: 2500,
      });

      // Enhanced button hover animations
      self.add('buttonHover', (element: HTMLElement) => {
        animate(element, {
          scale: [1, 1.05],
          duration: 200,
          ease: 'out(2)',
        });
      });

      self.add('buttonLeave', (element: HTMLElement) => {
        animate(element, {
          scale: [1.05, 1],
          duration: 200,
          ease: 'out(2)',
        });
      });

      // Store demo flow animation
      self.add('storeHover', (element: HTMLElement) => {
        // First: Encrypt label and arrow
        const arrow1 = element.querySelector('.store-arrow-1');
        if (arrow1) {
          animate(arrow1, {
            opacity: [0.2, 1],
            duration: 400,
            ease: 'out(2)',
          });
        }

        // Second: Encrypted nodes
        const encryptedNodes = element.querySelector('.store-encrypted-nodes');
        if (encryptedNodes) {
          animate(encryptedNodes, {
            opacity: [0.2, 1],
            duration: 400,
            delay: 300,
            ease: 'out(2)',
          });
        }

        // Third: Decrypt label and arrow
        const arrow2 = element.querySelector('.store-arrow-2');
        if (arrow2) {
          animate(arrow2, {
            opacity: [0.2, 1],
            duration: 400,
            delay: 600,
            ease: 'out(2)',
          });
        }

        // Fourth: Final result
        const result = element.querySelector('.store-result');
        if (result) {
          animate(result, {
            opacity: [0.2, 1],
            duration: 400,
            delay: 900,
            ease: 'out(2)',
          });
        }
      });

      self.add('storeLeave', (element: HTMLElement) => {
        // Fade all elements back to 20% opacity at once
        animate(
          element.querySelectorAll(
            '.store-arrow-1, .store-encrypted-nodes, .store-arrow-2, .store-result'
          ),
          {
            opacity: [1, 0.2],
            duration: 300,
            ease: 'in(1.5)',
          }
        );
      });

      // Match demo animation
      self.add('matchHover', (element: HTMLElement) => {
        // Fade in all visualizations at once
        animate(element.querySelectorAll('.match-visualization'), {
          opacity: [0.2, 1],
          duration: 400,
          ease: 'out(2)',
        });

        // Animate the hash nodes
        animate(element.querySelectorAll('.match-node'), {
          scale: [0.95, 1],
          opacity: [0.5, 1],
          duration: 300,
          delay: (self: any) => 200 + self.index * 50,
          ease: 'out(2)',
        });

        // Show match result
        const matchResult = element.querySelector('.match-result');
        if (matchResult) {
          animate(matchResult, {
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 400,
            delay: 800,
            ease: 'out(2)',
          });
        }
      });

      self.add('matchLeave', (element: HTMLElement) => {
        // Fade back all visualizations
        animate(element.querySelectorAll('.match-visualization'), {
          opacity: [1, 0.2],
          duration: 300,
          ease: 'in(1.5)',
        });

        // Hide match result
        const matchResult = element.querySelector('.match-result');
        if (matchResult) {
          animate(matchResult, {
            opacity: 0,
            duration: 200,
            ease: 'in(1.5)',
          });
        }
      });

      // Sum demo animation
      self.add('sumHover', (element: HTMLElement) => {
        // First: Show encrypted input nodes (5 and 3 encryption)
        animate(element.querySelectorAll('.input-encryption'), {
          opacity: [0.2, 1],
          duration: 400,
          ease: 'out(2)',
        });

        // Second: Show encrypted sum nodes and arrow
        animate(element.querySelectorAll('.encrypted-sum-section'), {
          opacity: [0.2, 1],
          duration: 400,
          delay: 400,
          ease: 'out(2)',
        });

        // Third: Show decrypted sum label
        const decryptedLabel = element.querySelector('.decrypted-sum-label');
        if (decryptedLabel) {
          animate(decryptedLabel, {
            opacity: [0.2, 1],
            duration: 400,
            delay: 800,
            ease: 'out(2)',
          });
        }

        // Fourth: Show final decrypted result
        const sumResult = element.querySelector('.sum-result .text-green-400');
        if (sumResult) {
          animate(sumResult, {
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 400,
            delay: 1200,
            ease: 'out(2)',
          });
        }
      });

      self.add('sumLeave', (element: HTMLElement) => {
        // Fade back all visualizations
        animate(element.querySelectorAll('.input-encryption, .encrypted-sum-section, .decrypted-sum-label'), {
          opacity: [1, 0.2],
          duration: 300,
          ease: 'in(1.5)',
        });

        // Hide sum result
        const sumResult = element.querySelector('.sum-result .text-green-400');
        if (sumResult) {
          animate(sumResult, {
            opacity: 0,
            duration: 200,
            ease: 'in(1.5)',
          });
        }
      });
    });

    return () => scopeRef.current?.revert();
  }, []);

  const handleButtonHover = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.buttonHover(e.currentTarget);
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.buttonLeave(e.currentTarget);
  };

  const handleStoreHover = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.storeHover(e.currentTarget);
  };

  const handleStoreLeave = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.storeLeave(e.currentTarget);
  };

  const handleMatchHover = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.matchHover(e.currentTarget);
  };

  const handleMatchLeave = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.matchLeave(e.currentTarget);
  };

  const handleSumHover = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.sumHover(e.currentTarget);
  };

  const handleSumLeave = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.sumLeave(e.currentTarget);
  };

  const SingleNodeIcon = () => (
    <div className="flex items-center justify-center">
      <div className="single-node w-4 h-4 bg-green-500"></div>
    </div>
  );

  const MultipleNodesIcon = () => (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="multi-node w-4 h-4 bg-green-500"></div>
        <div className="connection-line h-px bg-gray-400 w-4"></div>
        <div className="multi-node w-4 h-4 bg-green-500"></div>
        <div className="connection-line h-px bg-gray-400 w-4"></div>
        <div className="multi-node w-4 h-4 bg-green-500"></div>
      </div>
    </div>
  );
  return (
    <div ref={rootRef} className="max-w-6xl mx-auto text-white">
      <div className="mb-8">
        <p className="text-lg mb-4 text-gray-300">
          The{' '}
          <a
            href="https://docs.nillion.com/build/private-storage/blindfold"
            className="text-green-500 hover:text-green-400"
          >
            blindfold library
          </a>{' '}
          provides functions for encrypting/decrypting and secret sharing data
          stored in individual nilDB nodes and nilDB clusters. Blindfold
          supports store, match, and sum operations across single-node and
          multi-node configurations with various cryptographic implementations.
        </p>
      </div>

      {/* Library Implementations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white font-mono">
          LIBRARY IMPLEMENTATIONS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TypeScript/JavaScript */}
          <div className="library-card-left border border-gray-600 p-3 opacity-0">
            <h3 className="font-mono text-white mb-2 flex items-center text-sm">
              <span className="bg-blue-600 text-white px-2 py-1 text-xs mr-2">
                TS
              </span>
              TypeScript / JavaScript
            </h3>

            <div className="mb-3">
              <div className="bg-gray-800 p-2 border border-gray-600 flex items-center justify-between">
                <code className="text-green-400 font-mono text-xs">
                  npm install @nillion/blindfold
                </code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      'npm install @nillion/blindfold'
                    )
                  }
                  className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs transition-colors"
                  title="Copy to clipboard"
                >
                  COPY
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <a
                href="https://github.com/NillionNetwork/blindfold-ts"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 hover:bg-gray-700 transition-colors p-2 border border-gray-600"
              >
                <span className="text-white font-mono text-xs">
                  GitHub Repository
                </span>
              </a>
              <a
                href="https://www.npmjs.com/package/@nillion/blindfold"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 hover:bg-gray-700 transition-colors p-2 border border-gray-600"
              >
                <span className="text-white font-mono text-xs">
                  NPM Package
                </span>
              </a>
            </div>
          </div>

          {/* Python */}
          <div className="library-card-right border border-gray-600 p-3 opacity-0">
            <h3 className="font-mono text-white mb-2 flex items-center text-sm">
              <span className="bg-yellow-600 text-black px-2 py-1 text-xs mr-2">
                PY
              </span>
              Python
            </h3>

            <div className="mb-3">
              <div className="bg-gray-800 p-2 border border-gray-600 flex items-center justify-between">
                <code className="text-green-400 font-mono text-xs">
                  pip install blindfold
                </code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText('pip install blindfold')
                  }
                  className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs transition-colors"
                  title="Copy to clipboard"
                >
                  COPY
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <a
                href="https://github.com/NillionNetwork/blindfold-py"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 hover:bg-gray-700 transition-colors p-2 border border-gray-600"
              >
                <span className="text-white font-mono text-xs">
                  GitHub Repository
                </span>
              </a>
              <a
                href="https://pypi.org/project/blindfold/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 hover:bg-gray-700 transition-colors p-2 border border-gray-600"
              >
                <span className="text-white font-mono text-xs">
                  PyPI Package
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Overview */}
      <h2 className="text-xl font-semibold mb-4 text-white font-mono">Demos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className="demo-card border border-gray-700 p-6 opacity-0 flex flex-col"
          onMouseEnter={handleStoreHover}
          onMouseLeave={handleStoreLeave}
        >
          <div className="flex items-center justify-center mb-4 h-40 relative">
            {/* Original value */}
            <div className="text-2xl font-mono text-green-500 store-original">
              42
            </div>

            {/* Arrow 1 */}
            <div className="store-arrow-1 opacity-20 mx-2 text-gray-400 text-sm relative px-3">
              <div className="text-[10px] font-mono text-gray-400 absolute -top-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Encrypt
              </div>
              →
            </div>

            {/* Encrypted nodes */}
            <div className="store-encrypted-nodes opacity-20 flex flex-col items-center justify-center">
              <div className="space-y-1">
                <div className="encrypted-node w-16 h-4 bg-gray-800 border border-gray-500 flex items-center justify-center text-[10px] font-mono text-gray-300">
                  ajewifoj=
                </div>
                <div className="encrypted-node w-16 h-4 bg-gray-800 border border-gray-500 flex items-center justify-center text-[10px] font-mono text-gray-300">
                  mowfxiwf=
                </div>
                <div className="encrypted-node w-16 h-4 bg-gray-800 border border-gray-500 flex items-center justify-center text-[10px] font-mono text-gray-300">
                  utqowflx=
                </div>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="store-arrow-2 opacity-20 mx-2 text-gray-400 text-sm relative px-3">
              <div className="text-[10px] font-mono text-gray-400 absolute -top-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Decrypt
              </div>
              →
            </div>

            {/* Result */}
            <div className="store-result opacity-20 flex flex-col items-center justify-center">
              <div className="text-2xl font-mono text-green-500">42</div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-white font-mono">
            STORE
          </h2>
          <p className="mb-4 text-gray-300 text-sm flex-grow">
            Encrypt data for secure storage on cluster nodes using authenticated
            encryption or secret sharing.
          </p>
          <div>
            <a
              href="/store"
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 transition-colors font-mono"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              TRY IT
            </a>
          </div>
        </div>

        <div
          className="demo-card border border-gray-700 p-6 opacity-0 flex flex-col"
          onMouseEnter={handleMatchHover}
          onMouseLeave={handleMatchLeave}
        >
          <div className="mb-4 h-40">
            <div className="grid grid-cols-2 gap-4">
              {/* Input 1 */}
              <div className="text-center">
                <div className="text-sm font-mono text-green-500 mb-1">
                  Input 1: "gm"
                </div>
                <div className="match-visualization opacity-20">
                  <div className="text-[9px] font-mono text-gray-400 mb-1">
                    Hash 1
                  </div>
                  <div className="space-y-0.5">
                    <div className="match-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      ajewifoj=
                    </div>
                    <div className="match-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      mowfxiwf=
                    </div>
                    <div className="match-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      utqowflx=
                    </div>
                  </div>
                </div>
              </div>

              {/* Input 2 */}
              <div className="text-center">
                <div className="text-sm font-mono text-green-500 mb-1">
                  Input 2: "gm"
                </div>
                <div className="match-visualization opacity-20">
                  <div className="text-[9px] font-mono text-gray-400 mb-1">
                    Hash 2
                  </div>
                  <div className="space-y-0.5">
                    <div className="match-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      ajewifoj=
                    </div>
                    <div className="match-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      mowfxiwf=
                    </div>
                    <div className="match-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      utqowflx=
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="match-result text-center mt-2 text-[10px] font-mono text-green-400 opacity-0">
              ✓ MATCH
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-white font-mono">
            MATCH
          </h2>
          <p className="mb-4 text-gray-300 text-sm flex-grow">
            Generate deterministic hashes for privacy-preserving search and
            matching operations.
          </p>
          <div>
            <a
              href="/match"
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 transition-colors font-mono"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              TRY IT
            </a>
          </div>
        </div>

        <div
          className="demo-card border border-gray-700 p-6 opacity-0 flex flex-col"
          onMouseEnter={handleSumHover}
          onMouseLeave={handleSumLeave}
        >
          <div className="mb-4 h-40">
            <div className="grid grid-cols-5 gap-2 items-start">
              {/* Input 1 */}
              <div className="text-center">
                <div className="text-sm font-mono text-green-500 mb-1">5</div>
                <div className="input-encryption opacity-20">
                  <div className="text-[9px] font-mono text-gray-400 mb-1">
                    Encrypt →
                  </div>
                  <div className="space-y-0.5">
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      1879330110
                    </div>
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      1165721168
                    </div>
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      3496398601
                    </div>
                  </div>
                </div>
              </div>

              {/* Plus sign */}
              <div className="text-center">
                <div className="text-lg font-mono text-green-500 mt-[2px]">+</div>
              </div>

              {/* Input 2 */}
              <div className="text-center">
                <div className="text-sm font-mono text-green-500 mb-1">3</div>
                <div className="input-encryption opacity-20">
                  <div className="text-[9px] font-mono text-gray-400 mb-1">
                    Encrypt →
                  </div>
                  <div className="space-y-0.5">
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      3992899977
                    </div>
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      419004669
                    </div>
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      926699802
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-center">
                <div className="encrypted-sum-section opacity-20">
                  <div className="text-sm font-mono text-gray-400">→</div>
                </div>
              </div>

              {/* Encrypted Sum Result */}
              <div className="text-center">
                <div className="encrypted-sum-section opacity-20">
                  <div className="text-[9px] font-mono text-gray-400 mb-1">
                    Encrypted Sum
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[7px] font-mono text-gray-400">Node 1 Sum:</div>
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      1577262776
                    </div>
                    <div className="text-[7px] font-mono text-gray-400 mt-1">Node 2 Sum:</div>
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      1584725837
                    </div>
                    <div className="text-[7px] font-mono text-gray-400 mt-1">Node 3 Sum:</div>
                    <div className="sum-node bg-gray-800 border border-gray-500 px-1 py-0.5 text-[8px] font-mono text-gray-300 truncate">
                      128131092
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sum-result text-center mt-2">
              <div className="decrypted-sum-label opacity-20">
                <div className="text-[9px] font-mono text-gray-400 mb-1">DECRYPTED SUM</div>
              </div>
              <div className="text-sm font-mono text-green-400 opacity-0">8</div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-white font-mono">
            SUM
          </h2>
          <p className="mb-4 text-gray-300 text-sm flex-grow">
            Perform secure addition on encrypted integers using homomorphic
            encryption or secret sharing.
          </p>
          <div>
            <a
              href="/sum"
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 transition-colors font-mono"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              TRY IT
            </a>
          </div>
        </div>
      </div>

      {/* Detailed Operations Table */}
      <div className="operation-table border border-gray-700 p-6 mb-8 opacity-0">
        <h2 className="text-2xl font-semibold mb-6 text-white font-mono">
          OPERATION REFERENCE
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-center py-3 px-2 text-white font-mono w-20">
                  NODES
                </th>
                <th className="text-left py-3 px-2 text-white font-mono">
                  CLUSTER
                </th>
                <th className="text-left py-3 px-2 text-white font-mono">
                  OPERATION
                </th>
                <th className="text-left py-3 px-2 text-white font-mono">
                  IMPLEMENTATION
                </th>
                <th className="text-left py-3 px-2 text-white font-mono">
                  SUPPORTED TYPES
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {/* STORE operations */}
              <tr className="table-row border-b border-gray-700 opacity-0">
                <td className="py-2 px-2 text-center">
                  <SingleNodeIcon />
                </td>
                <td className="py-2 px-2 font-mono">single node</td>
                <td className="py-2 px-2 font-mono">store</td>
                <td className="py-2 px-2">
                  XSalsa20 stream cipher + Poly1305 MAC
                </td>
                <td className="py-2 px-2">
                  32-bit signed integer; UTF-8 string (4096 bytes)
                </td>
              </tr>
              <tr className="table-row border-b border-gray-700 opacity-0">
                <td className="py-2 px-2 text-center">
                  <MultipleNodesIcon />
                </td>
                <td className="py-2 px-2 font-mono">multiple nodes</td>
                <td className="py-2 px-2 font-mono">store</td>
                <td className="py-2 px-2">XOR-based secret sharing</td>
                <td className="py-2 px-2">
                  32-bit signed integer; UTF-8 string (4096 bytes)
                </td>
              </tr>
              {/* MATCH operations */}
              <tr className="table-row border-b border-gray-700 opacity-0">
                <td className="py-2 px-2 text-center">
                  <SingleNodeIcon />
                </td>
                <td className="py-2 px-2 font-mono">single node</td>
                <td className="py-2 px-2 font-mono">match</td>
                <td className="py-2 px-2">
                  deterministic salted hashing via SHA-512
                </td>
                <td className="py-2 px-2">
                  32-bit signed integer; UTF-8 string (4096 bytes)
                </td>
              </tr>
              <tr className="table-row border-b border-gray-700 opacity-0">
                <td className="py-2 px-2 text-center">
                  <MultipleNodesIcon />
                </td>
                <td className="py-2 px-2 font-mono">multiple nodes</td>
                <td className="py-2 px-2 font-mono">match</td>
                <td className="py-2 px-2">
                  deterministic salted hashing via SHA-512
                </td>
                <td className="py-2 px-2">
                  32-bit signed integer; UTF-8 string (4096 bytes)
                </td>
              </tr>
              {/* SUM operations */}
              <tr className="table-row border-b border-gray-700 opacity-0">
                <td className="py-2 px-2 text-center">
                  <SingleNodeIcon />
                </td>
                <td className="py-2 px-2 font-mono">single node</td>
                <td className="py-2 px-2 font-mono">sum</td>
                <td className="py-2 px-2">
                  non-deterministic Paillier with 2048-bit primes
                </td>
                <td className="py-2 px-2">32-bit signed integer</td>
              </tr>
              <tr className="table-row border-b border-gray-700 opacity-0">
                <td className="py-2 px-2 text-center">
                  <MultipleNodesIcon />
                </td>
                <td className="py-2 px-2 font-mono">multiple nodes</td>
                <td className="py-2 px-2 font-mono">sum</td>
                <td className="py-2 px-2">
                  additive secret sharing (no threshold; prime modulus 2^32 +
                  15)
                </td>
                <td className="py-2 px-2">32-bit signed integer</td>
              </tr>
              <tr className="table-row opacity-0">
                <td className="py-2 px-2 text-center">
                  <MultipleNodesIcon />
                </td>
                <td className="py-2 px-2 font-mono">multiple nodes</td>
                <td className="py-2 px-2 font-mono">sum</td>
                <td className="py-2 px-2">
                  Shamir's secret sharing (with threshold; prime modulus 2^32 +
                  15)
                </td>
                <td className="py-2 px-2">32-bit signed integer</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Types */}
      <div className="border border-gray-700 p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white font-mono">
          KEY MANAGEMENT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="key-card border border-gray-600 p-4 opacity-0">
            <h3 className="font-mono text-white mb-2">SecretKey</h3>
            <p className="text-gray-300 text-sm">
              Contains blinding masks for exclusive access control. Requires
              deterministic seed for reproducible key generation.
            </p>
          </div>
          <div className="key-card border border-gray-600 p-4 opacity-0">
            <h3 className="font-mono text-white mb-2">ClusterKey</h3>
            <p className="text-gray-300 text-sm">
              Coordination key without cryptographic material. Used for cluster
              management and node coordination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

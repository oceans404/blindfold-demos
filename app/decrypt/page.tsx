'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SecretKey, ClusterKey, decrypt } from '@nillion/blindfold';

export default function DecryptPage() {
  const searchParams = useSearchParams();
  const [keyType, setKeyType] = useState<'secret' | 'cluster'>('secret');
  const [seed, setSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [nodeCount, setNodeCount] = useState(1);
  const [shares, setShares] = useState<string[]>([]);
  const [inputType, setInputType] = useState<'string' | 'integer'>('string');
  const [decryptedData, setDecryptedData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showEditShares, setShowEditShares] = useState(false);

  // Parse query params on mount
  useEffect(() => {
    const keyTypeParam = searchParams.get('keyType');
    const nodeCountParam = searchParams.get('nodeCount');
    const sharesParam = searchParams.get('shares');
    const inputTypeParam = searchParams.get('inputType');

    let newNodeCount = 1;

    if (keyTypeParam === 'secret' || keyTypeParam === 'cluster') {
      setKeyType(keyTypeParam);
    }

    if (nodeCountParam) {
      const count = parseInt(nodeCountParam, 10);
      if (!isNaN(count) && count >= 1 && count <= 10) {
        newNodeCount = count;
        setNodeCount(count);
      }
    }

    if (inputTypeParam === 'string' || inputTypeParam === 'integer') {
      setInputType(inputTypeParam);
    }

    if (sharesParam) {
      try {
        const parsedShares = JSON.parse(decodeURIComponent(sharesParam));
        if (Array.isArray(parsedShares)) {
          // Shares are already strings from the URL, just use them directly
          setShares(parsedShares);
        }
      } catch (e) {
        console.error('Failed to parse shares from URL:', e);
      }
    } else {
      // Initialize empty shares if no shares in URL
      setShares(Array(newNodeCount).fill(''));
    }

    setIsInitialized(true);
  }, [searchParams]);

  const handleDecrypt = async () => {
    try {
      setError('');
      setIsLoading(true);
      setDecryptedData('');

      // Validate inputs
      if (keyType === 'secret' && !seed.trim()) {
        setError('SecretKey requires a deterministic seed');
        return;
      }

      if (shares.length === 0 || shares.some(share => !share.trim())) {
        setError('Please provide all share data');
        return;
      }

      // Create cluster configuration
      const cluster = { nodes: Array(nodeCount).fill({}) };

      // Generate key based on type
      let key;
      if (keyType === 'secret') {
        key = await SecretKey.generate(
          cluster,
          { store: true },
          null,
          seed
        );
      } else {
        key = await ClusterKey.generate(cluster, { store: true });
      }

      // Parse shares back to proper format
      let encryptedData;
      if (nodeCount === 1) {
        // Single node - the share is the encrypted data
        encryptedData = shares[0];
      } else {
        // Multi-node - use array of shares directly
        encryptedData = shares;
      }

      // Decrypt the data
      const decrypted = await decrypt(key, encryptedData);

      // Format the decrypted result based on input type
      if (inputType === 'string') {
        setDecryptedData(decrypted as string);
      } else {
        setDecryptedData((decrypted as bigint).toString());
      }

    } catch (err: any) {
      setError(err.message || 'Decryption failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateShare = (index: number, value: string) => {
    const newShares = [...shares];
    newShares[index] = value;
    setShares(newShares);
  };

  // Ensure shares array matches node count when nodeCount changes (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      const newShares = Array(nodeCount).fill('').map((_, i) => shares[i] || '');
      setShares(newShares);
    }
  }, [nodeCount]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">
            Blindfold: Decrypt Data
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Decrypt data using shares and the appropriate key. Provide the key type,
            shares from each node, and seed (if using SecretKey).
          </p>
        </div>

        <div className="grid gap-4">
          {/* Configuration */}
          <div className="p-4 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white font-mono">
              DECRYPTION CONFIGURATION
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Key Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 font-mono">
                  KEY TYPE
                </label>
                <select
                  value={keyType}
                  onChange={(e) => setKeyType(e.target.value as 'secret' | 'cluster')}
                  className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
                >
                  <option value="secret">SecretKey</option>
                  <option value="cluster">ClusterKey</option>
                </select>
              </div>

              {/* Input Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 font-mono">
                  DATA TYPE
                </label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value as 'string' | 'integer')}
                  className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
                >
                  <option value="string">UTF-8 String</option>
                  <option value="integer">32-bit Signed Integer</option>
                </select>
              </div>

              {/* Node Count */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 font-mono">
                  NODE COUNT
                </label>
                <input
                  type="number"
                  value={nodeCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= 10) {
                      setNodeCount(val);
                    }
                  }}
                  min="1"
                  max="10"
                  className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
                />
              </div>

              {/* Seed (for SecretKey) */}
              {keyType === 'secret' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 font-mono">
                    SECRET KEY SEED
                  </label>
                  <div className="relative">
                    <input
                      type={showSeed ? "text" : "password"}
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      className={`w-full p-2 pr-10 text-sm border ${
                        shares.some(s => s.trim()) && !seed.trim() 
                          ? 'border-green-500 ring-1 ring-green-500' 
                          : 'border-gray-600'
                      } bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono`}
                      placeholder="Enter deterministic seed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSeed(!showSeed)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showSeed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {shares.some(s => s.trim()) && !seed.trim() ? (
                      <span className="text-green-400">Enter the seed used for encryption</span>
                    ) : (
                      "Must match the seed used for encryption"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shares Input */}
          <div className="p-4 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white font-mono">
              ENCRYPTED SHARES
            </h2>

            {/* Visual node representation if shares are filled */}
            {shares.some(s => s.trim()) && (
              <>
                <div className="mb-6">
                  <div className={`grid gap-2 ${
                    nodeCount <= 2
                      ? 'grid-cols-1 md:grid-cols-2'
                      : nodeCount <= 3
                      ? 'grid-cols-1 md:grid-cols-3'
                      : 'grid-cols-2 md:grid-cols-4'
                  }`}>
                    {Array.from({ length: nodeCount }, (_, i) => (
                      <div key={i} className="relative">
                        {/* Node container */}
                        <div className="p-2">
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-400"></div>
                                <span className="text-white font-medium text-xs">
                                  Node {i + 1}
                                </span>
                              </div>
                            </div>

                            {/* Share display */}
                            <div className="p-2 min-h-[60px] flex items-center border border-gray-700">
                              <div className="w-full">
                                <textarea
                                  readOnly
                                  value={shares[i] || ''}
                                  className="w-full bg-transparent text-green-400 font-mono text-xs break-all leading-tight min-h-[40px] max-h-20 overflow-y-auto resize-none border-none outline-none p-0"
                                  onClick={(e) => e.currentTarget.select()}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Connection lines for multi-node */}
                        {nodeCount > 1 && i < nodeCount - 1 && (
                          <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-600 transform -translate-y-1/2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toggle button for edit shares */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowEditShares(!showEditShares)}
                    className="text-sm text-gray-400 hover:text-white transition-colors font-mono flex items-center gap-2"
                  >
                    {showEditShares ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Hide edit fields
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Edit shares
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Show text areas only if no visual nodes or if edit is toggled on */}
            {(!shares.some(s => s.trim()) || showEditShares) && (
              <div className="space-y-3">
                {shares.map((share, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-1 text-gray-300 font-mono">
                      {nodeCount === 1 ? 'ENCRYPTED DATA' : `NODE ${index + 1} SHARE`}
                    </label>
                    <textarea
                      value={share}
                      onChange={(e) => updateShare(index, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono min-h-[100px]"
                      placeholder={`Paste ${nodeCount === 1 ? 'encrypted data' : `share from node ${index + 1}`} here`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Decrypt Button */}
          <button
            onClick={handleDecrypt}
            disabled={isLoading || (keyType === 'secret' && !seed.trim()) || shares.some(s => !s.trim())}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 font-medium disabled:cursor-not-allowed transition-colors font-mono"
          >
            {isLoading ? 'DECRYPTING...' : 'DECRYPT DATA'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="border border-gray-600 text-white px-4 py-3">
              <div className="flex items-center">
                <span className="text-lg mr-2">ERROR:</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Decrypted Result */}
          {decryptedData && (
            <div className="p-4 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-white font-mono">
                DECRYPTED DATA
              </h2>
              <div className="p-4 border border-gray-600">
                <div className="text-green-400 font-mono break-all">
                  {decryptedData}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Type: {inputType === 'string' ? 'UTF-8 String' : '32-bit Signed Integer'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
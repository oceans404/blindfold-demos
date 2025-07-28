'use client';

import { useState } from 'react';
import NodeSelector from '@/components/NodeSelector';
import { SecretKey, ClusterKey, encrypt, decrypt } from '@nillion/blindfold';

export default function StorePage() {
  const [nodeCount, setNodeCount] = useState(3);
  const [keyType, setKeyType] = useState<'secret' | 'cluster'>('secret');
  const [useSeed, setUseSeed] = useState(true);
  const [seed, setSeed] = useState('my-deterministic-seed-12345');
  const [showSeed, setShowSeed] = useState(false);
  const [showOutputSeed, setShowOutputSeed] = useState(false);
  const [inputData, setInputData] = useState('');
  const [inputType, setInputType] = useState<'string' | 'integer'>('string');
  const [encryptedData, setEncryptedData] = useState<any>(null);
  const [decryptedData, setDecryptedData] = useState<string>('');
  const [key, setKey] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Reset output when config changes
  const resetOutput = () => {
    setEncryptedData(null);
    setDecryptedData('');
    setKey(null);
    setError('');
  };

  const setInputTypeWithReset = (type: 'string' | 'integer') => {
    setInputType(type);
    setInputData(''); // Clear input when switching types
    resetOutput();
  };

  // Custom setters that reset output
  const setNodeCountWithReset = (count: number) => {
    setNodeCount(count);
    resetOutput();
  };

  const setKeyTypeWithReset = (type: 'secret' | 'cluster') => {
    setKeyType(type);
    resetOutput();
  };

  const setSeedWithReset = (newSeed: string) => {
    setSeed(newSeed);
    resetOutput();
  };

  const handleEncrypt = async () => {
    try {
      setError('');
      setDecryptedData('');

      // Create cluster configuration
      const cluster = { nodes: Array(nodeCount).fill({}) };

      // Generate key based on type and options
      let generatedKey;
      if (keyType === 'secret') {
        if (!seed.trim()) {
          setError('SecretKey requires a deterministic seed');
          return;
        }
        generatedKey = await SecretKey.generate(
          cluster,
          { store: true },
          null,
          seed
        );
      } else {
        generatedKey = await ClusterKey.generate(cluster, { store: true });
      }

      setKey(generatedKey);

      // Prepare data based on type
      let dataToEncrypt;
      if (inputType === 'integer') {
        const num = parseInt(inputData, 10);
        if (isNaN(num) || num < -2147483648 || num > 2147483647) {
          setError(
            'Please enter a valid 32-bit signed integer (-2,147,483,648 to 2,147,483,647)'
          );
          return;
        }
        dataToEncrypt = BigInt(num);
      } else {
        if (new TextEncoder().encode(inputData).length > 4096) {
          setError('String data must be 4096 bytes or less');
          return;
        }
        dataToEncrypt = inputData;
      }

      // Encrypt the data
      const ciphertext = await encrypt(generatedKey, dataToEncrypt);
      setEncryptedData(ciphertext);
    } catch (err: any) {
      setError(err.message || 'Encryption failed');
    }
  };

  const handleDecrypt = async () => {
    try {
      setError('');

      if (!key || !encryptedData) {
        setError('Please encrypt data first');
        return;
      }

      // Decrypt the data
      const plaintext = await decrypt(key, encryptedData);
      setDecryptedData(plaintext as string);
    } catch (err: any) {
      setError(err.message || 'Decryption failed');
    }
  };

  // Helper function to render nodes with their encrypted shares
  const renderNodes = () => {
    if (!encryptedData) return null;

    const shares = Array.isArray(encryptedData)
      ? encryptedData
      : [encryptedData];

    return (
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-3 text-center">
          {nodeCount === 1
            ? 'node with an encrypted share'
            : `${nodeCount} nodes with encrypted shares`}
        </h3>
        <div
          className={`grid gap-2 ${
            nodeCount <= 2
              ? 'grid-cols-1 md:grid-cols-2'
              : nodeCount <= 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-2 md:grid-cols-4'
          }`}
        >
          {Array.from({ length: nodeCount }, (_, i) => (
            <div key={i} className="relative">
              {/* Node container */}
              <div className="  p-3 ">
                <div className="  p-2 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400"></div>
                      <span className="text-white font-medium text-xs">
                        Node {i + 1}
                      </span>
                    </div>
                  </div>

                  {/* Encrypted share display */}
                  <div className=" p-2 min-h-[60px] flex items-center border border-gray-700">
                    <div className="w-full">
                      <div className="text-white/60 text-xs mb-1">Share:</div>
                      <textarea
                        readOnly
                        value={
                          typeof shares[i] === 'string'
                            ? shares[i]
                            : JSON.stringify(shares[i])
                        }
                        className="w-full bg-transparent text-white font-mono text-xs break-all leading-tight min-h-[40px] max-h-20 overflow-y-auto resize-none border-none outline-none p-0"
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

        {nodeCount > 1 && (
          <div className="text-center mt-2 text-xs text-gray-400 font-mono">
            Split across {nodeCount} nodes using{' '}
            {keyType === 'secret' ? 'XOR + blinding' : 'XOR sharing'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">
            Blindfold: Store Operation
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            The "store" operation is used to encrypt data for storage on a
            cluster of nodes.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* CONFIG Panel */}
          <div className="lg:col-span-2">
            {/* Data Input - First on Left */}
            <div className="mb-4 p-4 border border-gray-700">
              <label className="block text-sm font-medium mb-2 text-gray-300 font-mono">
                DATA INPUT
              </label>

              {/* Input Type Selection */}
              <div className="mb-3 space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="inputType"
                    value="string"
                    checked={inputType === 'string'}
                    onChange={(e) =>
                      setInputTypeWithReset(
                        e.target.value as 'string' | 'integer'
                      )
                    }
                    className="mr-2 accent-green-600"
                  />
                  <span className="text-white text-sm font-mono">
                    UTF-8 String
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="inputType"
                    value="integer"
                    checked={inputType === 'integer'}
                    onChange={(e) =>
                      setInputTypeWithReset(
                        e.target.value as 'string' | 'integer'
                      )
                    }
                    className="mr-2 accent-green-600"
                  />
                  <span className="text-white text-sm font-mono">
                    32-bit Signed Integer
                  </span>
                </label>
              </div>

              {inputType === 'string' ? (
                <>
                  <textarea
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all resize-none font-mono"
                    rows={3}
                    placeholder="Enter text to encrypt"
                    maxLength={4096}
                  />
                  <div className="text-xs text-gray-400 mt-1 flex justify-between">
                    <span>Max: 4096 bytes</span>
                    <span>
                      {new TextEncoder().encode(inputData).length}/4096
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={inputData}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseInt(val, 10);
                      // Allow empty string and valid range
                      if (
                        val === '' ||
                        (!isNaN(num) && num >= -2147483648 && num <= 2147483647)
                      ) {
                        setInputData(val);
                      }
                    }}
                    className="w-full p-3 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
                    placeholder="Enter integer (-2,147,483,648 to 2,147,483,647)"
                    min="-2147483648"
                    max="2147483647"
                    step="1"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Range: -2,147,483,648 to 2,147,483,647
                  </div>
                </>
              )}

              <button
                onClick={handleEncrypt}
                disabled={!inputData}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 font-medium disabled:cursor-not-allowed transition-colors font-mono"
              >
                {!inputData ? `Enter ${inputType} to encrypt` : 'RUN ENCRYPT'}
              </button>
            </div>

            <div className="p-4 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-white font-mono flex items-center">
                <span className=""></span>
                Node Configuration
              </h2>

              <NodeSelector
                nodeCount={nodeCount}
                setNodeCount={setNodeCountWithReset}
              />

              <div className="mt-4 p-4 border border-gray-700">
                <h3 className="font-medium mb-3 text-white font-mono flex items-center">
                  KEY TYPE
                </h3>

                <div className="space-y-3">
                  <label className="flex items-start p-2  border border-transparent hover:border-gray-600 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="keyType"
                      value="secret"
                      checked={keyType === 'secret'}
                      onChange={(e) =>
                        setKeyTypeWithReset(
                          e.target.value as 'secret' | 'cluster'
                        )
                      }
                      className="mt-1 mr-2 text-gray-400 accent-green-600"
                    />
                    <div>
                      <div className="font-medium text-white text-sm font-mono">
                        SecretKey
                      </div>
                      <div className="text-xs text-gray-400">
                        Blinding masks (recommended)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start p-2  border border-transparent hover:border-gray-600 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="keyType"
                      value="cluster"
                      checked={keyType === 'cluster'}
                      onChange={(e) =>
                        setKeyTypeWithReset(
                          e.target.value as 'secret' | 'cluster'
                        )
                      }
                      className="mt-1 mr-2 text-gray-400 accent-green-600"
                    />
                    <div>
                      <div className="font-medium text-white text-sm font-mono">
                        ClusterKey
                      </div>
                    </div>
                  </label>
                </div>

                {keyType === 'secret' && (
                  <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-700/50">
                    <div className="mb-3">
                      <span className="font-medium text-white text-sm font-mono">
                        SecretKey Seed
                      </span>
                    </div>

                    <div className=" p-3 ">
                      <div className="relative">
                        <input
                          type={showSeed ? "text" : "password"}
                          value={seed}
                          onChange={(e) => setSeedWithReset(e.target.value)}
                          className="w-full p-2 pr-10 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
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
                        Same seed = same key
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OUTPUT Panel */}
          <div className="lg:col-span-3">
            <div className="p-4 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-white font-mono flex items-center">
                OUTPUT
              </h2>

              {error && (
                <div className=" border border-gray-600 text-white px-4 py-3  mb-4">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">ERROR:</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {key && (
                <div className="mb-4">
                  <div className="p-3 border border-gray-600">
                    <h3 className="font-medium mb-2 text-white flex items-center text-sm">
                      KEY METADATA
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <span className="ml-1 font-medium text-white">
                          {keyType === 'secret' ? 'SecretKey' : 'ClusterKey'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Nodes:</span>
                        <span className="ml-1 font-medium text-white">
                          {nodeCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Data Type:</span>
                        <span className="ml-1 font-medium text-white">
                          {inputType === 'string'
                            ? 'UTF-8 String'
                            : '32-bit Integer'}
                        </span>
                      </div>
                      {keyType === 'secret' && (
                        <div className="col-span-2 flex items-center">
                          <span className="text-gray-400">Seed:</span>
                          <span className="ml-1 font-mono text-xs text-gray-400 break-all">
                            {showOutputSeed ? seed : '•'.repeat(seed.length)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowOutputSeed(!showOutputSeed)}
                            className="ml-2 text-gray-400 hover:text-white transition-colors"
                            title="Toggle seed visibility"
                          >
                            {showOutputSeed ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(seed);
                            }}
                            className="ml-2 text-gray-400 hover:text-white transition-colors"
                            title="Copy seed"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Node visualization */}
              {renderNodes()}

              {encryptedData && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleDecrypt}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 font-medium transition-colors"
                  >
                    RUN DECRYPT
                  </button>
                  <button
                    onClick={() => {
                      const shares = Array.isArray(encryptedData) ? encryptedData : [encryptedData];
                      const params = new URLSearchParams({
                        keyType: keyType,
                        nodeCount: nodeCount.toString(),
                        inputType: inputType,
                        shares: JSON.stringify(shares)
                      });
                      const url = `/decrypt?${params.toString()}`;
                      window.open(url, '_blank');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 font-medium transition-colors flex flex-col items-center gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      SHARE ENCRYPTED DATA
                    </div>
                    <div className="text-xs font-normal">
                      {keyType === 'secret' 
                        ? 'Opens decrypt page with encrypted shares (seed required)'
                        : 'Opens decrypt page with encrypted shares'}
                    </div>
                  </button>
                </div>
              )}

              {decryptedData && (
                <div className="mt-4">
                  <div className="p-4 border border-gray-600">
                    <h3 className="font-medium mb-2 text-white flex items-center text-sm">
                      DECRYPTED OUTPUT
                    </h3>
                    <div className=" p-3  font-mono text-sm text-green-400 break-all">
                      {decryptedData}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Operation Details */}
        <div className="mt-6">
          <div className="p-4 border border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-white font-mono">
              STORE OPERATION REFERENCE
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Single Node */}
              <div className="border border-gray-600 p-3">
                <h3 className="font-mono text-white mb-2">SINGLE NODE</h3>
                <div className="space-y-1 text-gray-300">
                  <div>
                    <span className="text-white">Implementation:</span> XSalsa20
                    stream cipher + Poly1305 MAC
                  </div>
                  <div>
                    <span className="text-white">Types:</span> 32-bit signed
                    integer, UTF-8 string (4096 bytes max)
                  </div>
                  <div>
                    <span className="text-white">Security:</span> Authenticated
                    encryption
                  </div>
                </div>
              </div>

              {/* Multiple Nodes */}
              <div className="border border-gray-600 p-3">
                <h3 className="font-mono text-white mb-2">MULTIPLE NODES</h3>
                <div className="space-y-1 text-gray-300">
                  <div>
                    <span className="text-white">Implementation:</span>{' '}
                    XOR-based secret sharing
                  </div>
                  <div>
                    <span className="text-white">Types:</span> 32-bit signed
                    integer, UTF-8 string (4096 bytes max)
                  </div>
                  <div>
                    <span className="text-white">Security:</span> Distributed
                    across cluster nodes
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 border border-gray-600">
              <h3 className="font-mono text-white mb-2">KEY TYPES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-white font-mono">SecretKey:</span>
                  <span className="text-gray-300 ml-2">
                    Contains blinding masks for exclusive access control
                  </span>
                </div>
                <div>
                  <span className="text-white font-mono">ClusterKey:</span>
                  <span className="text-gray-300 ml-2">
                    Coordination key without cryptographic material
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

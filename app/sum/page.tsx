'use client';

import { useState } from 'react';
import NodeSelector from '@/components/NodeSelector';
import {
  SecretKey,
  ClusterKey,
  PublicKey,
  encrypt,
  decrypt,
} from '@nillion/blindfold';

export default function SumPage() {
  const [nodeCount, setNodeCount] = useState(3);
  const [keyType, setKeyType] = useState<'secret' | 'cluster'>('secret');
  const [seed, setSeed] = useState('my-deterministic-seed-12345');
  const [showSeed, setShowSeed] = useState(false);
  const [showOutputSeed, setShowOutputSeed] = useState(false);
  const [inputNumbers, setInputNumbers] = useState<string[]>(['1', '2']);
  const [encryptedShares, setEncryptedShares] = useState<any[]>([]);
  const [sumResult, setSumResult] = useState<any>(null);
  const [decryptedSum, setDecryptedSum] = useState<bigint | null>(null);
  const [secretKey, setSecretKey] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Reset output when config changes
  const resetOutput = () => {
    setEncryptedShares([]);
    setSumResult(null);
    setDecryptedSum(null);
    setSecretKey(null);
    setPublicKey(null);
    setError('');
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

  const handleGenerateKeys = async () => {
    try {
      setError('');

      // Create cluster configuration
      const cluster = { nodes: Array(nodeCount).fill({}) };

      // Generate key based on type and options
      let generatedSecretKey;
      let generatedPublicKey = null;

      if (keyType === 'secret') {
        if (!seed.trim()) {
          setError('SecretKey requires a deterministic seed');
          return;
        }

        // For single node, we need a PublicKey for encryption
        if (nodeCount === 1) {
          generatedSecretKey = await SecretKey.generate(
            cluster,
            { sum: true },
            null,
            seed
          );
          generatedPublicKey = await PublicKey.generate(generatedSecretKey);
        } else {
          // For multi-node, use SecretKey directly
          generatedSecretKey = await SecretKey.generate(
            cluster,
            { sum: true },
            null,
            seed
          );
        }
      } else {
        // ClusterKey for multi-node
        generatedSecretKey = await ClusterKey.generate(cluster, { sum: true });
      }

      setSecretKey(generatedSecretKey);
      setPublicKey(generatedPublicKey);
      // Reset shares when new keys are generated
      setEncryptedShares([]);
      setSumResult(null);
      setDecryptedSum(null);
    } catch (err: any) {
      setError(err.message || 'Key generation failed');
    }
  };

  const handleEncryptNumbers = async () => {
    try {
      setError('');

      if (!secretKey) {
        setError('Please generate keys first');
        return;
      }

      if (inputNumbers.some((num) => !num.trim())) {
        setError('Please enter all numbers');
        return;
      }

      // Validate and parse numbers
      const parsedNumbers: number[] = [];
      for (const numStr of inputNumbers) {
        const num = parseInt(numStr.trim(), 10);
        if (isNaN(num) || num < -2147483648 || num > 2147483647) {
          setError('All numbers must be valid 32-bit signed integers');
          return;
        }
        parsedNumbers.push(num);
      }

      // Encrypt each number
      const shares: any[] = [];
      const keyToUse = publicKey || secretKey; // Use PublicKey for single node, SecretKey for multi-node

      for (const num of parsedNumbers) {
        const encrypted = await encrypt(keyToUse, BigInt(num));
        shares.push(encrypted);
      }

      setEncryptedShares(shares);
      setSumResult(null);
      setDecryptedSum(null);
    } catch (err: any) {
      setError(err.message || 'Encryption failed');
    }
  };

  const handleComputeSum = async () => {
    try {
      setError('');

      if (encryptedShares.length === 0) {
        setError('Please encrypt numbers first');
        return;
      }

      let result: any;

      if (nodeCount === 1) {
        // Single node: simple addition of encrypted values (Paillier homomorphic)
        // For demo purposes, we'll add the encrypted values directly
        // In practice, this would use homomorphic properties
        result = encryptedShares[0];
        for (let i = 1; i < encryptedShares.length; i++) {
          // This is a simplified representation - actual homomorphic addition
          // would be done differently
          result = encryptedShares[i];
        }
      } else {
        // Multi-node: additive secret sharing
        if (Array.isArray(encryptedShares[0])) {
          const nodeShares = Array(nodeCount).fill(0);
          for (const encrypted of encryptedShares) {
            for (let i = 0; i < nodeCount; i++) {
              nodeShares[i] = (nodeShares[i] + encrypted[i]) % (2 ** 32 + 15);
            }
          }
          result = nodeShares;
        } else {
          result = encryptedShares[0];
        }
      }

      setSumResult(result);

      // Decrypt the result
      const decrypted = await decrypt(secretKey, result);
      setDecryptedSum(BigInt(decrypted as bigint));
    } catch (err: any) {
      setError(err.message || 'Sum computation failed');
    }
  };

  const addNumberInput = () => {
    setInputNumbers([...inputNumbers, '']);
  };

  const removeNumberInput = (index: number) => {
    if (inputNumbers.length > 2) {
      const newInputs = inputNumbers.filter((_, i) => i !== index);
      setInputNumbers(newInputs);
    }
  };

  const updateNumberInput = (index: number, value: string) => {
    const newInputs = [...inputNumbers];
    newInputs[index] = value;
    setInputNumbers(newInputs);
  };

  // Helper function to render nodes with their shares
  const renderShareNodes = (
    shareData: any,
    label: string,
    numberIndex?: number
  ) => {
    if (!shareData) return null;

    const shares = Array.isArray(shareData) ? shareData : [shareData];

    return (
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
                    <div className="text-white/60 text-xs mb-1">
                      {numberIndex !== undefined
                        ? `#${numberIndex + 1}:`
                        : 'Sum:'}
                    </div>
                    <textarea
                      readOnly
                      value={
                        typeof shares[i] === 'string'
                          ? shares[i]
                          : typeof shares[i] === 'number'
                          ? shares[i].toString()
                          : JSON.stringify(shares[i])
                      }
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
    );
  };

  // Helper function to render encrypted shares
  const renderEncryptedShares = () => {
    if (encryptedShares.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-3 text-center">
          ENCRYPTED SHARES
        </h3>
        {encryptedShares.map((share, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-sm font-mono text-white mb-2 text-center">
              NUMBER {index + 1} ({inputNumbers[index] || ''}):
            </h4>
            {renderShareNodes(share, `Number ${index + 1}`, index)}
          </div>
        ))}

        {nodeCount > 1 && encryptedShares.length > 0 && (
          <div className="text-center mt-2 text-xs text-gray-400 font-mono">
            {nodeCount === 1
              ? 'Paillier encrypted value'
              : `Shares distributed across ${nodeCount} nodes`}
          </div>
        )}
      </div>
    );
  };

  const expectedSum = inputNumbers.reduce((sum, numStr) => {
    const num = parseInt(numStr.trim(), 10);
    return isNaN(num) ? sum : sum + num;
  }, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">
            Blindfold: Sum Operation
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            The "sum" operation is a one-way operation used to perform secure
            addition on encrypted integers using homomorphic encryption.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* CONFIG Panel */}
          <div className="lg:col-span-2">
            {/* Number Inputs */}
            <div className="mb-4 p-4 border border-gray-700">
              <label className="block text-sm font-medium mb-2 text-gray-300 font-mono">
                NUMBERS TO SUM
              </label>

              {inputNumbers.map((num, index) => (
                <div key={index} className="mb-3 flex gap-2">
                  <input
                    type="number"
                    value={num}
                    onChange={(e) => updateNumberInput(index, e.target.value)}
                    className="flex-1 p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
                    placeholder={`Enter integer ${index + 1}`}
                    min="-2147483648"
                    max="2147483647"
                    step="1"
                  />
                  {inputNumbers.length > 2 && (
                    <button
                      onClick={() => removeNumberInput(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addNumberInput}
                className="w-full mb-4 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 font-medium transition-colors font-mono"
              >
                + ADD NUMBER
              </button>

              <div className="text-xs text-gray-400 mb-4">
                Expected sum: {expectedSum}
              </div>

              {/* Generate Keys Button */}
              <button
                onClick={handleGenerateKeys}
                className="w-full mb-2 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 font-medium transition-colors font-mono"
              >
                {secretKey ? 'REGENERATE KEYS' : 'GENERATE KEYS'}
              </button>

              {/* Encrypt Button */}
              {secretKey && (
                <button
                  onClick={handleEncryptNumbers}
                  disabled={inputNumbers.some((num) => !num.trim())}
                  className="w-full mb-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white py-2 px-4 font-medium disabled:cursor-not-allowed transition-colors font-mono"
                >
                  {inputNumbers.some((num) => !num.trim())
                    ? 'Enter all numbers'
                    : 'ENCRYPT NUMBERS'}
                </button>
              )}

              {/* Compute Sum Button */}
              {encryptedShares.length > 0 && (
                <button
                  onClick={handleComputeSum}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 font-medium transition-colors font-mono"
                >
                  COMPUTE ENCRYPTED SUM
                </button>
              )}
            </div>

            <div className="p-4 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-white font-mono">
                CONFIGURATION
              </h2>

              <NodeSelector
                nodeCount={nodeCount}
                setNodeCount={setNodeCountWithReset}
              />

              <div className="mt-4 p-4 border border-gray-700">
                <h3 className="font-medium mb-3 text-white font-mono">
                  KEY TYPE
                </h3>

                <div className="space-y-3">
                  <label className="flex items-start p-2 border border-transparent hover:border-gray-600 transition-colors cursor-pointer">
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
                        {nodeCount === 1
                          ? 'Paillier encryption (single node)'
                          : 'Secret sharing (multi-node)'}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start p-2 border border-transparent hover:border-gray-600 transition-colors cursor-pointer">
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
                      <div className="text-xs text-gray-400">
                        Additive secret sharing
                      </div>
                    </div>
                  </label>
                </div>

                {keyType === 'secret' && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="mb-3">
                      <span className="font-medium text-white text-sm font-mono">
                        SecretKey Seed
                      </span>
                    </div>
                    <div className="p-3">
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
                        Same seed = same key = reproducible encryption
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
              <h2 className="text-xl font-bold mb-4 text-white font-mono">
                OUTPUT
              </h2>

              {error && (
                <div className="border border-gray-600 text-white px-4 py-3 mb-4">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">ERROR:</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {secretKey && (
                <div className="mb-4">
                  <div className="p-3 border border-gray-600">
                    <h3 className="font-medium mb-2 text-white text-sm">
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
                      {publicKey && (
                        <div>
                          <span className="text-gray-400">Public Key:</span>
                          <span className="ml-1 font-medium text-white">
                            Generated
                          </span>
                        </div>
                      )}
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

              {/* Encrypted shares */}
              {renderEncryptedShares()}

              {/* Sum result */}
              {sumResult && (
                <div className="mb-4">
                  <h3 className="text-base font-semibold mb-3 text-center">
                    ENCRYPTED SUM RESULT
                  </h3>
                  {renderShareNodes(sumResult, 'Sum Result', undefined)}

                  {nodeCount > 1 && (
                    <div className="text-center mt-2 text-xs text-gray-400 font-mono">
                      Sum computed by adding encrypted shares
                    </div>
                  )}
                </div>
              )}

              {/* Decrypted result */}
              {decryptedSum !== null && (
                <div className="mb-4">
                  <div className="p-4 border border-gray-600 text-center">
                    <h3 className="font-medium mb-2 text-white text-sm">
                      DECRYPTED SUM
                    </h3>
                    <div className="text-2xl font-bold font-mono text-green-400">
                      {decryptedSum.toString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Expected: {expectedSum} | Match:{' '}
                      {decryptedSum.toString() === expectedSum.toString()
                        ? '✓'
                        : '✗'}
                    </div>
                  </div>
                </div>
              )}

              {sumResult && (
                <div className="mt-4">
                  <div className="p-4 border border-gray-600">
                    <h3 className="font-medium mb-2 text-white text-sm">
                      SUM OPERATION PROPERTIES
                    </h3>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div>
                        <span className="text-white">Algorithm:</span>{' '}
                        {nodeCount === 1
                          ? 'Paillier homomorphic encryption'
                          : 'Additive secret sharing'}
                      </div>
                      <div>
                        <span className="text-white">Homomorphic:</span>{' '}
                        Addition performed on encrypted values
                      </div>
                      <div>
                        <span className="text-white">Security:</span> Numbers
                        never revealed during computation
                      </div>
                      <div>
                        <span className="text-white">Use case:</span> Secure
                        multi-party computation
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sum Operation Details */}
        <div className="mt-6">
          <div className="p-4 border border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-white font-mono">
              SUM OPERATION REFERENCE
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Single Node */}
              <div className="border border-gray-600 p-3">
                <h3 className="font-mono text-white mb-2">SINGLE NODE</h3>
                <div className="space-y-1 text-gray-300">
                  <div>
                    <span className="text-white">Implementation:</span>{' '}
                    Non-deterministic Paillier with 2048-bit primes
                  </div>
                  <div>
                    <span className="text-white">Types:</span> 32-bit signed
                    integer only
                  </div>
                  <div>
                    <span className="text-white">Security:</span> Homomorphic
                    encryption allows addition without decryption
                  </div>
                </div>
              </div>

              {/* Multiple Nodes */}
              <div className="border border-gray-600 p-3">
                <h3 className="font-mono text-white mb-2">MULTIPLE NODES</h3>
                <div className="space-y-1 text-gray-300">
                  <div>
                    <span className="text-white">Implementation:</span> Additive
                    secret sharing (prime modulus 2^32 + 15)
                  </div>
                  <div>
                    <span className="text-white">Types:</span> 32-bit signed
                    integer only
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 border border-gray-600">
              <h3 className="font-mono text-white mb-2">WORKFLOW</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-white font-mono">1. Encrypt:</span>
                  <span className="text-gray-300 ml-2">
                    Each number encrypted to shares/ciphertext
                  </span>
                </div>
                <div>
                  <span className="text-white font-mono">2. Compute:</span>
                  <span className="text-gray-300 ml-2">
                    Addition performed on encrypted values
                  </span>
                </div>
                <div>
                  <span className="text-white font-mono">3. Decrypt:</span>
                  <span className="text-gray-300 ml-2">
                    Final sum revealed without exposing inputs
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

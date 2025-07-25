'use client';

import { useState } from 'react';
import NodeSelector from '@/components/NodeSelector';
import { SecretKey, ClusterKey, encrypt } from '@nillion/blindfold';

export default function MatchPage() {
  const [nodeCount, setNodeCount] = useState(3);
  const [keyType, setKeyType] = useState<'secret' | 'cluster'>('secret');
  const [seed, setSeed] = useState('my-deterministic-seed-12345');
  const [inputData1, setInputData1] = useState('');
  const [inputData2, setInputData2] = useState('');
  const [inputType, setInputType] = useState<'string' | 'integer'>('string');
  const [hash1, setHash1] = useState<any>(null);
  const [hash2, setHash2] = useState<any>(null);
  const [key, setKey] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [matchResult, setMatchResult] = useState<boolean | null>(null);

  // Reset output when config changes
  const resetOutput = () => {
    setHash1(null);
    setHash2(null);
    setMatchResult(null);
    setKey(null);
    setError('');
  };

  const setInputTypeWithReset = (type: 'string' | 'integer') => {
    setInputType(type);
    setInputData1(''); // Clear input when switching types
    setInputData2('');
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

  const handleGenerateKey = async () => {
    try {
      setError('');

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
          { match: true },
          null,
          seed
        );
      } else {
        generatedKey = await ClusterKey.generate(cluster, { match: true });
      }

      setKey(generatedKey);
      // Reset hashes when new key is generated
      setHash1(null);
      setHash2(null);
      setMatchResult(null);
    } catch (err: any) {
      setError(err.message || 'Key generation failed');
    }
  };

  const handleGenerateHashes = async () => {
    try {
      setError('');

      if (!key) {
        setError('Please generate a key first');
        return;
      }

      if (!inputData1.trim() || !inputData2.trim()) {
        setError('Please enter both inputs');
        return;
      }

      // Prepare data based on type
      let data1, data2;
      if (inputType === 'integer') {
        const num1 = parseInt(inputData1, 10);
        const num2 = parseInt(inputData2, 10);
        if (
          isNaN(num1) ||
          num1 < -2147483648 ||
          num1 > 2147483647 ||
          isNaN(num2) ||
          num2 < -2147483648 ||
          num2 > 2147483647
        ) {
          setError(
            'Please enter valid 32-bit signed integers (-2,147,483,648 to 2,147,483,647)'
          );
          return;
        }
        data1 = BigInt(num1);
        data2 = BigInt(num2);
      } else {
        if (
          new TextEncoder().encode(inputData1).length > 4096 ||
          new TextEncoder().encode(inputData2).length > 4096
        ) {
          setError('String data must be 4096 bytes or less');
          return;
        }
        data1 = inputData1;
        data2 = inputData2;
      }

      // Generate hashes for both inputs using the same key
      const generatedHash1 = await encrypt(key, data1);
      const generatedHash2 = await encrypt(key, data2);

      setHash1(generatedHash1);
      setHash2(generatedHash2);

      // Compare hashes to determine if inputs match
      const doHashesMatch =
        JSON.stringify(generatedHash1) === JSON.stringify(generatedHash2);
      setMatchResult(doHashesMatch);
    } catch (err: any) {
      setError(err.message || 'Hash generation failed');
    }
  };

  // Helper function to render nodes with their hashes
  const renderHashNodes = (hashData: any, label: string) => {
    if (!hashData) return null;

    const hashes = Array.isArray(hashData) ? hashData : [hashData];

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

                {/* Hash display */}
                <div className="p-2 min-h-[60px] flex items-center border border-gray-700">
                  <div className="w-full">
                    <div className="text-white/60 text-xs mb-1">Hash:</div>
                    <textarea
                      readOnly
                      value={
                        typeof hashes[i] === 'string'
                          ? hashes[i]
                          : JSON.stringify(hashes[i])
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

  // Helper function to render comparison results
  const renderComparison = () => {
    if (!hash1 || !hash2) return null;

    return (
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-3 text-center">
          HASH COMPARISON
        </h3>

        {/* Match Result */}
        <div className="mb-4 p-4 border border-gray-600 text-center">
          <div className="text-sm text-gray-400 mb-2">Match Result:</div>
          <div
            className={`text-lg font-bold font-mono ${
              matchResult ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {matchResult ? '✓ HASHES MATCH' : '✗ HASHES DO NOT MATCH'}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {matchResult
              ? 'Same input values produce identical hashes'
              : 'Different input values produce different hashes'}
          </div>
        </div>

        {/* Hash 1 Nodes */}
        <div className="mb-3">
          <h4 className="text-sm font-mono text-white mb-2">INPUT 1 HASH:</h4>
          {renderHashNodes(hash1, 'Input 1')}
        </div>

        {/* Hash 2 Nodes */}
        <div className="mb-3">
          <h4 className="text-sm font-mono text-white mb-2">INPUT 2 HASH:</h4>
          {renderHashNodes(hash2, 'Input 2')}
        </div>

        {nodeCount > 1 && (
          <div className="text-center mt-2 text-xs text-gray-400 font-mono">
            Same hash replicated across {nodeCount} nodes
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
            Blindfold: Match Operation
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            The "match" operation is a one-way operation used to generate
            deterministic hashes for privacy-preserving search and matching
            operations.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* CONFIG Panel */}
          <div className="lg:col-span-2">
            {/* Data Input - Two inputs for comparison */}
            <div className="mb-4 p-4 border border-gray-700">
              <label className="block text-sm font-medium mb-2 text-gray-300 font-mono">
                DATA INPUTS FOR COMPARISON
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

              {/* Input 1 */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1 text-gray-400 font-mono">
                  INPUT 1:
                </label>
                {inputType === 'string' ? (
                  <>
                    <textarea
                      value={inputData1}
                      onChange={(e) => setInputData1(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all resize-none font-mono"
                      rows={2}
                      placeholder="Enter first text value"
                      maxLength={4096}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {new TextEncoder().encode(inputData1).length}/4096 bytes
                    </div>
                  </>
                ) : (
                  <input
                    type="number"
                    value={inputData1}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseInt(val, 10);
                      if (
                        val === '' ||
                        (!isNaN(num) && num >= -2147483648 && num <= 2147483647)
                      ) {
                        setInputData1(val);
                      }
                    }}
                    className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
                    placeholder="Enter first integer"
                    min="-2147483648"
                    max="2147483647"
                    step="1"
                  />
                )}
              </div>

              {/* Input 2 */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1 text-gray-400 font-mono">
                  INPUT 2:
                </label>
                {inputType === 'string' ? (
                  <>
                    <textarea
                      value={inputData2}
                      onChange={(e) => setInputData2(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all resize-none font-mono"
                      rows={2}
                      placeholder="Enter second text value"
                      maxLength={4096}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {new TextEncoder().encode(inputData2).length}/4096 bytes
                    </div>
                  </>
                ) : (
                  <input
                    type="number"
                    value={inputData2}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseInt(val, 10);
                      if (
                        val === '' ||
                        (!isNaN(num) && num >= -2147483648 && num <= 2147483647)
                      ) {
                        setInputData2(val);
                      }
                    }}
                    className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
                    placeholder="Enter second integer"
                    min="-2147483648"
                    max="2147483647"
                    step="1"
                  />
                )}
              </div>

              {/* Generate Key Button */}
              <button
                onClick={handleGenerateKey}
                className="w-full mb-2 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 font-medium transition-colors font-mono"
              >
                {key ? 'REGENERATE KEY' : 'GENERATE KEY'}
              </button>

              {/* Generate Hashes Button - only show if key exists */}
              {key && (
                <button
                  onClick={handleGenerateHashes}
                  disabled={!inputData1.trim() || !inputData2.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 font-medium disabled:cursor-not-allowed transition-colors font-mono"
                >
                  {!inputData1.trim() || !inputData2.trim()
                    ? 'Enter both inputs'
                    : 'COMPARE HASHES'}
                </button>
              )}
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
                        Deterministic hashing with salt
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
                      <input
                        type="text"
                        value={seed}
                        onChange={(e) => setSeedWithReset(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all font-mono"
                        placeholder="Enter deterministic seed"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        Same seed = same key = same hash for same input
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
                          {key.constructor.name}
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
                        <div className="col-span-2">
                          <span className="text-gray-400">Seed:</span>
                          <span className="ml-1 font-mono text-xs text-gray-400 break-all">
                            {seed}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hash comparison visualization */}
              {renderComparison()}

              {(hash1 || hash2) && (
                <div className="mt-4">
                  <div className="p-4 border border-gray-600">
                    <h3 className="font-medium mb-2 text-white flex items-center text-sm">
                      MATCH OPERATION PROPERTIES
                    </h3>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div>
                        <span className="text-white">Algorithm:</span> SHA-512
                        with key salt
                      </div>
                      <div>
                        <span className="text-white">Deterministic:</span> Same
                        input + same key = same hash
                      </div>
                      <div>
                        <span className="text-white">One-way:</span> Cannot
                        reverse hash to get original data
                      </div>
                      <div>
                        <span className="text-white">Use case:</span>{' '}
                        Privacy-preserving equality comparison
                      </div>
                      <div>
                        <span className="text-white">Workflow:</span> Generate
                        key → Hash inputs → Compare hashes
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Operation Details */}
        <div className="mt-6">
          <div className="p-4 border border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-white font-mono">
              MATCH OPERATION REFERENCE
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Single Node */}
              <div className="border border-gray-600 p-3">
                <h3 className="font-mono text-white mb-2">SINGLE NODE</h3>
                <div className="space-y-1 text-gray-300">
                  <div>
                    <span className="text-white">Implementation:</span>{' '}
                    Deterministic salted hashing via SHA-512
                  </div>
                  <div>
                    <span className="text-white">Types:</span> 32-bit signed
                    integer, UTF-8 string (4096 bytes max)
                  </div>
                  <div>
                    <span className="text-white">Security:</span> One-way hash
                    with key material as salt
                  </div>
                </div>
              </div>

              {/* Multiple Nodes */}
              <div className="border border-gray-600 p-3">
                <h3 className="font-mono text-white mb-2">MULTIPLE NODES</h3>
                <div className="space-y-1 text-gray-300">
                  <div>
                    <span className="text-white">Implementation:</span>{' '}
                    Deterministic salted hashing via SHA-512
                  </div>
                  <div>
                    <span className="text-white">Types:</span> 32-bit signed
                    integer, UTF-8 string (4096 bytes max)
                  </div>
                  <div>
                    <span className="text-white">Distribution:</span> Same hash
                    replicated on all nodes
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 border border-gray-600">
              <h3 className="font-mono text-white mb-2">MATCH VS STORE</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-white font-mono">Match:</span>
                  <span className="text-gray-300 ml-2">
                    Deterministic hash for searching, one-way operation
                  </span>
                </div>
                <div>
                  <span className="text-white font-mono">Store:</span>
                  <span className="text-gray-300 ml-2">
                    Encryption for storage, reversible operation
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

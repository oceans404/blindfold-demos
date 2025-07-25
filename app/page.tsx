'use client';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-8 text-white font-mono">
        BLINDFOLD LIBRARY
      </h1>

      <div className="mb-8">
        <p className="text-lg mb-4 text-gray-300">
          The{' '}
          <a
            href="https://docs.nillion.com/build/private-storage/blindfold"
            className="text-blue-500 hover:text-blue-400"
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
          <div className="border border-gray-600 p-3">
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
          <div className="border border-gray-600 p-3">
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
        <div className="border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-white font-mono">
            STORE
          </h2>
          <p className="mb-4 text-gray-300 text-sm">
            Encrypt data for secure storage on cluster nodes using authenticated
            encryption or secret sharing.
          </p>
          <a
            href="/store"
            className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 transition-colors font-mono"
          >
            DEMO
          </a>
        </div>

        <div className="border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-white font-mono">
            MATCH
          </h2>
          <p className="mb-4 text-gray-300 text-sm">
            Generate deterministic hashes for privacy-preserving search and
            matching operations.
          </p>
          <a
            href="/match"
            className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 transition-colors font-mono"
          >
            DEMO
          </a>
        </div>

        <div className="border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-white font-mono">
            SUM
          </h2>
          <p className="mb-4 text-gray-300 text-sm">
            Perform secure addition on encrypted integers using homomorphic
            encryption or secret sharing.
          </p>
          <a
            href="/sum"
            className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 transition-colors font-mono"
          >
            DEMO
          </a>
        </div>
      </div>

      {/* Detailed Operations Table */}
      <div className="border border-gray-700 p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-white font-mono">
          OPERATION REFERENCE
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
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
              <tr className="border-b border-gray-700">
                <td className="py-2 px-2 font-mono">single node</td>
                <td className="py-2 px-2 font-mono">store</td>
                <td className="py-2 px-2">
                  XSalsa20 stream cipher + Poly1305 MAC
                </td>
                <td className="py-2 px-2">
                  32-bit signed integer; UTF-8 string (4096 bytes)
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-2 font-mono">single node</td>
                <td className="py-2 px-2 font-mono">match</td>
                <td className="py-2 px-2">
                  deterministic salted hashing via SHA-512
                </td>
                <td className="py-2 px-2">
                  32-bit signed integer; UTF-8 string (4096 bytes)
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-2 font-mono">single node</td>
                <td className="py-2 px-2 font-mono">sum</td>
                <td className="py-2 px-2">
                  non-deterministic Paillier with 2048-bit primes
                </td>
                <td className="py-2 px-2">32-bit signed integer</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-2 font-mono">multiple nodes</td>
                <td className="py-2 px-2 font-mono">store</td>
                <td className="py-2 px-2">XOR-based secret sharing</td>
                <td className="py-2 px-2">
                  32-bit signed integer; UTF-8 string (4096 bytes)
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-2 font-mono">multiple nodes</td>
                <td className="py-2 px-2 font-mono">match</td>
                <td className="py-2 px-2">
                  deterministic salted hashing via SHA-512
                </td>
                <td className="py-2 px-2">
                  32-bit signed integer; UTF-8 string (4096 bytes)
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-2 font-mono">multiple nodes</td>
                <td className="py-2 px-2 font-mono">sum</td>
                <td className="py-2 px-2">
                  additive secret sharing (no threshold; prime modulus 2^32 +
                  15)
                </td>
                <td className="py-2 px-2">32-bit signed integer</td>
              </tr>
              <tr>
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
          <div className="border border-gray-600 p-4">
            <h3 className="font-mono text-white mb-2">SecretKey</h3>
            <p className="text-gray-300 text-sm">
              Contains blinding masks for exclusive access control. Requires
              deterministic seed for reproducible key generation.
            </p>
          </div>
          <div className="border border-gray-600 p-4">
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

# Blindfold Demo Application

This is a Next.js demo application showcasing the capabilities of the `@nillion/blindfold` cryptographic library.

## Features

The demo includes interactive pages for cryptographic operations:

1. **Store**: Encrypt and decrypt data using symmetric encryption or XOR secret sharing
2. **Match**: Perform equality comparisons on encrypted data without decryption
3. **Sum**: Add encrypted integers using homomorphic encryption or secret sharing
4. **Decrypt**: Decrypt shared encrypted data using provided shares and keys

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm or pnpm

### Installation

```bash
npm install
```

### Running the Demo

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the demo.

## Usage

Each demo page allows you to:

1. **Select the number of nodes** (1-10) using a slider
2. **Choose key type** (SecretKey with seed or ClusterKey)
3. **Enter data** to encrypt (strings or integers)
4. **Encrypt the data** with the selected configuration
5. **Perform operations** on the encrypted data
6. **Decrypt the results** to verify correctness

### Sharing Encrypted Data

The Store page includes a sharing feature:
1. After encrypting data, click "SHARE ENCRYPTED DATA"
2. A new tab opens with the decrypt page containing the encrypted shares
3. Share this URL with others who have the decryption key/seed
4. Recipients enter the seed to decrypt the data

### Store Operation
- Supports UTF-8 strings (up to 4096 bytes) and 32-bit signed integers
- Single node: Uses XSalsa20 stream cipher with Poly1305 MAC
- Multi-node: Uses XOR-based secret sharing
- **Share encrypted data**: Click "SHARE ENCRYPTED DATA" to open a decrypt link with the encrypted shares
- Supports both SecretKey (with deterministic seed) and ClusterKey

### Match Operation
- Compare two encrypted values for equality
- Uses deterministic salted hashing (SHA-512)
- Equal plaintexts produce equal ciphertexts
- Supports both strings and integers

### Sum Operation
- Add encrypted 32-bit signed integers
- Single node: Paillier homomorphic encryption
- Multi-node: Additive secret sharing
- Compute sums without decrypting individual values

### Decrypt Operation
- Decrypt data shared from the Store page
- Accepts encrypted shares via URL parameters
- Visual node representation shows encrypted shares
- Requires the original seed for SecretKey decryption
- Supports editing shares if needed

## Architecture

The application uses:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- @nillion/blindfold for cryptographic operations

## Learn More

- [Blindfold Documentation](https://github.com/nillionnetwork/blindfold-ts)
- [Nillion Network](https://nillion.com)
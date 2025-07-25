# Blindfold Demo Application

This is a Next.js demo application showcasing the capabilities of the `@nillion/blindfold` cryptographic library.

## Features

The demo includes interactive pages for each of the three main operations:

1. **Store**: Encrypt and decrypt strings using symmetric encryption or XOR secret sharing
2. **Match**: Perform equality comparisons on encrypted data without decryption
3. **Sum**: Add encrypted integers using homomorphic encryption or secret sharing

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

1. **Select the number of nodes** (1-5) using a slider
2. **Enter data** to encrypt
3. **Encrypt the data** with the selected configuration
4. **Perform operations** on the encrypted data
5. **Decrypt the results** to verify correctness

### Store Operation
- Supports text strings up to 4096 bytes
- Single node: Uses XSalsa20 stream cipher
- Multi-node: Uses XOR-based secret sharing

### Match Operation
- Compare two encrypted values for equality
- Uses deterministic salted hashing (SHA-512)
- Equal plaintexts produce equal ciphertexts

### Sum Operation
- Add encrypted 32-bit signed integers
- Single node: Paillier homomorphic encryption
- Multi-node: Additive or Shamir's secret sharing
- Supports threshold decryption for multi-node setups

## Architecture

The application uses:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- @nillion/blindfold for cryptographic operations

## Learn More

- [Blindfold Documentation](https://github.com/nillionnetwork/blindfold-ts)
- [Nillion Network](https://nillion.com)
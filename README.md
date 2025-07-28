# Charms Wallet JS

Professional Bitcoin wallet library built on the modern @scure cryptographic stack. Extracted from the Charms ecosystem to provide secure, modular wallet functionality for Bitcoin applications.

## 🔮 Features

- **Secure HD Wallet**: BIP32/BIP39/BIP86 compliant hierarchical deterministic wallets
- **Taproot Support**: Native P2TR (Pay-to-Taproot) address generation and validation
- **Modern Cryptography**: Built on @scure stack for maximum security and performance
- **Transaction Building**: Professional transaction construction with mining support
- **Multi-Network**: Support for mainnet, testnet, and testnet4
- **TypeScript**: Full type safety with comprehensive TypeScript definitions
- **Zero Dependencies**: Minimal, secure dependencies focused on cryptography

## 📦 Installation

```bash
npm install charms-wallet-js
```

## 🚀 Quick Start

```javascript
import { CharmsWallet } from 'charms-wallet-js';

// Create wallet instance
const wallet = new CharmsWallet({ network: 'testnet' });

// Generate mnemonic
const mnemonic = wallet.generateMnemonic();
console.log('Mnemonic:', mnemonic);

// Generate Taproot address
const address = await wallet.generateAddress(mnemonic);
console.log('Address:', address);

// Validate address
const validation = wallet.validateAddress(address);
console.log('Valid:', validation.valid);
```

## 🔧 Core Functionality

### Wallet Creation and Management

```javascript
import { CharmsWallet } from 'charms-wallet-js';

// Create wallet with custom configuration
const wallet = new CharmsWallet({
    network: 'mainnet',
    derivationPath: "m/86'/0'/0'", // BIP86 Taproot
    addressType: 'taproot'
});

// Generate secure mnemonic (12 or 24 words)
const mnemonic12 = wallet.generateMnemonic(12);
const mnemonic24 = wallet.generateMnemonic(24);

// Validate mnemonic
const validation = wallet.validateMnemonic(mnemonic12);
if (validation.valid) {
    console.log('Mnemonic is valid');
} else {
    console.error('Invalid mnemonic:', validation.error);
}
```

### Address Generation

```javascript
// Generate address for specific network and index (static method)
const address = await CharmsWallet.generateAddress(mnemonic, 'testnet', 0);

// Get private key for specific address index
const privateKey = await CharmsWallet.getPrivateKey(mnemonic, 'testnet', 0);

// Get complete address data (address + keys)
const addressData = await CharmsWallet.getAddressData(mnemonic, 'testnet', 0);
console.log('Address:', addressData.address);
console.log('Private Key:', addressData.privateKey);
console.log('Public Key:', addressData.publicKey);

// Create AddressWallet from private key (no mnemonic needed)
const addressWallet = CharmsWallet.fromPrivateKey(privateKey, 'testnet');
console.log('Address from private key:', addressWallet.getAddress());
```

### Working with Individual Addresses

```javascript
import { AddressWallet } from 'charms-wallet-js';

// Create AddressWallet from private key
const privateKey = await CharmsWallet.getPrivateKey(mnemonic, 'testnet', 0);
const addressWallet = new AddressWallet(privateKey, 'testnet');

// Get address information
console.log('Address:', addressWallet.getAddress());
console.log('Public Key:', addressWallet.getPublicKey());

// Sign transaction without exposing mnemonic
const signedTx = await addressWallet.signTransaction(psbtHex, utxo);
console.log('Signed TX:', signedTx.hex);
```

### Address Validation

```javascript
// Validate any Bitcoin address
const validation = wallet.validateAddress('tb1pe7gfqvmdj7xjhu3awnwt9q3edgyf24dhejx34sc8p7z7gpwv80tqslxpr6');

if (validation.valid) {
    console.log('Network:', validation.network); // 'testnet'
    console.log('Type:', validation.type);       // 'p2tr'
} else {
    console.error('Invalid address:', validation.error);
}
```

### Transaction Building

```javascript
import { TransactionBuilder } from 'charms-wallet-js';

const txBuilder = new TransactionBuilder('testnet');

// Create mining transaction with OP_RETURN data
const miningTx = await txBuilder.createMiningTransaction({
    utxo: {
        txid: 'abc123...',
        vout: 0,
        amount: 100000,
        address: 'tb1p...'
    },
    miningData: {
        hash: 'deadbeef...',
        nonce: 12345
    },
    changeAddress: 'tb1p...',
    feeRate: 10
});

// Create simple transaction
const simpleTx = await txBuilder.createSimpleTransaction({
    utxos: [{
        txid: 'abc123...',
        vout: 0,
        amount: 100000,
        address: 'tb1p...'
    }],
    outputs: [{
        address: 'tb1p...',
        amount: 50000
    }],
    changeAddress: 'tb1p...',
    feeRate: 10
});
```

### Transaction Signing

```javascript
import { TransactionSigner } from 'charms-wallet-js';

const signer = new TransactionSigner('testnet');

// Sign transaction with mnemonic
const signedTx = await signer.signTransaction(psbtHex, mnemonic);

console.log('Signed transaction:', signedTx.hex);
console.log('Transaction ID:', signedTx.txid);
```

## 🌐 Network Support

```javascript
// Mainnet
const mainnetWallet = new CharmsWallet({ network: 'mainnet' });

// Testnet
const testnetWallet = new CharmsWallet({ network: 'testnet' });

// Testnet4
const testnet4Wallet = new CharmsWallet({ network: 'testnet4' });
```

## 🔐 Security Features

- **BIP39**: Secure mnemonic generation and validation
- **BIP32**: Hierarchical deterministic key derivation
- **BIP86**: Taproot key derivation paths
- **@scure Stack**: Modern, audited cryptographic primitives
- **No Key Storage**: Library never stores private keys
- **Secure Random**: Cryptographically secure random number generation

## 🔧 Advanced Usage

**Note**: For advanced transaction building, fee estimation, complex PSBT operations, or low-level cryptographic operations, use the [@scure/btc-signer](https://github.com/paulmillr/scure-btc-signer) library directly. This wallet library provides high-level convenience functions, while @scure offers complete control over Bitcoin transaction construction and signing.

```javascript
// For advanced operations, use @scure directly:
import * as btc from '@scure/btc-signer';

// Advanced transaction building
const tx = new btc.Transaction();
// ... complex transaction logic

// Advanced fee estimation
const feeRate = btc.estimateFee(/* parameters */);

// Complex PSBT operations
const psbt = btc.Transaction.fromPSBT(psbtBytes);
// ... advanced PSBT manipulation
```

## 📋 API Reference

### CharmsWallet

#### Constructor
```typescript
new CharmsWallet(config?: Partial<WalletConfig>)
```

#### Static Methods
- `generateAddress(mnemonic: string, network: Network, index?: number): Promise<string>`
- `getPrivateKey(mnemonic: string, network: Network, index?: number): Promise<Uint8Array>`
- `getAddressData(mnemonic: string, network: Network, index?: number): Promise<TaprootKeys>`
- `fromPrivateKey(privateKey: Uint8Array, network: Network): AddressWallet`

#### Instance Methods
- `generateMnemonic(wordCount?: number): string`
- `validateMnemonic(mnemonic: string): ValidationResult`
- `validateAddress(address: string): AddressValidation`
- `deriveTaprootKeys(mnemonic: string, index?: number): Promise<TaprootKeys>`

### AddressWallet

#### Constructor
```typescript
new AddressWallet(privateKey: Uint8Array, network: Network)
```

#### Methods
- `getAddress(): string`
- `getPublicKey(): Uint8Array`
- `getXOnlyPublicKey(): Uint8Array`
- `signPSBT(psbtHex: string, utxo: UTXO): Promise<TransactionResult>`
- `signTransaction(psbtHex: string, utxo: UTXO): Promise<SignedTransaction>`

### TransactionBuilder

#### Constructor
```typescript
new TransactionBuilder(network?: Network)
```

#### Methods
- `createMiningTransaction(params: MiningTxParams): Promise<string>`
- `createSimpleTransaction(params: SimpleTxParams): Promise<string>`

### TransactionSigner

#### Constructor
```typescript
new TransactionSigner(network?: Network)
```

#### Methods
- `signTransaction(psbtHex: string, mnemonic: string): Promise<SignedTransaction>`
- `signMiningTransaction(psbtHex: string, mnemonic: string): Promise<SignedTransaction>`

## 🔧 Configuration

```typescript
interface WalletConfig {
    network: 'mainnet' | 'testnet' | 'testnet4';
    derivationPath: string;
    addressType: 'taproot' | 'segwit' | 'legacy';
    storage: StorageOptions;
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:basic
npm run test:wallet

# Build library
npm run build

# Development mode (watch)
npm run dev
```

### Test Structure

The library includes comprehensive tests in the `tests/` directory:

- `tests/basic.test.js` - Basic wallet functionality tests
- `tests/wallet.test.js` - Comprehensive wallet feature tests
- `tests/run-all.js` - Test runner for all test suites

All tests are included in the NPM package and can be run by consumers to verify functionality.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Related Projects

- [Charms](https://github.com/charms-project/charms) - Bitcoin smart contracts
- [@scure/bip32](https://github.com/paulmillr/scure-bip32) - HD key derivation
- [@scure/bip39](https://github.com/paulmillr/scure-bip39) - Mnemonic phrases
- [@scure/btc-signer](https://github.com/paulmillr/scure-btc-signer) - Bitcoin transactions

## ⚠️ Security Notice

This library handles sensitive cryptographic material. Always:

- Use in secure environments
- Never log or store private keys
- Validate all inputs
- Keep dependencies updated
- Review code before production use

## 📞 Support

For questions and support:
- GitHub Issues: [Report bugs or request features](https://github.com/charms-project/charms-wallet-js/issues)
- Documentation: [Full API documentation](https://docs.charms.dev)

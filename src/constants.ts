// Constants and network configurations for Charms Wallet JS

import { Network, NetworkConfig } from './types';

// Derivation paths following BIP 86 (Taproot)
export const DERIVATION_PATHS = {
    TAPROOT: "m/86'/0'/0'",
    SEGWIT: "m/84'/0'/0'",
    LEGACY: "m/44'/0'/0'"
} as const;

// Default derivation path for Charms wallets
export const DEFAULT_DERIVATION_PATH = DERIVATION_PATHS.TAPROOT;

// Network configurations
export const NETWORKS: Record<Network, NetworkConfig> = {
    mainnet: {
        name: 'mainnet',
        bech32: 'bc',
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80
    },
    testnet: {
        name: 'testnet',
        bech32: 'tb',
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef
    },
    testnet4: {
        name: 'testnet4',
        bech32: 'tb',
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef
    }
} as const;

// Default network for development
export const DEFAULT_NETWORK: Network = 'testnet';

// Address validation patterns
export const ADDRESS_PATTERNS = {
    MAINNET_P2TR: /^bc1p[a-zA-HJ-NP-Z0-9]{58}$/,
    TESTNET_P2TR: /^tb1p[a-zA-HJ-NP-Z0-9]{58}$/,
    MAINNET_P2WPKH: /^bc1q[a-zA-HJ-NP-Z0-9]{38}$/,
    TESTNET_P2WPKH: /^tb1q[a-zA-HJ-NP-Z0-9]{38}$/,
    LEGACY: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    TESTNET_LEGACY: /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/
} as const;

// Transaction constants
export const TRANSACTION_CONSTANTS = {
    // Minimum fee rate (sat/vB)
    MIN_FEE_RATE: 1,
    // Default fee rate (sat/vB)
    DEFAULT_FEE_RATE: 10,
    // Maximum fee rate (sat/vB)
    MAX_FEE_RATE: 1000,
    // Dust threshold (satoshis)
    DUST_THRESHOLD: 546,
    // Minimum UTXO amount for transactions
    MIN_UTXO_AMOUNT: 1000,
    // Maximum OP_RETURN data size
    MAX_OP_RETURN_SIZE: 80
} as const;

// BIP39 constants
export const BIP39_CONSTANTS = {
    // Entropy bits for 12-word mnemonic
    ENTROPY_BITS_12: 128,
    // Entropy bits for 24-word mnemonic
    ENTROPY_BITS_24: 256,
    // Default word count
    DEFAULT_WORD_COUNT: 12,
    // Supported word counts
    SUPPORTED_WORD_COUNTS: [12, 15, 18, 21, 24] as const
} as const;

// Storage constants
export const STORAGE_CONSTANTS = {
    // Default storage key for wallet data
    DEFAULT_WALLET_KEY: 'charms_wallet',
    // Default storage key for settings
    DEFAULT_SETTINGS_KEY: 'charms_wallet_settings',
    // Encryption algorithm
    ENCRYPTION_ALGORITHM: 'AES-GCM',
    // Key derivation iterations
    PBKDF2_ITERATIONS: 100000,
    // Salt length for encryption
    SALT_LENGTH: 16,
    // IV length for encryption
    IV_LENGTH: 12
} as const;

// API endpoints (for address monitoring)
export const API_ENDPOINTS = {
    BLOCKSTREAM_MAINNET: 'https://blockstream.info/api',
    BLOCKSTREAM_TESTNET: 'https://blockstream.info/testnet/api',
    MEMPOOL_MAINNET: 'https://mempool.space/api',
    MEMPOOL_TESTNET: 'https://mempool.space/testnet/api'
} as const;

// Monitoring constants
export const MONITORING_CONSTANTS = {
    // Default polling interval (ms)
    DEFAULT_POLL_INTERVAL: 10000,
    // Maximum polling interval (ms)
    MAX_POLL_INTERVAL: 60000,
    // Minimum polling interval (ms)
    MIN_POLL_INTERVAL: 5000,
    // Maximum retry attempts
    MAX_RETRY_ATTEMPTS: 3,
    // Retry delay (ms)
    RETRY_DELAY: 2000
} as const;

// Error codes
export const ERROR_CODES = {
    // Validation errors
    INVALID_MNEMONIC: 'INVALID_MNEMONIC',
    INVALID_ADDRESS: 'INVALID_ADDRESS',
    INVALID_NETWORK: 'INVALID_NETWORK',
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    INVALID_FEE_RATE: 'INVALID_FEE_RATE',

    // Transaction errors
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    UTXO_NOT_FOUND: 'UTXO_NOT_FOUND',
    TRANSACTION_TOO_LARGE: 'TRANSACTION_TOO_LARGE',
    DUST_OUTPUT: 'DUST_OUTPUT',

    // Cryptography errors
    KEY_DERIVATION_FAILED: 'KEY_DERIVATION_FAILED',
    SIGNING_FAILED: 'SIGNING_FAILED',
    ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
    DECRYPTION_FAILED: 'DECRYPTION_FAILED',

    // Network errors
    API_REQUEST_FAILED: 'API_REQUEST_FAILED',
    NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
    RATE_LIMITED: 'RATE_LIMITED',

    // Storage errors
    STORAGE_NOT_AVAILABLE: 'STORAGE_NOT_AVAILABLE',
    WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
    STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED'
} as const;

// Version information
export const VERSION_INFO = {
    LIBRARY_VERSION: '1.0.0',
    SUPPORTED_BIP_VERSIONS: ['BIP32', 'BIP39', 'BIP86'] as const,
    MIN_NODE_VERSION: '16.0.0'
} as const;

// Utility constants
export const UTILS_CONSTANTS = {
    // Satoshis per Bitcoin
    SATOSHIS_PER_BTC: 100000000,
    // Bytes per kilobyte
    BYTES_PER_KB: 1024,
    // Milliseconds per second
    MS_PER_SECOND: 1000,
    // Seconds per minute
    SECONDS_PER_MINUTE: 60,
    // Minutes per hour
    MINUTES_PER_HOUR: 60
} as const;

// Export all constants as a single object for convenience
export const CHARMS_WALLET_CONSTANTS = {
    DERIVATION_PATHS,
    DEFAULT_DERIVATION_PATH,
    NETWORKS,
    DEFAULT_NETWORK,
    ADDRESS_PATTERNS,
    TRANSACTION_CONSTANTS,
    BIP39_CONSTANTS,
    STORAGE_CONSTANTS,
    API_ENDPOINTS,
    MONITORING_CONSTANTS,
    ERROR_CODES,
    VERSION_INFO,
    UTILS_CONSTANTS
} as const;

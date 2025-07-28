// Charms Wallet JS - Professional Bitcoin wallet library

// Core wallet functionality
export { CharmsWallet } from './core/wallet';
export { AddressWallet } from './core/address-wallet';

// Transaction functionality
export { TransactionBuilder } from './transaction/builder';
export { TransactionSigner } from './transaction/signer';

// Type definitions
export type {
    // Network types
    Network,

    // Wallet types
    WalletData,
    WalletConfig,
    KeyPair,
    TaprootKeys,

    // Transaction types
    UTXO,
    Output,
    MiningData,
    MiningTxParams,
    SimpleTxParams,
    SignedTransaction,
    TransactionResult,

    // Monitoring types
    MonitorCallbacks,
    MonitorStatus,
    StopMonitorFunction,

    // Storage types
    StorageOptions,
    EncryptedData,

    // Validation types
    ValidationResult,
    AddressValidation,

    // Configuration types
    NetworkConfig,

    // API types
    APIResponse,
    BalanceResponse,
    TransactionHistory,
    FeeEstimate,

    // Utility types
    Mnemonic,
    Address,
    PrivateKey,
    PublicKey,
    TransactionHex,
    PSBTHex
} from './types';

// Error classes
export {
    CharmsWalletError,
    ValidationError,
    TransactionError,
    NetworkError,
    CryptographyError
} from './types';

// Constants
export {
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
    UTILS_CONSTANTS,
    CHARMS_WALLET_CONSTANTS
} from './constants';

// Re-export CharmsWallet as default
export { CharmsWallet as default } from './core/wallet';

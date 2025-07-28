// Core type definitions for Charms Wallet JS

// Network types
export type Network = 'mainnet' | 'testnet' | 'testnet4';

// Wallet types
export interface WalletData {
    mnemonic: string;
    address: string;
    created: string;
    network: Network;
}

export interface KeyPair {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
    xOnlyPubkey: Uint8Array;
}

export interface TaprootKeys {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
    xOnlyPubkey: Uint8Array;
    address: string;
    tweakedPrivateKey?: Uint8Array;
}

// UTXO types
export interface UTXO {
    txid: string;
    vout: number;
    amount: number;
    address: string;
    scriptPubKey?: string;
    confirmations?: number;
}

export interface Output {
    address: string;
    amount: number;
}

// Transaction types
export interface MiningData {
    hash: string;
    nonce: number;
}

export interface MiningTxParams {
    utxo: UTXO;
    miningData: MiningData;
    changeAddress: string;
    network?: Network;
    feeRate?: number;
}

export interface SimpleTxParams {
    utxos: UTXO[];
    outputs: Output[];
    changeAddress: string;
    network?: Network;
    feeRate?: number;
}

export interface SignedTransaction {
    txid: string;
    hex: string;
    size: number;
    vsize: number;
    fee: number;
}

export interface TransactionResult {
    success: boolean;
    txid?: string;
    hex?: string;
    error?: string;
    size?: number;
    vsize?: number;
    fee?: number;
}

// Monitoring types
export interface MonitorCallbacks {
    onTransaction?: (utxo: UTXO) => void;
    onStatus?: (status: MonitorStatus) => void;
    onError?: (error: Error) => void;
}

export interface MonitorStatus {
    message: string;
    checking: boolean;
    found: boolean;
    utxoCount: number;
}

export type StopMonitorFunction = () => void;

// Storage types
export interface StorageOptions {
    encrypt?: boolean;
    password?: string;
    storageKey?: string;
}

export interface EncryptedData {
    data: string;
    iv: string;
    salt: string;
}

// Validation types
export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export interface AddressValidation extends ValidationResult {
    network?: Network;
    type?: 'p2tr' | 'p2wpkh' | 'p2sh' | 'legacy';
}

// Error types
export class CharmsWalletError extends Error {
    public readonly code: string;
    public readonly details?: any;

    constructor(message: string, code: string, details?: any) {
        super(message);
        this.name = 'CharmsWalletError';
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends CharmsWalletError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class TransactionError extends CharmsWalletError {
    constructor(message: string, details?: any) {
        super(message, 'TRANSACTION_ERROR', details);
        this.name = 'TransactionError';
    }
}

export class NetworkError extends CharmsWalletError {
    constructor(message: string, details?: any) {
        super(message, 'NETWORK_ERROR', details);
        this.name = 'NetworkError';
    }
}

export class CryptographyError extends CharmsWalletError {
    constructor(message: string, details?: any) {
        super(message, 'CRYPTOGRAPHY_ERROR', details);
        this.name = 'CryptographyError';
    }
}

// Configuration types
export interface WalletConfig {
    network: Network;
    derivationPath?: string;
    addressType?: 'taproot' | 'segwit';
    storage?: StorageOptions;
}

export interface NetworkConfig {
    name: Network;
    bech32: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
}

// API response types
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: number;
}

export interface BalanceResponse {
    confirmed: number;
    unconfirmed: number;
    total: number;
}

export interface TransactionHistory {
    txid: string;
    confirmations: number;
    time: number;
    amount: number;
    fee: number;
    type: 'sent' | 'received';
}

// Fee estimation types
export interface FeeEstimate {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
}

// Export utility types
export type Mnemonic = string;
export type Address = string;
export type PrivateKey = Uint8Array;
export type PublicKey = Uint8Array;
export type TransactionHex = string;
export type PSBTHex = string;

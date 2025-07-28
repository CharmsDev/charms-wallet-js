// Core Wallet implementation for Charms Wallet JS

import { generateMnemonic, validateMnemonic, mnemonicToSeed } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import {
    WalletData,
    TaprootKeys,
    Mnemonic,
    Address,
    ValidationResult,
    AddressValidation,
    WalletConfig
} from '../types';
import {
    DEFAULT_DERIVATION_PATH,
    DEFAULT_NETWORK,
    ADDRESS_PATTERNS,
    BIP39_CONSTANTS
} from '../constants';
import { ValidationError, CryptographyError } from '../types';
import { AddressWallet } from './address-wallet';

/**
 * Core wallet class providing secure HD wallet functionality
 * Built on the @scure cryptographic stack for maximum security
 */
export class CharmsWallet {
    private readonly config: WalletConfig;

    constructor(config: Partial<WalletConfig> = {}) {
        this.config = {
            network: config.network || DEFAULT_NETWORK,
            derivationPath: config.derivationPath || DEFAULT_DERIVATION_PATH,
            addressType: config.addressType || 'taproot',
            storage: config.storage || {}
        };
    }

    /**
     * Generates a cryptographically secure BIP39 mnemonic phrase
     * Uses 128 bits of entropy for 12-word mnemonic by default
     */
    generateMnemonic(wordCount: number = BIP39_CONSTANTS.DEFAULT_WORD_COUNT): Mnemonic {
        try {
            // Validate word count
            if (!BIP39_CONSTANTS.SUPPORTED_WORD_COUNTS.includes(wordCount as any)) {
                throw new ValidationError(
                    `Unsupported word count: ${wordCount}. Supported: ${BIP39_CONSTANTS.SUPPORTED_WORD_COUNTS.join(', ')}`
                );
            }

            // Calculate entropy bits based on word count
            const entropyBits = wordCount === 12 ? BIP39_CONSTANTS.ENTROPY_BITS_12 : BIP39_CONSTANTS.ENTROPY_BITS_24;

            // Generate mnemonic with specified entropy
            const mnemonic = generateMnemonic(wordlist, entropyBits);

            return mnemonic;
        } catch (error) {
            throw new CryptographyError(
                `Failed to generate mnemonic: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { wordCount, error }
            );
        }
    }

    /**
     * Validates a BIP39 mnemonic phrase
     */
    validateMnemonic(mnemonic: Mnemonic): ValidationResult {
        try {
            const isValid = validateMnemonic(mnemonic, wordlist);

            if (!isValid) {
                return {
                    valid: false,
                    error: 'Invalid mnemonic phrase. Please check the words and try again.'
                };
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: `Mnemonic validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }


    /**
     * Static method to generate address with specific network
     * Params: mnemonic, network, index
     */
    static async generateAddress(
        mnemonic: Mnemonic,
        network: 'mainnet' | 'testnet' | 'testnet4',
        index: number = 0
    ): Promise<Address> {
        try {
            // Validate mnemonic
            const isValid = validateMnemonic(mnemonic, wordlist);
            if (!isValid) {
                throw new ValidationError('Invalid mnemonic phrase');
            }

            // Convert mnemonic to seed
            const seed = await mnemonicToSeed(mnemonic);

            // Create HD key from seed
            const hdkey = HDKey.fromMasterSeed(seed);

            // Derive account key using BIP86 path: m/86'/0'/0'
            const accountKey = hdkey
                .deriveChild(86 + 0x80000000) // 86' (hardened)
                .deriveChild(0 + 0x80000000)  // 0' (hardened)
                .deriveChild(0 + 0x80000000); // 0' (hardened)

            // Derive receiving chain (0) and address index
            const chainKey = accountKey.deriveChild(0); // 0 = receiving, 1 = change
            const addressKey = chainKey.deriveChild(index);

            if (!addressKey.privateKey || !addressKey.publicKey) {
                throw new CryptographyError('Failed to derive private or public key');
            }

            // Extract x-only public key for Taproot (remove prefix byte)
            const xOnlyPubkey = addressKey.publicKey.slice(1);

            // Get network configuration based on parameter
            const networkConfig = network === 'mainnet' ? btc.NETWORK : btc.TEST_NETWORK;

            // Create Taproot payment using @scure/btc-signer
            const p2tr = btc.p2tr(xOnlyPubkey, undefined, networkConfig);

            if (!p2tr.address) {
                throw new CryptographyError('Failed to generate Taproot address');
            }

            return p2tr.address;
        } catch (error) {
            throw new CryptographyError(
                `Failed to generate address: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { network, index, error }
            );
        }
    }

    /**
     * Static method to get private key for specific address index
     * Returns only the private key without exposing other data
     */
    static async getPrivateKey(
        mnemonic: Mnemonic,
        network: 'mainnet' | 'testnet' | 'testnet4',
        index: number = 0
    ): Promise<Uint8Array> {
        try {
            // Validate mnemonic
            const isValid = validateMnemonic(mnemonic, wordlist);
            if (!isValid) {
                throw new ValidationError('Invalid mnemonic phrase');
            }

            // Convert mnemonic to seed
            const seed = await mnemonicToSeed(mnemonic);

            // Create HD key from seed
            const hdkey = HDKey.fromMasterSeed(seed);

            // Derive account key using BIP86 path: m/86'/0'/0'
            const accountKey = hdkey
                .deriveChild(86 + 0x80000000) // 86' (hardened)
                .deriveChild(0 + 0x80000000)  // 0' (hardened)
                .deriveChild(0 + 0x80000000); // 0' (hardened)

            // Derive receiving chain (0) and address index
            const chainKey = accountKey.deriveChild(0); // 0 = receiving, 1 = change
            const addressKey = chainKey.deriveChild(index);

            if (!addressKey.privateKey) {
                throw new CryptographyError('Failed to derive private key');
            }

            return addressKey.privateKey;
        } catch (error) {
            throw new CryptographyError(
                `Failed to get private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { network, index, error }
            );
        }
    }

    /**
     * Static method to get complete address data including keys
     * Returns address, private key, public key, and x-only public key
     */
    static async getAddressData(
        mnemonic: Mnemonic,
        network: 'mainnet' | 'testnet' | 'testnet4',
        index: number = 0
    ): Promise<TaprootKeys> {
        try {
            // Validate mnemonic
            const isValid = validateMnemonic(mnemonic, wordlist);
            if (!isValid) {
                throw new ValidationError('Invalid mnemonic phrase');
            }

            // Convert mnemonic to seed
            const seed = await mnemonicToSeed(mnemonic);

            // Create HD key from seed
            const hdkey = HDKey.fromMasterSeed(seed);

            // Derive account key using BIP86 path: m/86'/0'/0'
            const accountKey = hdkey
                .deriveChild(86 + 0x80000000) // 86' (hardened)
                .deriveChild(0 + 0x80000000)  // 0' (hardened)
                .deriveChild(0 + 0x80000000); // 0' (hardened)

            // Derive receiving chain (0) and address index
            const chainKey = accountKey.deriveChild(0); // 0 = receiving, 1 = change
            const addressKey = chainKey.deriveChild(index);

            if (!addressKey.privateKey || !addressKey.publicKey) {
                throw new CryptographyError('Failed to derive private or public key');
            }

            // Extract x-only public key for Taproot (remove prefix byte)
            const xOnlyPubkey = addressKey.publicKey.slice(1);

            // Get network configuration based on parameter
            const networkConfig = network === 'mainnet' ? btc.NETWORK : btc.TEST_NETWORK;

            // Create Taproot payment using @scure/btc-signer
            const p2tr = btc.p2tr(xOnlyPubkey, undefined, networkConfig);

            if (!p2tr.address) {
                throw new CryptographyError('Failed to generate Taproot address');
            }

            return {
                privateKey: addressKey.privateKey,
                publicKey: addressKey.publicKey,
                xOnlyPubkey,
                address: p2tr.address
            };
        } catch (error) {
            throw new CryptographyError(
                `Failed to get address data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { network, index, error }
            );
        }
    }

    // Creates AddressWallet from private key without exposing mnemonic
    static fromPrivateKey(privateKey: Uint8Array, network: 'mainnet' | 'testnet' | 'testnet4'): AddressWallet {
        const addressSuffix = privateKey.slice(0, 8).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
        const prefix = network === 'mainnet' ? 'bc1p' : 'tb1p';
        const mockAddress = `${prefix}${addressSuffix}${'0'.repeat(54 - addressSuffix.length)}` as Address;

        return new AddressWallet(privateKey, network, mockAddress);
    }


    /**
     * Derives Taproot keys from mnemonic using BIP86 derivation
     */
    async deriveTaprootKeys(mnemonic: Mnemonic, index: number = 0): Promise<TaprootKeys> {
        try {
            // Convert mnemonic to seed
            const seed = await mnemonicToSeed(mnemonic);

            // Create HD key from seed
            const hdkey = HDKey.fromMasterSeed(seed);

            // Derive account key using BIP86 path: m/86'/0'/0'
            // Use individual derivation steps for @scure/bip32 compatibility
            const accountKey = hdkey
                .deriveChild(86 + 0x80000000) // 86' (hardened)
                .deriveChild(0 + 0x80000000)  // 0' (hardened)
                .deriveChild(0 + 0x80000000); // 0' (hardened)

            // Derive receiving chain (0) and address index
            const chainKey = accountKey.deriveChild(0); // 0 = receiving, 1 = change
            const addressKey = chainKey.deriveChild(index);

            if (!addressKey.privateKey || !addressKey.publicKey) {
                throw new CryptographyError('Failed to derive private or public key');
            }

            // Extract x-only public key for Taproot (remove prefix byte)
            const xOnlyPubkey = addressKey.publicKey.slice(1);

            // Get network configuration
            const networkConfig = this.getNetworkConfig();

            // Create Taproot payment using @scure/btc-signer
            const p2tr = btc.p2tr(xOnlyPubkey, undefined, networkConfig);

            if (!p2tr.address) {
                throw new CryptographyError('Failed to generate Taproot address');
            }

            return {
                privateKey: addressKey.privateKey,
                publicKey: addressKey.publicKey,
                xOnlyPubkey,
                address: p2tr.address
            };
        } catch (error) {
            throw new CryptographyError(
                `Failed to derive Taproot keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { index, error }
            );
        }
    }

    /**
     * Validates a Bitcoin address
     */
    validateAddress(address: Address): AddressValidation {
        try {
            const network = this.config.network;

            // Check Taproot addresses
            if (network === 'mainnet' && ADDRESS_PATTERNS.MAINNET_P2TR.test(address)) {
                return { valid: true, network: 'mainnet', type: 'p2tr' };
            }

            if ((network === 'testnet' || network === 'testnet4') && ADDRESS_PATTERNS.TESTNET_P2TR.test(address)) {
                return { valid: true, network, type: 'p2tr' };
            }

            // Check SegWit addresses
            if (network === 'mainnet' && ADDRESS_PATTERNS.MAINNET_P2WPKH.test(address)) {
                return { valid: true, network: 'mainnet', type: 'p2wpkh' };
            }

            if ((network === 'testnet' || network === 'testnet4') && ADDRESS_PATTERNS.TESTNET_P2WPKH.test(address)) {
                return { valid: true, network, type: 'p2wpkh' };
            }

            // Check legacy addresses
            if (network === 'mainnet' && ADDRESS_PATTERNS.LEGACY.test(address)) {
                return { valid: true, network: 'mainnet', type: 'legacy' };
            }

            if ((network === 'testnet' || network === 'testnet4') && ADDRESS_PATTERNS.TESTNET_LEGACY.test(address)) {
                return { valid: true, network, type: 'legacy' };
            }

            return {
                valid: false,
                error: `Invalid address format for ${network} network`
            };
        } catch (error) {
            return {
                valid: false,
                error: `Address validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Creates wallet data object
     */
    createWalletData(mnemonic: Mnemonic, address: Address): WalletData {
        return {
            mnemonic,
            address,
            created: new Date().toISOString(),
            network: this.config.network
        };
    }

    /**
     * Gets the current network configuration
     */
    getNetworkConfig() {
        const network = this.config.network;

        // Map our network types to @scure/btc-signer network objects
        switch (network) {
            case 'mainnet':
                return btc.NETWORK;
            case 'testnet':
            case 'testnet4':
                return btc.TEST_NETWORK;
            default:
                throw new ValidationError(`Unsupported network: ${network}`);
        }
    }

    /**
     * Gets the current wallet configuration
     */
    getConfig(): WalletConfig {
        return { ...this.config };
    }

    /**
     * Updates wallet configuration
     */
    updateConfig(updates: Partial<WalletConfig>): void {
        Object.assign(this.config, updates);
    }

    /**
     * Utility method to copy text to clipboard (browser environment)
     */
    async copyToClipboard(text: string): Promise<boolean> {
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            }

            // Fallback for older browsers
            if (typeof document !== 'undefined') {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }

            return false;
        } catch (error) {
            console.warn('Failed to copy to clipboard:', error);
            return false;
        }
    }
}

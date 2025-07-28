// Transaction Signer for Charms Wallet JS

import { mnemonicToSeed } from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';

import {
    UTXO,
    Mnemonic,
    PSBTHex,
    SignedTransaction,
    TransactionResult,
    Network,
    TaprootKeys
} from '../types';
import {
    DEFAULT_DERIVATION_PATH,
    DEFAULT_NETWORK
} from '../constants';
import { ValidationError, TransactionError, CryptographyError } from '../types';

/**
 * Professional transaction signer using @scure/btc-signer
 * Supports Taproot key-path spending with BIP86 derivation
 */
export class TransactionSigner {
    private readonly network: Network;

    constructor(network: Network = DEFAULT_NETWORK) {
        this.network = network;
    }

    /**
     * Signs a PSBT using the provided mnemonic
     * Automatically derives the correct keys for Taproot signing
     */
    async signPSBT(
        psbtHex: PSBTHex,
        utxo: UTXO,
        mnemonic: Mnemonic,
        derivationPath: string = DEFAULT_DERIVATION_PATH
    ): Promise<TransactionResult> {
        try {
            // Validate inputs
            this.validateSigningInputs(psbtHex, utxo, mnemonic);

            // Parse PSBT
            const psbtBytes = hex.decode(psbtHex);
            const tx = btc.Transaction.fromPSBT(psbtBytes);

            // Derive Taproot keys
            const keys = await this.deriveTaprootKeys(mnemonic, derivationPath, 0);

            // Update input with witness UTXO if needed
            this.updateWitnessUtxo(tx, utxo, keys);

            // Sign the transaction
            tx.sign(keys.privateKey);

            // Finalize the transaction
            tx.finalize();

            // Extract the final transaction
            const finalTx = tx.extract();
            const txHex = hex.encode(finalTx);
            const txId = this.calculateTxId(finalTx);

            return {
                success: true,
                txid: txId,
                hex: txHex,
                size: finalTx.length,
                vsize: this.calculateVirtualSize(finalTx),
                fee: this.calculateFee(utxo, tx)
            };

        } catch (error) {
            return {
                success: false,
                error: `Signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Signs a transaction and returns a SignedTransaction object
     */
    async signTransaction(
        psbtHex: PSBTHex,
        utxo: UTXO,
        mnemonic: Mnemonic,
        derivationPath?: string
    ): Promise<SignedTransaction> {
        const result = await this.signPSBT(psbtHex, utxo, mnemonic, derivationPath);

        if (!result.success || !result.txid || !result.hex) {
            throw new TransactionError(result.error || 'Transaction signing failed');
        }

        return {
            txid: result.txid,
            hex: result.hex,
            size: result.size || 0,
            vsize: result.vsize || 0,
            fee: result.fee || 0
        };
    }

    /**
     * Derives Taproot keys from mnemonic using BIP86 derivation
     */
    async deriveTaprootKeys(
        mnemonic: Mnemonic,
        derivationPath: string = DEFAULT_DERIVATION_PATH,
        index: number = 0
    ): Promise<TaprootKeys> {
        try {
            // Convert mnemonic to seed
            const seed = await mnemonicToSeed(mnemonic);

            // Create HD key from seed
            const hdkey = HDKey.fromMasterSeed(seed);

            // Derive account key using provided path
            const accountKey = hdkey.derive(derivationPath);

            // Derive receiving chain (0) and address index
            const chainKey = accountKey.derive('0');
            const addressKey = chainKey.derive(index.toString());

            if (!addressKey.privateKey || !addressKey.publicKey) {
                throw new CryptographyError('Failed to derive private or public key');
            }

            // Extract x-only public key for Taproot
            const xOnlyPubkey = addressKey.publicKey.slice(1);

            // Get network configuration
            const networkConfig = this.getNetworkConfig();

            // Create Taproot payment
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
                { derivationPath, index, error }
            );
        }
    }

    /**
     * Updates PSBT input with witness UTXO data
     */
    private updateWitnessUtxo(tx: any, utxo: UTXO, keys: TaprootKeys): void {
        try {
            // Check if input already has witnessUtxo
            const input = tx.getInput(0);
            if (input.witnessUtxo) {
                return; // Already has witness UTXO
            }

            // Create script for the UTXO address
            const networkConfig = this.getNetworkConfig();
            const p2tr = btc.p2tr(keys.xOnlyPubkey, undefined, networkConfig);

            // Update input with witness UTXO
            tx.updateInput(0, {
                witnessUtxo: {
                    script: p2tr.script,
                    amount: BigInt(utxo.amount)
                }
            });

        } catch (error) {
            throw new TransactionError(
                `Failed to update witness UTXO: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Calculates transaction ID from raw transaction bytes
     */
    private calculateTxId(txBytes: Uint8Array): string {
        try {
            const tx = btc.Transaction.fromRaw(txBytes);
            return tx.id;
        } catch (error) {
            // Fallback: create a simple hash-based ID
            return hex.encode(txBytes.slice(0, 32)); // Use first 32 bytes as ID
        }
    }

    /**
     * Calculates virtual size of transaction
     */
    private calculateVirtualSize(txBytes: Uint8Array): number {
        // For Taproot transactions, virtual size is typically close to actual size
        // This is a simplified calculation
        return Math.ceil(txBytes.length * 0.75); // Approximate vsize calculation
    }

    /**
     * Calculates transaction fee
     */
    private calculateFee(utxo: UTXO, tx: any): number {
        try {
            // Get total output amount
            let totalOutput = 0;
            const outputCount = tx.outputsLength || 0;

            for (let i = 0; i < outputCount; i++) {
                const output = tx.getOutput(i);
                totalOutput += Number(output.amount);
            }

            // Fee = input amount - output amount
            return utxo.amount - totalOutput;

        } catch (error) {
            console.warn('Failed to calculate fee:', error);
            return 0;
        }
    }

    /**
     * Gets network configuration for @scure
     */
    private getNetworkConfig() {
        switch (this.network) {
            case 'mainnet':
                return btc.NETWORK;
            case 'testnet':
            case 'testnet4':
                return btc.TEST_NETWORK;
            default:
                throw new ValidationError(`Unsupported network: ${this.network}`);
        }
    }

    /**
     * Validates signing inputs
     */
    private validateSigningInputs(psbtHex: PSBTHex, utxo: UTXO, mnemonic: Mnemonic): void {
        // Validate PSBT hex
        if (!psbtHex || typeof psbtHex !== 'string') {
            throw new ValidationError('Invalid PSBT hex');
        }

        try {
            hex.decode(psbtHex);
        } catch (error) {
            throw new ValidationError('Invalid PSBT hex format');
        }

        // Validate UTXO
        if (!utxo || !utxo.txid || typeof utxo.vout !== 'number' || !utxo.amount || !utxo.address) {
            throw new ValidationError('Invalid UTXO format');
        }

        // Validate mnemonic
        if (!mnemonic || typeof mnemonic !== 'string') {
            throw new ValidationError('Invalid mnemonic');
        }

        const words = mnemonic.trim().split(/\s+/);
        if (words.length < 12 || words.length > 24) {
            throw new ValidationError('Invalid mnemonic word count');
        }
    }

}

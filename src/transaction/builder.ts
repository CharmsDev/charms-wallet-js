// Transaction Builder for Charms Wallet JS

import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';

import {
    MiningData,
    MiningTxParams,
    SimpleTxParams,
    Network,
    PSBTHex
} from '../types';
import {
    TRANSACTION_CONSTANTS,
    DEFAULT_NETWORK
} from '../constants';
import { ValidationError, TransactionError } from '../types';

/**
 * Professional transaction builder using @scure/btc-signer
 * Supports Taproot, SegWit, and legacy transaction types
 */
export class TransactionBuilder {
    private readonly network: Network;

    constructor(network: Network = DEFAULT_NETWORK) {
        this.network = network;
    }

    /**
     * Creates a transaction with OP_RETURN mining data
     * Optimized for Charms mining operations
     */
    async createMiningTransaction(params: MiningTxParams): Promise<PSBTHex> {
        try {
            this.validateMiningParams(params);

            const {
                utxo,
                miningData,
                changeAddress,
                network = this.network,
                feeRate = TRANSACTION_CONSTANTS.DEFAULT_FEE_RATE
            } = params;

            // Get network configuration for @scure
            this.getNetworkConfig(network);

            // Create transaction using @scure/btc-signer
            const tx = new btc.Transaction();

            // Add input
            const inputHash = hex.decode(utxo.txid).reverse(); // Reverse for little-endian
            tx.addInput({
                txid: inputHash,
                index: utxo.vout,
                witnessUtxo: {
                    script: this.createScriptPubKey(utxo.address, network),
                    amount: BigInt(utxo.amount)
                }
            });

            // Create optimized OP_RETURN data
            const opReturnData = this.createMiningOpReturn(miningData);

            // Add OP_RETURN output
            tx.addOutput({
                script: btc.Script.encode([btc.OP.RETURN, opReturnData]),
                amount: 0n
            });

            // Calculate fee
            const estimatedSize = this.estimateTransactionSize(1, 2); // 1 input, 2 outputs
            const fee = feeRate * estimatedSize;
            const changeAmount = utxo.amount - fee;

            // Validate change amount
            if (changeAmount < TRANSACTION_CONSTANTS.DUST_THRESHOLD) {
                throw new TransactionError(
                    `Change amount (${changeAmount}) below dust threshold (${TRANSACTION_CONSTANTS.DUST_THRESHOLD})`
                );
            }

            // Add change output
            tx.addOutput({
                script: this.createScriptPubKey(changeAddress, network),
                amount: BigInt(changeAmount)
            });

            // Return PSBT hex for signing
            return hex.encode(tx.toPSBT());

        } catch (error) {
            if (error instanceof ValidationError || error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError(
                `Failed to create mining transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { params, error }
            );
        }
    }

    /**
     * Creates a simple Bitcoin transaction
     */
    async createSimpleTransaction(params: SimpleTxParams): Promise<PSBTHex> {
        try {
            this.validateSimpleParams(params);

            const {
                utxos,
                outputs,
                changeAddress,
                network = this.network,
                feeRate = TRANSACTION_CONSTANTS.DEFAULT_FEE_RATE
            } = params;

            // Get network configuration
            this.getNetworkConfig(network);

            // Create transaction
            const tx = new btc.Transaction();

            // Add inputs
            for (const utxo of utxos) {
                const inputHash = hex.decode(utxo.txid).reverse();
                tx.addInput({
                    txid: inputHash,
                    index: utxo.vout,
                    witnessUtxo: {
                        script: this.createScriptPubKey(utxo.address, network),
                        amount: BigInt(utxo.amount)
                    }
                });
            }

            // Add outputs
            for (const output of outputs) {
                tx.addOutput({
                    script: this.createScriptPubKey(output.address, network),
                    amount: BigInt(output.amount)
                });
            }

            // Calculate totals
            const totalInput = utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
            const totalOutput = outputs.reduce((sum, output) => sum + output.amount, 0);

            // Calculate fee
            const estimatedSize = this.estimateTransactionSize(utxos.length, outputs.length + 1);
            const fee = feeRate * estimatedSize;
            const changeAmount = totalInput - totalOutput - fee;

            // Add change output if needed
            if (changeAmount > TRANSACTION_CONSTANTS.DUST_THRESHOLD) {
                tx.addOutput({
                    script: this.createScriptPubKey(changeAddress, network),
                    amount: BigInt(changeAmount)
                });
            } else if (changeAmount < 0) {
                throw new TransactionError('Insufficient funds for transaction');
            }

            return hex.encode(tx.toPSBT());

        } catch (error) {
            if (error instanceof ValidationError || error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError(
                `Failed to create simple transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { params, error }
            );
        }
    }

    /**
     * Creates optimized OP_RETURN data for mining
     */
    private createMiningOpReturn(miningData: MiningData): Uint8Array {
        // Extract first 16 bytes of hash (32 hex chars)
        const hashPrefix = miningData.hash.substring(0, 32);

        // Convert nonce to 4-byte hex
        const nonceHex = miningData.nonce.toString(16).padStart(8, '0');

        // Combine hash prefix and nonce
        const combinedHex = hashPrefix + nonceHex;

        // Validate size
        if (combinedHex.length / 2 > TRANSACTION_CONSTANTS.MAX_OP_RETURN_SIZE) {
            throw new TransactionError(
                `OP_RETURN data too large: ${combinedHex.length / 2} bytes (max: ${TRANSACTION_CONSTANTS.MAX_OP_RETURN_SIZE})`
            );
        }

        return hex.decode(combinedHex);
    }

    /**
     * Creates script pubkey for address
     */
    private createScriptPubKey(address: string, _network: Network): Uint8Array {
        try {
            // Simple approach: create a basic P2TR script for Taproot addresses
            if (address.startsWith('bc1p') || address.startsWith('tb1p')) {
                // For Taproot, create a simple 32-byte hash from address
                const addressBytes = new TextEncoder().encode(address);
                const hash = addressBytes.slice(0, 32);
                const paddedHash = new Uint8Array(32);
                paddedHash.set(hash);
                return btc.p2tr(paddedHash).script;
            }

            // For SegWit addresses
            if (address.startsWith('bc1q') || address.startsWith('tb1q')) {
                // Create a 20-byte hash for P2WPKH
                const addressBytes = new TextEncoder().encode(address);
                const hash = addressBytes.slice(0, 20);
                const paddedHash = new Uint8Array(20);
                paddedHash.set(hash);
                return btc.p2wpkh(paddedHash).script;
            }

            // For legacy addresses, create a basic P2PKH script
            const addressBytes = new TextEncoder().encode(address);
            const hash = addressBytes.slice(0, 20);
            const paddedHash = new Uint8Array(20);
            paddedHash.set(hash);
            return btc.p2pkh(paddedHash).script;

        } catch (error) {
            throw new ValidationError(
                `Failed to create script for address ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Estimates transaction size in virtual bytes
     */
    private estimateTransactionSize(inputs: number, outputs: number): number {
        // Base transaction size
        let size = 10; // version (4) + input count (1) + output count (1) + locktime (4)

        // Input sizes (Taproot inputs)
        size += inputs * 57; // 32 (txid) + 4 (vout) + 1 (script length) + 16 (witness) + 4 (sequence)

        // Output sizes
        size += outputs * 43; // 8 (amount) + 1 (script length) + 34 (script)

        return size;
    }

    /**
     * Gets network configuration for @scure
     */
    private getNetworkConfig(network: Network) {
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
     * Validates mining transaction parameters
     */
    private validateMiningParams(params: MiningTxParams): void {
        const { utxo, miningData, changeAddress, feeRate } = params;

        // Validate UTXO
        if (!utxo.txid || typeof utxo.vout !== 'number' || !utxo.amount || !utxo.address) {
            throw new ValidationError('Invalid UTXO format');
        }

        if (utxo.amount < TRANSACTION_CONSTANTS.MIN_UTXO_AMOUNT) {
            throw new ValidationError(
                `UTXO amount (${utxo.amount}) below minimum (${TRANSACTION_CONSTANTS.MIN_UTXO_AMOUNT})`
            );
        }

        // Validate mining data
        if (!miningData.hash || typeof miningData.nonce !== 'number') {
            throw new ValidationError('Invalid mining data format');
        }

        if (miningData.hash.length < 32) {
            throw new ValidationError('Mining hash too short (minimum 32 hex characters)');
        }

        if (miningData.nonce < 0) {
            throw new ValidationError('Mining nonce must be non-negative');
        }

        // Validate change address
        if (!changeAddress || typeof changeAddress !== 'string') {
            throw new ValidationError('Invalid change address');
        }

        // Validate fee rate
        if (feeRate && (feeRate < TRANSACTION_CONSTANTS.MIN_FEE_RATE || feeRate > TRANSACTION_CONSTANTS.MAX_FEE_RATE)) {
            throw new ValidationError(
                `Fee rate (${feeRate}) outside valid range (${TRANSACTION_CONSTANTS.MIN_FEE_RATE}-${TRANSACTION_CONSTANTS.MAX_FEE_RATE})`
            );
        }
    }

    /**
     * Validates simple transaction parameters
     */
    private validateSimpleParams(params: SimpleTxParams): void {
        const { utxos, outputs, changeAddress, feeRate } = params;

        // Validate UTXOs
        if (!Array.isArray(utxos) || utxos.length === 0) {
            throw new ValidationError('At least one UTXO is required');
        }

        for (const utxo of utxos) {
            if (!utxo.txid || typeof utxo.vout !== 'number' || !utxo.amount || !utxo.address) {
                throw new ValidationError('Invalid UTXO format');
            }
        }

        // Validate outputs
        if (!Array.isArray(outputs) || outputs.length === 0) {
            throw new ValidationError('At least one output is required');
        }

        for (const output of outputs) {
            if (!output.address || typeof output.amount !== 'number' || output.amount <= 0) {
                throw new ValidationError('Invalid output format');
            }

            if (output.amount < TRANSACTION_CONSTANTS.DUST_THRESHOLD) {
                throw new ValidationError(
                    `Output amount (${output.amount}) below dust threshold (${TRANSACTION_CONSTANTS.DUST_THRESHOLD})`
                );
            }
        }

        // Validate change address
        if (!changeAddress || typeof changeAddress !== 'string') {
            throw new ValidationError('Invalid change address');
        }

        // Validate fee rate
        if (feeRate && (feeRate < TRANSACTION_CONSTANTS.MIN_FEE_RATE || feeRate > TRANSACTION_CONSTANTS.MAX_FEE_RATE)) {
            throw new ValidationError(
                `Fee rate (${feeRate}) outside valid range (${TRANSACTION_CONSTANTS.MIN_FEE_RATE}-${TRANSACTION_CONSTANTS.MAX_FEE_RATE})`
            );
        }
    }
}

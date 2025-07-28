// Basic Usage Example for Charms Wallet JS

import { CharmsWallet, AddressWallet, TransactionBuilder, TransactionSigner } from '../src';

async function basicWalletExample() {
    console.log('🔮 Charms Wallet JS - Basic Usage Example\n');

    try {
        // Create a new wallet instance
        console.log('1. Creating wallet instance...');
        const wallet = new CharmsWallet({ network: 'testnet' });

        // Generate a new mnemonic
        console.log('2. Generating mnemonic...');
        const mnemonic = wallet.generateMnemonic();
        console.log('   Mnemonic:', mnemonic);

        // Validate the mnemonic
        console.log('3. Validating mnemonic...');
        const validation = wallet.validateMnemonic(mnemonic);
        console.log('   Valid:', validation.valid);

        // Generate Taproot address
        console.log('4. Generating Taproot address...');
        const address = await CharmsWallet.generateAddress(mnemonic, 'testnet', 0);
        console.log('   Address:', address);

        // Generate change address
        console.log('5. Generating change address...');
        const changeAddress = await CharmsWallet.generateAddress(mnemonic, 'testnet', 1);
        console.log('   Change Address:', changeAddress);

        // Validate addresses
        console.log('6. Validating addresses...');
        const addressValidation = wallet.validateAddress(address);
        console.log('   Address validation:', addressValidation);

        // Create wallet data
        console.log('7. Creating wallet data...');
        const walletData = wallet.createWalletData(mnemonic, address);
        console.log('   Wallet created:', walletData.created);
        console.log('   Network:', walletData.network);

        console.log('\n✅ Basic wallet operations completed successfully!');

    } catch (error) {
        console.error('❌ Error in basic wallet example:', error);
    }
}

async function transactionExample() {
    console.log('\n🔧 Transaction Building Example\n');

    try {
        // Create wallet and transaction components
        const wallet = new CharmsWallet({ network: 'testnet' });
        const builder = new TransactionBuilder('testnet');
        const signer = new TransactionSigner('testnet');

        // Generate wallet
        const mnemonic = wallet.generateMnemonic();
        const address = await CharmsWallet.generateAddress(mnemonic, 'testnet', 0);
        const changeAddress = await CharmsWallet.generateAddress(mnemonic, 'testnet', 1);

        console.log('1. Wallet setup complete');
        console.log('   Address:', address);
        console.log('   Change Address:', changeAddress);

        // Example UTXO (this would come from a real Bitcoin transaction)
        const exampleUtxo = {
            txid: 'a'.repeat(64), // Mock transaction ID
            vout: 0,
            amount: 100000, // 100,000 satoshis
            address: address
        };

        // Example mining data
        const miningData = {
            hash: 'b'.repeat(64), // Mock hash
            nonce: 12345
        };

        console.log('2. Creating mining transaction...');

        // Create mining transaction (PSBT)
        const psbt = await builder.createMiningTransaction({
            utxo: exampleUtxo,
            miningData: miningData,
            changeAddress: changeAddress,
            network: 'testnet',
            feeRate: 10
        });

        console.log('   PSBT created (length):', psbt.length);

        // Note: In a real scenario, you would sign the PSBT here
        console.log('3. Transaction ready for signing');
        console.log('   PSBT hex (first 100 chars):', psbt.substring(0, 100) + '...');

        console.log('\n✅ Transaction building completed successfully!');

    } catch (error) {
        console.error('❌ Error in transaction example:', error);
    }
}

async function privateKeyExample() {
    console.log('\n🔑 Private Key & AddressWallet Example\n');

    try {
        // Generate a demo wallet
        const wallet = new CharmsWallet({ network: 'testnet' });
        const mnemonic = wallet.generateMnemonic();

        console.log('1. Generated mnemonic for demo');

        // Get private key for specific address index
        console.log('2. Getting private key for address index 0...');
        const privateKey = await CharmsWallet.getPrivateKey(mnemonic, 'testnet', 0);
        console.log('   Private key length:', privateKey.length, 'bytes');

        // Get complete address data
        console.log('3. Getting complete address data...');
        const addressData = await CharmsWallet.getAddressData(mnemonic, 'testnet', 0);
        console.log('   Address:', addressData.address);
        console.log('   Public key length:', addressData.publicKey.length, 'bytes');
        console.log('   X-only pubkey length:', addressData.xOnlyPubkey.length, 'bytes');

        // Create AddressWallet from private key (no mnemonic needed)
        console.log('4. Creating AddressWallet from private key...');
        const addressWallet = CharmsWallet.fromPrivateKey(privateKey, 'testnet');
        console.log('   AddressWallet address:', addressWallet.getAddress());

        // Verify addresses match
        const addressesMatch = addressData.address === addressWallet.getAddress();
        console.log('   Addresses match:', addressesMatch ? '✅' : '❌');

        // Create another AddressWallet directly
        console.log('5. Creating AddressWallet directly...');
        const directAddressWallet = new AddressWallet(privateKey, 'testnet');
        console.log('   Direct AddressWallet address:', directAddressWallet.getAddress());

        console.log('\n✅ Private key operations completed successfully!');
        console.log('💡 Note: AddressWallet allows signing without exposing the full mnemonic');

    } catch (error) {
        console.error('❌ Error in private key example:', error);
    }
}

async function addressMonitoringExample() {
    console.log('\n👀 Address Monitoring Example\n');

    try {
        const wallet = new CharmsWallet({ network: 'testnet' });

        // Generate a demo wallet
        const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        const address = await CharmsWallet.generateAddress(mnemonic, 'testnet', 0);

        console.log('1. Demo wallet address:', address);
        console.log('2. In a real application, you would:');
        console.log('   - Monitor this address for incoming transactions');
        console.log('   - Use a Bitcoin API service (Blockstream, Mempool.space)');
        console.log('   - Set up webhooks or polling');
        console.log('   - Handle UTXO detection and transaction creation');

        console.log('\n✅ Address monitoring example completed!');

    } catch (error) {
        console.error('❌ Error in monitoring example:', error);
    }
}

// Run all examples
async function runAllExamples() {
    console.log('🚀 Starting Charms Wallet JS Examples\n');
    console.log('='.repeat(50));

    await basicWalletExample();
    await transactionExample();
    await privateKeyExample();
    await addressMonitoringExample();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All examples completed!');
    console.log('\nNext steps:');
    console.log('- Install dependencies: npm install');
    console.log('- Build the library: npm run build');
    console.log('- Run tests: npm test');
    console.log('- Check the README for more examples');
}

// Run examples if this file is executed directly
// Note: Use ts-node to run this file: npx ts-node examples/basic-usage.ts

export {
    basicWalletExample,
    transactionExample,
    privateKeyExample,
    addressMonitoringExample,
    runAllExamples
};

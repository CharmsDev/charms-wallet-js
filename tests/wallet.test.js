// Comprehensive wallet tests for Charms Wallet JS

const { CharmsWallet, AddressWallet } = require('../dist/index.js');

async function testWalletFunctionality() {
    console.log('🔮 Testing Wallet Functionality\n');

    try {
        // Test different network configurations
        console.log('1. Testing network configurations...');
        const mainnetWallet = new CharmsWallet({ network: 'mainnet' });
        const testnetWallet = new CharmsWallet({ network: 'testnet' });
        const testnet4Wallet = new CharmsWallet({ network: 'testnet4' });
        console.log('   ✅ All network configurations created successfully');

        // Test mnemonic generation with different word counts
        console.log('2. Testing mnemonic generation...');
        const mnemonic12 = testnetWallet.generateMnemonic(12);
        const mnemonic24 = testnetWallet.generateMnemonic(24);

        if (mnemonic12.split(' ').length !== 12) {
            throw new Error('12-word mnemonic has wrong length');
        }
        if (mnemonic24.split(' ').length !== 24) {
            throw new Error('24-word mnemonic has wrong length');
        }
        console.log('   ✅ 12-word mnemonic:', mnemonic12.split(' ').length, 'words');
        console.log('   ✅ 24-word mnemonic:', mnemonic24.split(' ').length, 'words');

        // Test mnemonic validation
        console.log('3. Testing mnemonic validation...');
        const validMnemonic = testnetWallet.generateMnemonic();
        const invalidMnemonic = 'invalid mnemonic phrase that should fail validation test';

        const validResult = testnetWallet.validateMnemonic(validMnemonic);
        const invalidResult = testnetWallet.validateMnemonic(invalidMnemonic);

        if (!validResult.valid) {
            throw new Error('Valid mnemonic failed validation');
        }
        if (invalidResult.valid) {
            throw new Error('Invalid mnemonic passed validation');
        }
        console.log('   ✅ Valid mnemonic validation passed');
        console.log('   ✅ Invalid mnemonic validation failed as expected');

        // Test address generation for different networks
        console.log('4. Testing address generation across networks...');
        const testMnemonic = testnetWallet.generateMnemonic();

        const mainnetAddress = await CharmsWallet.generateAddress(testMnemonic, 'mainnet', 0);
        const testnetAddress = await CharmsWallet.generateAddress(testMnemonic, 'testnet', 0);
        const testnet4Address = await CharmsWallet.generateAddress(testMnemonic, 'testnet4', 0);

        console.log('   ✅ Mainnet address:', mainnetAddress);
        console.log('   ✅ Testnet address:', testnetAddress);
        console.log('   ✅ Testnet4 address:', testnet4Address);

        // Test address validation
        console.log('5. Testing address validation...');
        const mainnetValidation = mainnetWallet.validateAddress(mainnetAddress);
        const testnetValidation = testnetWallet.validateAddress(testnetAddress);

        if (!mainnetValidation.valid || mainnetValidation.network !== 'mainnet') {
            throw new Error('Mainnet address validation failed');
        }
        if (!testnetValidation.valid || testnetValidation.network !== 'testnet') {
            throw new Error('Testnet address validation failed');
        }
        console.log('   ✅ Mainnet address validation passed');
        console.log('   ✅ Testnet address validation passed');

        // Test multiple address generation from same mnemonic
        console.log('6. Testing multiple address generation...');
        const addresses = [];
        for (let i = 0; i < 5; i++) {
            const address = await CharmsWallet.generateAddress(testMnemonic, 'testnet', i);
            addresses.push(address);
        }

        // Check all addresses are unique
        const uniqueAddresses = new Set(addresses);
        if (uniqueAddresses.size !== addresses.length) {
            throw new Error('Generated addresses are not unique');
        }
        console.log('   ✅ Generated 5 unique addresses from same mnemonic');

        // Test change address generation
        console.log('7. Testing change address generation...');
        const changeAddress = await CharmsWallet.generateAddress(testMnemonic, 'testnet', 1);
        const receivingAddress = await CharmsWallet.generateAddress(testMnemonic, 'testnet', 0);

        if (changeAddress === receivingAddress) {
            throw new Error('Change address should be different from receiving address');
        }
        console.log('   ✅ Change address generated:', changeAddress);

        // Test wallet configuration
        console.log('8. Testing wallet configuration...');
        const config = testnetWallet.getConfig();
        if (config.network !== 'testnet') {
            throw new Error('Wallet configuration network mismatch');
        }
        console.log('   ✅ Wallet configuration retrieved successfully');

        // Test private key extraction
        console.log('9. Testing private key extraction...');
        const privateKey = await CharmsWallet.getPrivateKey(testMnemonic, 'testnet', 0);
        if (!privateKey || privateKey.length !== 32) {
            throw new Error('Private key should be 32 bytes');
        }
        console.log('   ✅ Private key extracted successfully, length:', privateKey.length, 'bytes');

        // Test complete address data
        console.log('10. Testing complete address data...');
        const addressData = await CharmsWallet.getAddressData(testMnemonic, 'testnet', 0);
        if (!addressData.address || !addressData.privateKey || !addressData.publicKey || !addressData.xOnlyPubkey) {
            throw new Error('Address data incomplete');
        }
        if (addressData.address !== testnetAddress) {
            throw new Error('Address data address mismatch');
        }
        if (addressData.publicKey.length !== 33) {
            throw new Error('Public key should be 33 bytes');
        }
        if (addressData.xOnlyPubkey.length !== 32) {
            throw new Error('X-only public key should be 32 bytes');
        }
        console.log('   ✅ Complete address data retrieved successfully');

        // Test AddressWallet creation from private key
        console.log('11. Testing AddressWallet creation...');
        const addressWallet = CharmsWallet.fromPrivateKey(privateKey, 'testnet');
        if (!addressWallet.getAddress().startsWith('tb1p')) {
            throw new Error('AddressWallet should generate testnet address');
        }
        console.log('   ✅ AddressWallet created from private key successfully');
        console.log('      Generated address:', addressWallet.getAddress());

        // Test direct AddressWallet creation with provided address
        console.log('12. Testing direct AddressWallet creation...');
        const directAddressWallet = new AddressWallet(privateKey, 'testnet', testnetAddress);
        if (directAddressWallet.getAddress() !== testnetAddress) {
            throw new Error('Direct AddressWallet should use provided address');
        }
        if (directAddressWallet.getPublicKey().length !== 33) {
            throw new Error('AddressWallet public key should be 33 bytes');
        }
        if (directAddressWallet.getXOnlyPublicKey().length !== 32) {
            throw new Error('AddressWallet x-only public key should be 32 bytes');
        }
        console.log('   ✅ Direct AddressWallet creation successful');

        // Test private key consistency across different methods
        console.log('13. Testing private key consistency...');
        const privateKey2 = await CharmsWallet.getPrivateKey(testMnemonic, 'testnet', 0);
        const addressData2 = await CharmsWallet.getAddressData(testMnemonic, 'testnet', 0);

        if (privateKey.length !== privateKey2.length) {
            throw new Error('Private key lengths inconsistent');
        }

        // Compare byte by byte
        for (let i = 0; i < privateKey.length; i++) {
            if (privateKey[i] !== privateKey2[i] || privateKey[i] !== addressData2.privateKey[i]) {
                throw new Error('Private keys inconsistent');
            }
        }
        console.log('   ✅ Private key consistency verified');

        console.log('\n🎉 All wallet tests passed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Wallet test failed:', error.message);
        console.error('   Stack:', error.stack);
        return false;
    }
}

// Run the test
testWalletFunctionality()
    .then(success => {
        if (success) {
            console.log('\n✅ Wallet functionality is working correctly!');
            process.exit(0);
        } else {
            console.log('\n❌ Wallet functionality has issues!');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });

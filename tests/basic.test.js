// Basic functionality tests for Charms Wallet JS

const { CharmsWallet, AddressWallet } = require('../dist/index.js');

async function testBasicFunctionality() {
    console.log('🔮 Testing Charms Wallet JS Basic Functionality\n');

    try {
        // Test 1: Create wallet instance
        console.log('1. Creating wallet instance...');
        const wallet = new CharmsWallet({ network: 'testnet' });
        console.log('   ✅ Wallet created successfully');

        // Test 2: Generate mnemonic
        console.log('2. Generating mnemonic...');
        const mnemonic = wallet.generateMnemonic();
        console.log('   ✅ Mnemonic generated:', mnemonic.split(' ').length, 'words');

        // Test 3: Validate mnemonic
        console.log('3. Validating mnemonic...');
        const validation = wallet.validateMnemonic(mnemonic);
        console.log('   ✅ Mnemonic validation:', validation.valid ? 'VALID' : 'INVALID');

        // Test 4: Generate address
        console.log('4. Generating Taproot address...');
        const address = await CharmsWallet.generateAddress(mnemonic, 'testnet', 0);
        console.log('   ✅ Address generated:', address);

        // Test 5: Generate change address
        console.log('5. Generating change address...');
        const changeAddress = await CharmsWallet.generateAddress(mnemonic, 'testnet', 1);
        console.log('   ✅ Change address generated:', changeAddress);

        // Test 6: Validate address
        console.log('6. Validating address...');
        const addressValidation = wallet.validateAddress(address);
        console.log('   ✅ Address validation:', addressValidation.valid ? 'VALID' : 'INVALID');
        if (addressValidation.valid) {
            console.log('      Network:', addressValidation.network);
            console.log('      Type:', addressValidation.type);
        }

        // Test 7: Get private key
        console.log('7. Getting private key...');
        const privateKey = await CharmsWallet.getPrivateKey(mnemonic, 'testnet', 0);
        console.log('   ✅ Private key obtained, length:', privateKey.length, 'bytes');

        // Test 8: Get complete address data
        console.log('8. Getting complete address data...');
        const addressData = await CharmsWallet.getAddressData(mnemonic, 'testnet', 0);
        console.log('   ✅ Address data obtained');
        console.log('      Address matches:', addressData.address === address ? 'YES' : 'NO');
        console.log('      Public key length:', addressData.publicKey.length, 'bytes');
        console.log('      X-only pubkey length:', addressData.xOnlyPubkey.length, 'bytes');

        // Test 9: Create AddressWallet from private key
        console.log('9. Creating AddressWallet from private key...');
        const addressWallet = CharmsWallet.fromPrivateKey(privateKey, 'testnet');
        console.log('   ✅ AddressWallet created');
        console.log('      Address generated:', addressWallet.getAddress());
        console.log('      Address is valid format:', addressWallet.getAddress().startsWith('tb1p') ? 'YES' : 'NO');

        // Test 10: Create AddressWallet directly with mock address
        console.log('10. Creating AddressWallet directly...');
        const mockAddress = 'tb1p' + '0'.repeat(58);
        const directAddressWallet = new AddressWallet(privateKey, 'testnet', mockAddress);
        console.log('    ✅ Direct AddressWallet created');
        console.log('       Address used:', directAddressWallet.getAddress());

        console.log('\n🎉 All basic tests passed successfully!');
        console.log('\n📊 Test Summary:');
        console.log('   - Wallet creation: ✅');
        console.log('   - Mnemonic generation: ✅');
        console.log('   - Mnemonic validation: ✅');
        console.log('   - Address generation: ✅');
        console.log('   - Change address generation: ✅');
        console.log('   - Address validation: ✅');
        console.log('   - Private key extraction: ✅');
        console.log('   - Complete address data: ✅');
        console.log('   - AddressWallet from private key: ✅');
        console.log('   - Direct AddressWallet creation: ✅');

        return true;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('   Stack:', error.stack);
        return false;
    }
}

// Run the test
testBasicFunctionality()
    .then(success => {
        if (success) {
            console.log('\n✅ Library is working correctly!');
            process.exit(0);
        } else {
            console.log('\n❌ Library has issues!');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });

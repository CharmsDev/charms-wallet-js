// Test runner for all Charms Wallet JS tests

const { spawn } = require('child_process');
const path = require('path');

async function runTest(testFile) {
    return new Promise((resolve) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Running: ${testFile}`);
        console.log(`${'='.repeat(60)}`);

        const testPath = path.join(__dirname, testFile);
        const child = spawn('node', [testPath], {
            stdio: 'inherit',
            cwd: path.dirname(__dirname)
        });

        child.on('close', (code) => {
            resolve({
                test: testFile,
                success: code === 0,
                code
            });
        });
    });
}

async function runAllTests() {
    console.log('🔮 Charms Wallet JS - Test Suite Runner');
    console.log('=====================================\n');

    const tests = [
        'basic.test.js',
        'wallet.test.js'
    ];

    const results = [];
    let totalTests = 0;
    let passedTests = 0;

    for (const test of tests) {
        totalTests++;
        const result = await runTest(test);
        results.push(result);

        if (result.success) {
            passedTests++;
        }
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('TEST SUMMARY');
    console.log(`${'='.repeat(60)}`);

    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.test}`);
    });

    console.log(`\nTotal Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed successfully!');
        process.exit(0);
    } else {
        console.log('\n❌ Some tests failed!');
        process.exit(1);
    }
}

// Run all tests
runAllTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
});

module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended'
    ],
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
    },
    env: {
        node: true,
        es6: true
    },
    rules: {
        // Code quality
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',

        // Style
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',

        // Best practices
        'eqeqeq': ['error', 'always'],
        'no-console': 'off',
        'no-debugger': 'error',
        'no-alert': 'error',

        // Import/export
        'no-duplicate-imports': 'error',

        // Async/await
        'require-await': 'error',
        'no-return-await': 'error'
    },
    ignorePatterns: [
        'dist/',
        'node_modules/',
        '*.js',
        '*.d.ts'
    ]
};

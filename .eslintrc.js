// .eslintrc.js
module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },

    overrides: [
        // 纯 TS/TSX
        {
            files: ['**/*.ts', '**/*.tsx'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            plugins: ['@typescript-eslint'],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
            ],

            rules: {
                '@typescript-eslint/no-explicit-any': 'off',  // 或 'warn'
            }
        },
        // Vue SFC（含 <script lang="ts">）
        {
            files: ['**/*.vue'],
            parser: 'vue-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser',
                extraFileExtensions: ['.vue'],
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            plugins: ['vue', '@typescript-eslint'],
            extends: [
                'eslint:recommended',
                'plugin:vue/essential',             // Vue3 用 essential
                'plugin:@typescript-eslint/recommended',
            ],
            rules: {
                'vue/multi-word-component-names': 'off',
                '@typescript-eslint/no-explicit-any': 'off',  // 或 'warn'
            },
        },
    ],
}

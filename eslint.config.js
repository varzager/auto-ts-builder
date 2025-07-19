const globals = require('globals');
const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'prettier': prettierPlugin,
      'jest': jestPlugin,
    },
    rules: {
      // Disable prettier integration with ESLint to keep your existing formatting
      'prettier/prettier': 'off',
      // Disable the standard no-unused-vars rule as we'll use the TypeScript one
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // Ignore pattern for parameters in type definitions
          argsIgnorePattern: '^_|^value$|^args$|^builder$|^Rest$',
          varsIgnorePattern: '^_|^value$|^args$|^builder$|^Rest$',
          // Allow unused vars in destructuring
          ignoreRestSiblings: true,
          // Add special handling for type parameters
          destructuredArrayIgnorePattern: '^_'
        }
      ]
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    plugins: {
      'jest': jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },
];

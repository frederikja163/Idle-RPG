import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      js,
      '@typescript-eslint': tseslint.plugin,
      react: pluginReact,
      'react-hooks': reactHooks,
    },
    extends: ['js/recommended', tseslint.configs.recommended, pluginReact.configs.flat.recommended],
    rules: {
      // Disabled for react 17+.
      'react/react-in-jsx-scope': 'off',
      // Allow _ for unused variables.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '_+', varsIgnorePattern: '_+' }],
      // Disabled when using react with typescript.
      'react/prop-types': 'off',
      // Detects misuse of React hooks.
      'react-hooks/rules-of-hooks': 'error',
      // Detects missing dependencies in React dependency-arrays
      'react-hooks/exhaustive-deps': 'error',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
  },
]);

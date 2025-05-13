import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import {defineConfig} from "eslint/config";

export default defineConfig([
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            js,
            "@typescript-eslint": tseslint.plugin,
            react: pluginReact,
        },
        extends: [
            "js/recommended",
            tseslint.configs.recommended,
            pluginReact.configs.flat.recommended,
        ],
        rules: {
            // Disabled for react 17+.
            "react/react-in-jsx-scope": "off",
            // Allow _ for unused variables.
            "@typescript-eslint/no-unused-vars": [
                "error",
                {argsIgnorePattern: "_+", varsIgnorePattern: "_+"},
            ],
            // Disabled when using react with typescript.
            'react/prop-types': 'off'
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2024,
            },
        },
    },
]);

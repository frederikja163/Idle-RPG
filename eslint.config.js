import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

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
      // We use empty patterns for socket events on the back-end.
      "no-empty-pattern": "off",
      // Disabled for react 17+.
      "react/react-in-jsx-scope": "off",
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
  },
]);

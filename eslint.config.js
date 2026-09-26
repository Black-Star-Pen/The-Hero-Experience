import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist/", "**/coverage/"]),

  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    extends: [js.configs.recommended],
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    extends: [tseslint.configs.recommended],
  },

  // Tooling files at the repository root
  {
    files: ["*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node },
  },

  // Client: React in the browser
  {
    files: ["client/**/*.{js,jsx,ts,tsx}"],
    extends: [
      eslintReact.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ["client/vite.config.{js,ts}"],
    languageOptions: { globals: globals.node },
  },

  // Server: Node.js
  {
    files: ["server/**/*.{js,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    // Legacy CommonJS server, replaced in refactor/server-architecture
    files: ["server/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
  {
    files: ["server/tests/**/*.js"],
    languageOptions: { globals: globals.jest },
  },

  prettier,
]);

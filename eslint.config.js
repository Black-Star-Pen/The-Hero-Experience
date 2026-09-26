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
    // Type-aware rules (floating promises, unsafe any…) for TypeScript code
    files: ["**/*.{ts,mts,cts,tsx}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Tooling files at the repository root
  {
    files: ["*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node },
  },

  // Client: React in the browser
  {
    files: ["client/**/*.{ts,tsx}"],
    extends: [
      eslintReact.configs["recommended-type-checked"],
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
    // Vitest asymmetric matchers (expect.any…) are typed as `any`
    files: ["**/tests/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
    rules: { "@typescript-eslint/no-unsafe-assignment": "off" },
  },

  prettier,
]);

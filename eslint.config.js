import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["node_modules/**", ".history/**", "dist/**", "out/**", "build/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",  // ✅ Enables modern syntax like class fields
      sourceType: "module",   // ✅ So you can use ES modules (import/export)
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "warn", // Warn for unused variables
      "no-undef": "error"       // Error for undeclared variables
    }
  }
]);

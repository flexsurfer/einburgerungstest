import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import hooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export function projectConfig({ ignores = [], commonjs = [] } = {}) {
  return defineConfig([
    globalIgnores([
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/artifacts/**",
      "**/.expo/**",
      "**/android/**",
      "**/ios/**",
      ...ignores,
    ]),
    {
      files: ["**/*.{js,jsx,mjs,ts,tsx,mts}"],
      extends: [js.configs.recommended, tseslint.configs.recommended],
      languageOptions: {
        globals: { ...globals.node, ...globals.browser },
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
        ],
      },
    },
    {
      files: ["**/*.{jsx,tsx}", "**/hooks/*.{js,ts}"],
      extends: [hooks.configs.flat.recommended],
    },
    {
      files: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/test/setup.js"],
      languageOptions: {
        globals: Object.fromEntries(
          [
            "afterAll",
            "afterEach",
            "beforeAll",
            "beforeEach",
            "describe",
            "expect",
            "it",
            "test",
            "vi",
          ].map((name) => [name, "readonly"]),
        ),
      },
    },
    ...(commonjs.length
      ? [
          {
            files: commonjs,
            languageOptions: { sourceType: "commonjs" },
            rules: { "@typescript-eslint/no-require-imports": "off" },
          },
        ]
      : []),
    prettier,
  ]);
}

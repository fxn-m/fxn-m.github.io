import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginVue from "eslint-plugin-vue"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser }
    }
  },

  // Override rules
  {
    rules: {
      "vue/multi-word-component-names": "off",
      // "no-console": "error",
      "no-debugger": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "multiline-ternary": ["error", "always-multiline"],
      "no-duplicate-imports": "error"
      // "no-magic-numbers": ["warn", { ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true }]
    }
  }
]

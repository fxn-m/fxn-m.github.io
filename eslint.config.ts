// eslint.config.ts (flat)

import css from "@eslint/css"
import js from "@eslint/js"
import json from "@eslint/json"
import markdown from "@eslint/markdown"
import { defineConfig } from "eslint/config"
import importPlugin from "eslint-plugin-import"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import pluginVue from "eslint-plugin-vue"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
  // Base JS/TS/Vue
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    plugins: {
      js,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      import: importPlugin
    },
    extends: [
      "js/recommended",
      ...tseslint.configs.recommended,
      pluginVue.configs["flat/essential"]
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node }
    },
    settings: {
      // Make import rules understand your Vite alias like @/...
      "import/resolver": {
        alias: {
          map: [["@", "./src"]],
          extensions: [".ts", ".tsx", ".js", ".jsx", ".vue"]
        }
      }
    },
    rules: {
      // --- Import order & hygiene ---
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1) Node builtins (node: and bare builtins)
            [
              "^node:",
              "^(assert|buffer|child_process|cluster|crypto|dgram|dns|domain|events|fs|http|http2|https|inspector|module|net|os|path|perf_hooks|process|punycode|querystring|readline|repl|stream|string_decoder|timers|tls|tty|url|util|v8|vm|zlib)(/|$)"
            ],
            // 2) Packages
            ["^vue$", "^@?\\w"],
            // 3) Aliased imports
            ["^@(/|$)"],
            // 4) Relative imports
            [
              "^\\.\\.(?!/?$)",
              "^\\.\\./?$",
              "^\\./(?=.*/)(?!/?$)",
              "^\\.(?!/?$)",
              "^\\./?$"
            ],
            // 5) Side-effect imports
            ["^\\u0000"],
            // 6) Styles
            ["\\.s?css$"]
          ]
        }
      ],
      "simple-import-sort/exports": "error",

      // Remove unused imports; keep ability to prefix with _ for intentional ignores
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],

      // import plugin sanity (optional but useful)
      "import/no-duplicates": "error",
      "import/newline-after-import": "error"
    }
  },

  // Ensure <script lang="ts"> in .vue uses TS parser
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      // Vue SFCs sometimes trip this; keep resolver doing the heavy lifting
      "import/no-unresolved": "off"
    }
  },

  // JSON
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"]
  },

  // Markdown
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"]
  },

  // CSS
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"]
  }
])

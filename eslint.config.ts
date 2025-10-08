// eslint.config.ts (flat)

import css from "@eslint/css"
import js from "@eslint/js"
import json from "@eslint/json"
import markdown from "@eslint/markdown"
import type { ESLint } from "eslint"
import importPlugin from "eslint-plugin-import"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import vue from "eslint-plugin-vue"
import globals from "globals"
import tseslint from "typescript-eslint"

const vueConfigs = vue.configs["flat/essential"].map((config) =>
  config.files ? config : { ...config, files: ["**/*.vue"] }
) satisfies ESLint.Config[]

const markdownConfigs = markdown.configs.recommended.map((config) => ({
  ...config,
  language:
    config.language === "markdown/commonmark"
      ? "markdown/gfm"
      : config.language,
  rules: {
    ...config.rules,
    "no-irregular-whitespace": "off"
  }
})) satisfies ESLint.Config[]

const jsonRecommended = {
  files: ["**/*.json"],
  ignores: ["package-lock.json"],
  language: "json/json",
  ...json.configs.recommended
} satisfies ESLint.Config

const cssRecommended = {
  files: ["**/*.css"],
  language: "css/css",
  ...css.configs.recommended
} satisfies ESLint.Config

const projectRules = {
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
  languageOptions: {
    ecmaVersion: 2023,
    sourceType: "module",
    globals: {
      ...globals.browser,
      ...globals.node
    }
  },
  plugins: {
    import: importPlugin,
    "simple-import-sort": simpleImportSort,
    "unused-imports": unusedImports
  },
  settings: {
    "import/resolver": {
      alias: {
        map: [["@", "./src"]],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".vue"]
      }
    }
  },
  rules: {
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          [
            "^node:",
            "^(assert|buffer|child_process|cluster|crypto|dgram|dns|domain|events|fs|http|http2|https|inspector|module|net|os|path|perf_hooks|process|punycode|querystring|readline|repl|stream|string_decoder|timers|tls|tty|url|util|v8|vm|zlib)(/|$)"
          ],
          ["^vue$", "^@?\\w"],
          ["^@(/|$)"],
          [
            "^\\.\\.(?!/?$)",
            "^\\.\\./?$",
            "^\\./(?=.*/)(?!/?$)",
            "^\\.(?!/?$)",
            "^\\./?$"
          ],
          ["^\\u0000"],
          ["\\.s?css$"]
        ]
      }
    ],
    "simple-import-sort/exports": "error",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "import/no-duplicates": "error",
    "import/newline-after-import": "error"
  }
} satisfies ESLint.Config

const vueScriptLangTsConfig = {
  files: ["**/*.vue"],
  languageOptions: {
    parserOptions: {
      // Ensure <script lang="ts"> blocks reuse TypeScript ESLint parser
      parser: tseslint.parser
    }
  },
  rules: {
    "import/no-unresolved": "off"
  }
} satisfies ESLint.Config

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vueConfigs,
  projectRules,
  vueScriptLangTsConfig,
  ...markdownConfigs,
  jsonRecommended,
  cssRecommended
)

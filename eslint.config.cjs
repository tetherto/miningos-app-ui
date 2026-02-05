const { defineConfig, globalIgnores } = require('eslint/config')
const globals = require('globals')
const js = require('@eslint/js')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const lodash = require('eslint-plugin-lodash')
const testingLibrary = require('eslint-plugin-testing-library')
const importPlugin = require('eslint-plugin-import')
const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const noRestrictedDisableNoConsole = require('./eslint-rules/no-restricted-disable-no-console.cjs')

module.exports = defineConfig([
  globalIgnores([
    '**/.**/',
    '**/node_modules/',
    '**/build/',
    '**/dist/',
    '**/coverage/',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/public/',
    '**/.eslintcache',
    '**/.github/',
    '**/scripts/',
    '**/vite.config.js',
    '**/vitest.config.js',
    '**/prettier.config.cjs',
    '**/eslint.config.js.backup',
    '**/mockdata.ts',
  ]),
  {
    files: ['src/**/*.js', 'src/**/*.jsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      lodash,
      'testing-library': testingLibrary,
      import: importPlugin,
      'custom-rules': {
        rules: {
          'no-restricted-disable-no-console': noRestrictedDisableNoConsole,
        },
      },
    },

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'date-fns',
              message:
                "Import functions directly (e.g., 'date-fns/subWeeks') instead of using named imports.",
            },
            {
              name: 'antd',
              message:
                "Import components directly (e.g., 'antd/es/button') instead of using named imports.",
            },
          ],
        },
      ],

      'no-nested-ternary': 'error',
      'react/require-default-props': 'off',
      'react/default-props-match-prop-types': 'error',
      'react/prop-types': 'error',
      'react/react-in-jsx-scope': 'off',
      'arrow-parens': ['error', 'always'],
      'jsx-quotes': ['error', 'prefer-double'],

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      eqeqeq: ['error', 'always'],

      'no-else-return': [
        'error',
        {
          allowElseIf: false,
        },
      ],

      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
        },
      ],

      'arrow-spacing': ['error'],
      'keyword-spacing': ['error'],
      'space-infix-ops': ['error'],

      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true,
        },
      ],

      'object-curly-spacing': ['error', 'always'],
      'no-debugger': 'error',
      semi: ['error', 'never'],
      'react/jsx-indent': ['error', 2],
      'no-console': 'error',
      'custom-rules/no-restricted-disable-no-console': 'error',
      'no-unused-vars': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'import/no-cycle': ['error'],
      'react-hooks/exhaustive-deps': 'off',
      'no-case-declarations': 'off',
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        VoidFunction: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react,
      'react-hooks': reactHooks,
      lodash,
      'testing-library': testingLibrary,
      import: importPlugin,
      'custom-rules': {
        rules: {
          'no-restricted-disable-no-console': noRestrictedDisableNoConsole,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,

      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'date-fns',
              message:
                "Import functions directly (e.g., 'date-fns/subWeeks') instead of using named imports.",
            },
            {
              name: 'antd',
              message:
                "Import components directly (e.g., 'antd/es/button') instead of using named imports.",
            },
          ],
        },
      ],

      'no-nested-ternary': 'error',
      'react/require-default-props': 'off',
      'react/default-props-match-prop-types': 'off', // TypeScript handles this
      'react/prop-types': 'off', // TypeScript handles prop validation
      'react/react-in-jsx-scope': 'off',
      'arrow-parens': ['error', 'always'],
      'jsx-quotes': ['error', 'prefer-double'],

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      eqeqeq: ['error', 'always'],

      'no-else-return': [
        'error',
        {
          allowElseIf: false,
        },
      ],

      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
        },
      ],

      'arrow-spacing': ['error'],
      'keyword-spacing': ['error'],
      'space-infix-ops': ['error'],

      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true,
        },
      ],

      'object-curly-spacing': ['error', 'always'],
      'no-debugger': 'error',
      semi: ['error', 'never'],
      'react/jsx-indent': ['error', 2],
      'no-console': 'error',
      'custom-rules/no-restricted-disable-no-console': 'error',
      'no-unused-vars': 'off', // Use TypeScript version
      '@typescript-eslint/no-unused-vars': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'import/no-cycle': ['error'],
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'no-case-declarations': 'off',
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    files: ['src/**/*.js'],
    rules: {
      'lodash/prop-shorthand': 'error',
      'lodash/matches-shorthand': 'error',
      'lodash/matches-prop-shorthand': 'error',
      'lodash/prefer-constant': 'error',
      'lodash/prefer-flat-map': 'error',
      'lodash/prefer-some': 'error',
      'lodash/path-style': ['error', 'array'],
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx'],
    rules: {
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-case-declarations': 'off',
      'react/prop-types': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // Exception for logger service - it intentionally uses console statements
    files: ['src/app/services/logger.ts'],
    rules: {
      'custom-rules/no-restricted-disable-no-console': 'off',
    },
  },
])

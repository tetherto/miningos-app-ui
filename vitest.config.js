/* eslint-disable lodash/prefer-lodash-method */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

process.env.TZ = 'UTC'

export default defineConfig({
  plugins: [
    react({
      babel: {
        babelrc: true, // Enable reading from .babelrc
        configFile: true,
      },
    }),
  ],

  test: {
    globals: true,
    environment: 'jsdom',
    // Optimize parallelism - use all available CPU cores
    threads: true,
    maxThreads: 0, // Use all available cores
    minThreads: 1,
    // Reduce isolation overhead while maintaining test safety
    isolate: true, // Enable isolation to prevent module loading issues in CI
    // Optimize test file discovery
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.git', '.cache'],
    // Optimize setup
    setupFiles: ['./src/setupTests.ts'],
    css: false,
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'src/setupTests.ts',
        'src/setupTests/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'src/**/index.{ts,tsx}',
        'src/types/**',
        'src/mockdata/**',
        'src/router/**',
        'src/styles/**',
        'src/App.tsx',
        'src/index.tsx',
        'src/initSentry.ts',
        'src/contexts/**',
        'src/test-utils/**',
        'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
        'src/Components/**/*.tsx',
        'src/Views/**/*.tsx',
        'src/MultiSiteViews/**/*.tsx',
        'src/**/*.{styles,style}.{ts,tsx}',
        'src/**/*.styled.ts',
        'src/**/*.types.ts',
        'src/**/types.ts',
        // Fixture / documentation data files — not production code
        'src/**/mocks.ts',
        'src/**/documentationMocks.ts',
        // Explicit types subdirectory (e.g. HashBalance/types/*)
        'src/**/types/**',
        // Pure-type files that don't match *.types.ts convention
        'src/Components/Settings/RBACControl/rolePermissions.ts',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 79,
        branches: 75,
      },
    },
    // Optimize test timeout
    testTimeout: 10000,
    // Optimize transform mode
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
    // Optimize dependency handling
    deps: {
      optimizer: {
        web: {
          include: [/chart\.js/, /react-gauge-chart/, /d3/],
        },
      },
      interopDefault: true,
    },
    // Optimize server configuration
    server: {
      deps: {
        inline: [/react-gauge-chart/],
      },
    },
    // Add performance optimizations
    pool: 'threads', // Use thread pool for better parallelism
    poolOptions: {
      threads: {
        singleThread: false, // Allow multiple threads
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      src: fileURLToPath(new URL('./src', import.meta.url)),
      'lodash-es': 'lodash',
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },

  define: {
    'process.env': JSON.stringify({
      NODE_ENV: 'test',
    }),
    global: 'globalThis',
  },
})

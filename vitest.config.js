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
    // Disable CSS processing in tests (not needed for most tests)
    css: false,
    // Optimize coverage collection
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Exclude unnecessary files from coverage
      exclude: [
        'node_modules/**',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.js',
      ],
    },
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
    // Optimize test timeout
    testTimeout: 10000, // 10 seconds should be enough for most tests
    // Enable test result caching (using Vite's cacheDir instead)
    // cache: {
    //   dir: 'node_modules/.vitest',
    // },
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

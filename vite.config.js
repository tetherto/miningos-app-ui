/* eslint-disable lodash/prefer-lodash-method */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { getGitInfo } from './scripts/gitInfo.js'

const DEFAULT_PORT = 3030

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isDev = mode === 'development'
  const isStaging = mode === 'staging'
  const minifyInDev = env.VITE_MINIFY_DEV === 'true'

  return {
    base: env.VITE_BASE_URL || '/',
    define: {
      // Inject build-time constants
      __APP_MODE__: JSON.stringify(mode),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    css: {
      devSourcemap: true,
    },
    server: {
      port: Number(env.PORT) || DEFAULT_PORT,
      open: true,
      warmup: {
        clientFiles: [
          './src/App.tsx',
          './src/index.tsx',
          './src/router/**/*.js',
          './src/Theme/**/*.js',
        ],
      },
      proxy: {
        '/api': 'http://localhost:3000',
        '/auth': 'http://localhost:3000',
        '/oauth': 'http://localhost:3000',
        '/pub': 'http://localhost:3000',
        '/ws': { target: 'ws://localhost:3000', ws: true },
      },
    },
    optimizeDeps: {
      include: [
        'hoist-non-react-statics',
        'react',
        'react-dom',
        'react-redux',
        '@reduxjs/toolkit',
        'styled-components',
        'react-router',
      ],
      exclude: isDev || isStaging ? ['@sentry/react', '@sentry/cli'] : [],
      esbuildOptions: {
        mainFields: ['module', 'main'],
        target: 'esnext',
        loader: { '.js': 'jsx' },
      },
      force: minifyInDev,
    },
    plugins: [
      react({ babel: { babelrc: true, configFile: true } }),
      visualizer({
        filename: 'stats.html',
        open: !!process.env.BUNDLE_ANALYZE,
        gzipSize: true,
        brotliSize: true,
      }),
      {
        name: 'vite:git-revision',
        config() {
          return { define: { GIT_INFO: JSON.stringify(getGitInfo()) } }
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        src: fileURLToPath(new URL('./src', import.meta.url)),
      },
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.d.ts', '.json'],
    },
    esbuild: {
      loader: 'tsx',
      include: /src\/.*\.(jsx?|tsx?)$/,
      sourcemap: isDev,
      // Dev minify is optional; off by default for better DX.
      ...(minifyInDev && {
        minify: true,
      }),
      // Drop console and debugger only in production builds
      ...(!isDev && {
        drop: ['console', 'debugger'],
      }),
    },
    build: {
      outDir: 'build',
      // Prefer esbuild for speed unless you need terser features:
      minify: 'esbuild',
      sourcemap: isDev || isStaging ? true : 'hidden',
      chunkSizeWarningLimit: 800,
      target: 'es2020',
      modulePreload: { polyfill: false },
      cssCodeSplit: true,
      // Use lightningcss only if installed; otherwise omit:
      cssMinify: 'lightningcss',
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/react-gauge-chart/, /node_modules/],
        // Avoid esmExternals:true unless you know you need it.
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('LazyComponent')) return 'lazy-loaded-component'
            if (id.includes('@sentry')) return 'sentry'
            if (
              id.includes('chart.js') ||
              id.includes('react-chartjs-2') ||
              id.includes('chartjs-adapter-date-fns') ||
              id.includes('chartjs-plugin-datalabels') ||
              id.includes('chartjs-plugin-zoom') ||
              id.includes('lightweight-charts')
            ) return 'charts'
          },
          compact: true,
          exports: 'auto',
        },
      },
    },
  }
})

# Environment Setup Guide

This document explains how to build and run the application in different environments (development, staging, production).

## Overview

The application uses Vite's mode system to manage different environments. Each environment has its own configuration file and build process.

## Environment Files

The project uses the following environment files:

- `.env.development` - Development environment (default when running `npm start`)
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

**Common Variables:**

```bash
# Application environment identifier
VITE_APP_ENV=staging

# Base URL for the application
VITE_BASE_URL=/

# API Configuration
VITE_API_URL=https://staging-api.yourdomain.com

# Sentry Configuration
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=staging

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# Dev server port
PORT=3030
```

## Build Commands

### Development

```bash
# Start development server (uses .env.development)
npm start

# Or explicitly
npm run start
```

### Staging

```bash
# Start development server in staging mode
npm run start:staging

# Build for staging
npm run build:staging

# Preview staging build
npm run preview:staging

# Build staging with Sentry sourcemaps
npm run build-with-sentry:staging
```

### Production

```bash
# Build for production (uses .env.production)
npm run build

# Preview production build
npm run preview

# Build production with Sentry sourcemaps
npm run build-with-sentry
```

## How Frontend Detects Environment

### Method 1: Using Environment Utility (Recommended)

Import the environment utility functions:

```javascript
import { 
  isStaging, 
  isDevelopment, 
  isProduction,
  getAppEnvironment,
  env 
} from '@/app/utils/environment'

// Check environment
if (isStaging()) {
  console.log('Running in staging mode')
}

// Get environment name
const currentEnv = getAppEnvironment() // 'development' | 'staging' | 'production'

// Access all environment info
console.log(env.IS_STAGING) // true/false
console.log(env.API_URL) // API URL from env file
```

### Method 2: Direct Access to Environment Variables

```javascript
// Access environment variables directly
const appEnv = import.meta.env.VITE_APP_ENV
const apiUrl = import.meta.env.VITE_API_URL
const mode = import.meta.env.MODE // 'development' | 'staging' | 'production'
const isDev = import.meta.env.DEV // boolean
const isProd = import.meta.env.PROD // boolean
```

### Method 3: Using Build-Time Constants

```javascript
// These are injected at build time by Vite
console.log(__APP_MODE__) // 'development' | 'staging' | 'production'
console.log(__BUILD_TIME__) // ISO timestamp of when the build was created
console.log(GIT_INFO) // Git information (branch, commit, etc.)
```

## Environment-Specific Behavior

### Vite Configuration

The `vite.config.js` automatically adjusts based on the mode:

```javascript
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isStaging = mode === 'staging'
  const isProd = mode === 'production'

  return {
    // Staging and dev exclude Sentry from optimization
    optimizeDeps: {
      exclude: isDev || isStaging ? ['@sentry/react', '@sentry/cli'] : [],
    },
    
    // Staging gets full sourcemaps for debugging
    build: {
      sourcemap: isDev ? true : isStaging ? true : 'hidden',
    },
  }
})
```

### Conditional Code Execution

```javascript
import { isStaging, isDevelopment } from '@/app/utils/environment'

// Enable debug logging in staging and dev
if (isDevelopment() || isStaging()) {
  console.log('Debug mode enabled')
}

// Different API endpoints
const apiUrl = isStaging() 
  ? 'https://staging-api.example.com'
  : 'https://api.example.com'

// Feature flags
const enableBetaFeatures = isStaging() || isDevelopment()
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# Build for staging
- name: Build Staging
  run: npm run build:staging
  
# Build for production
- name: Build Production
  run: npm run build
```

### Docker Example

```dockerfile
# Build for staging
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:staging

# Production build
RUN npm run build
```

## Troubleshooting

### Environment variables not working

1. Ensure variables are prefixed with `VITE_`
2. Restart the dev server after changing `.env` files
3. Check that the correct `.env` file exists for your mode

### Wrong environment detected

1. Verify you're using the correct npm script:
   - `npm start` → development
   - `npm run start:staging` → staging
   - `npm run build` → production
   - `npm run build:staging` → staging

2. Check the console output for environment info:
   ```javascript
   import { logEnvironmentInfo } from '@/app/utils/environment'
   logEnvironmentInfo()
   ```

### Build artifacts contain wrong environment

1. Clean the build directory: `rm -rf build`
2. Rebuild with the correct command
3. Verify environment variables in the built files

## Best Practices

1. **Never commit sensitive data** to `.env` files that are tracked by git
2. **Use `.env.local`** for local overrides (automatically gitignored)
3. **Document all environment variables** in this file
4. **Use the environment utility** instead of direct `import.meta.env` access for consistency
5. **Test builds locally** before deploying to staging/production
6. **Use environment-specific feature flags** to control feature rollout

## Security Notes

- Production builds should have `sourcemap: 'hidden'` to protect source code
- Staging can have full sourcemaps for debugging
- Never expose API keys or secrets in `VITE_` variables (they're embedded in the bundle)
- Use backend environment variables for sensitive data


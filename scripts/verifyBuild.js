#!/usr/bin/env node

/**
 * Verify Build Script
 * Checks if the build was created with the correct environment configuration
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const buildDir = join(rootDir, 'build')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkBuildExists() {
  log('\n📦 Checking if build directory exists...', 'blue')
  
  if (!existsSync(buildDir)) {
    log('❌ Build directory not found! Run npm run build first.', 'red')
    process.exit(1)
  }
  
  log('✅ Build directory exists', 'green')
}

function findJsFiles() {
  log('\n🔍 Finding JavaScript files...', 'blue')
  
  const assetsDir = join(buildDir, 'assets')
  
  if (!existsSync(assetsDir)) {
    log('❌ Assets directory not found!', 'red')
    process.exit(1)
  }
  
  const files = readdirSync(assetsDir)
  const jsFiles = files
    .filter(f => f.endsWith('.js') && !f.endsWith('.map'))
    .map(f => join('build', 'assets', f))
  
  if (jsFiles.length === 0) {
    log('❌ No JavaScript files found in build/assets/', 'red')
    process.exit(1)
  }
  
  log(`✅ Found ${jsFiles.length} JavaScript files`, 'green')
  return jsFiles
}

function checkEnvironmentInBuild(jsFiles, expectedEnv = null) {
  log('\n🌍 Checking environment configuration in build...', 'blue')
  
  // More specific patterns to avoid false positives
  const envPatterns = {
    VITE_APP_ENV: /VITE_APP_ENV["\s:]*["']?(development|staging|production)["']?/g,
    APP_MODE: /__APP_MODE__["\s:]*["']?(development|staging|production)["']?/g,
  }
  
  const foundEnvs = new Set()
  let foundAny = false
  
  // Only check the largest JS files (more likely to contain env vars)
  const filesToCheck = jsFiles
    .map(f => ({ path: f, size: existsSync(join(rootDir, f)) ? readFileSync(join(rootDir, f), 'utf-8').length : 0 }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5) // Check top 5 largest files
  
  for (const { path: file } of filesToCheck) {
    const content = readFileSync(join(rootDir, file), 'utf-8')
    
    // Check each pattern
    for (const [key, pattern] of Object.entries(envPatterns)) {
      const matches = [...content.matchAll(pattern)]
      
      if (matches.length > 0) {
        foundAny = true
        matches.forEach(match => {
          const env = match[1]
          if (env === 'development' || env === 'staging' || env === 'production') {
            foundEnvs.add(env)
            log(`  Found ${key}: "${env}" in ${file.split('/').pop()}`, 'cyan')
          }
        })
      }
    }
  }
  
  if (!foundAny) {
    log('⚠️  No environment variables found in build (might be minified)', 'yellow')
    log('   This is normal if the variables are heavily optimized', 'yellow')
  } else {
    log(`\n📊 Detected environments: ${[...foundEnvs].join(', ')}`, 'cyan')
    
    if (expectedEnv && foundEnvs.has(expectedEnv)) {
      log(`✅ Build contains expected environment: "${expectedEnv}"`, 'green')
    } else if (expectedEnv) {
      log(`⚠️  Expected "${expectedEnv}" but found: ${[...foundEnvs].join(', ')}`, 'yellow')
    }
  }
  
  return foundEnvs
}

function checkSourcemaps() {
  log('\n🗺️  Checking sourcemaps...', 'blue')
  
  const assetsDir = join(buildDir, 'assets')
  const files = readdirSync(assetsDir)
  const mapFiles = files.filter(f => f.endsWith('.js.map'))
  
  if (mapFiles.length > 0) {
    log(`✅ Found ${mapFiles.length} sourcemap files (dev/staging build)`, 'green')
    return 'visible'
  } else {
    log('ℹ️  No sourcemap files found (production build with hidden sourcemaps)', 'cyan')
    return 'hidden'
  }
}

function checkBuildTime(jsFiles) {
  log('\n⏰ Checking build time...', 'blue')
  
  for (const file of jsFiles.slice(0, 3)) { // Check first 3 files
    const content = readFileSync(join(rootDir, file), 'utf-8')
    const buildTimeMatch = content.match(/__BUILD_TIME__["\s:=]+"([^"]+)"/)
    
    if (buildTimeMatch) {
      const buildTime = buildTimeMatch[1]
      const buildDate = new Date(buildTime)
      const now = new Date()
      const minutesAgo = Math.floor((now - buildDate) / 1000 / 60)
      
      log(`✅ Build time: ${buildDate.toLocaleString()}`, 'green')
      log(`   (${minutesAgo} minutes ago)`, 'cyan')
      return buildTime
    }
  }
  
  log('ℹ️  Build time not found (might be optimized out)', 'cyan')
  return null
}

function checkGitInfo(jsFiles) {
  log('\n🔧 Checking Git info...', 'blue')
  
  for (const file of jsFiles.slice(0, 3)) {
    const content = readFileSync(join(rootDir, file), 'utf-8')
    const gitInfoMatch = content.match(/GIT_INFO["\s:=]+({[^}]+})/)
    
    if (gitInfoMatch) {
      try {
        const gitInfo = JSON.parse(gitInfoMatch[1])
        log(`✅ Git commit: ${gitInfo.commit?.substring(0, 8) || 'unknown'}`, 'green')
        log(`   Branch: ${gitInfo.branch || 'unknown'}`, 'cyan')
        return gitInfo
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
  
  log('ℹ️  Git info not found', 'cyan')
  return null
}

function printSummary(envs, sourcemaps) {
  log('\n' + '='.repeat(60), 'blue')
  log('📋 BUILD VERIFICATION SUMMARY', 'blue')
  log('='.repeat(60), 'blue')
  
  log('\n🎯 Environment:', 'cyan')
  if (envs.size > 0) {
    log(`   ${[...envs].join(', ')}`, 'green')
  } else {
    log('   Unable to determine (heavily minified)', 'yellow')
  }
  
  log('\n🗺️  Sourcemaps:', 'cyan')
  log(`   ${sourcemaps === 'visible' ? 'Present (dev/staging)' : 'Hidden/None (production)'}`, 
      sourcemaps === 'visible' ? 'green' : 'cyan')
  
  log('\n✨ Build verification complete!\n', 'green')
}

// Main execution
function main() {
  const expectedEnv = process.argv[2] // Optional: pass expected environment
  
  log('🚀 Starting build verification...', 'blue')
  log(`📁 Build directory: ${buildDir}`, 'cyan')
  
  if (expectedEnv) {
    log(`🎯 Expected environment: ${expectedEnv}`, 'cyan')
  }
  
  checkBuildExists()
  const jsFiles = findJsFiles()
  const envs = checkEnvironmentInBuild(jsFiles, expectedEnv)
  const sourcemaps = checkSourcemaps()
  checkBuildTime(jsFiles)
  checkGitInfo(jsFiles)
  printSummary(envs, sourcemaps)
}

main()


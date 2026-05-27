#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const BUILD_DIR = 'build'
const ASSETS_DIR = join(BUILD_DIR, 'assets')
const RUNTIME_EXTS = /\.(js|css|woff2?|ttf|eot)$/i

function walkFiles(dir) {
  if (!existsSync(dir)) return []
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walkFiles(full))
    else if (entry.isFile()) results.push(full)
  }
  return results
}

function getDirectorySize(dir) {
  return walkFiles(dir).reduce((sum, f) => sum + statSync(f).size, 0)
}

function getRuntimeBundleSize(dir) {
  return walkFiles(dir)
    .filter(f => RUNTIME_EXTS.test(f))
    .reduce((sum, f) => sum + statSync(f).size, 0)
}

function getGzippedSize(dir) {
  return walkFiles(dir)
    .filter(f => RUNTIME_EXTS.test(f))
    .reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0)
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getStatus(gzippedSize, hasBuild) {
  if (!hasBuild) return '⚠️ No build'
  if (gzippedSize > 500 * 1024) return '🔴 > 500KB'
  if (gzippedSize > 200 * 1024) return '🟡 > 200KB'
  return '✅'
}

function listTopAssets(limit = 20) {
  if (!existsSync(ASSETS_DIR)) return []
  const files = []
  for (const name of readdirSync(ASSETS_DIR)) {
    const path = join(ASSETS_DIR, name)
    if (!statSync(path).isFile()) continue
    if (!/\.(js|css)$/i.test(name)) continue
    files.push({ name, bytes: statSync(path).size })
  }
  return files.sort((a, b) => b.bytes - a.bytes).slice(0, limit)
}

function main() {
  const markdown = process.argv.includes('--markdown')
  const sourceSize = getDirectorySize('src') + getDirectorySize('public')
  const builtSize = getRuntimeBundleSize(BUILD_DIR)
  const gzippedSize = getGzippedSize(BUILD_DIR)
  const hasBuild = existsSync(BUILD_DIR)
  const status = getStatus(gzippedSize, hasBuild)

  if (markdown) {
    console.log('| Metric | Value | Status |')
    console.log('|---|---:|---|')
    console.log(`| Source (\`src/\` + \`public/\`) | ${formatSize(sourceSize)} | |`)
    console.log(`| Runtime (JS/CSS/fonts in \`build/\`) | ${formatSize(builtSize)} | |`)
    console.log(`| Gzipped estimate | ${formatSize(gzippedSize)} | ${status} |`)
    console.log('')

    const top = listTopAssets()
    if (top.length > 0) {
      console.log('### Largest assets')
      console.log('')
      console.log('| File | Size |')
      console.log('|---|---:|')
      for (const f of top) {
        console.log(`| \`${f.name}\` | ${formatSize(f.bytes)} |`)
      }
      console.log('')
    }
    return
  }

  console.log('\n📦 Bundle size (miningos-app-ui)\n')
  console.log(`  Source:   ${formatSize(sourceSize)}`)
  console.log(`  Runtime:  ${formatSize(builtSize)}`)
  console.log(`  Gzipped:  ${formatSize(gzippedSize)}  ${status}\n`)

  const top = listTopAssets(10)
  if (top.length > 0) {
    console.log('  Largest assets:')
    for (const f of top) {
      console.log(`    ${f.name.padEnd(48)} ${formatSize(f.bytes)}`)
    }
    console.log('')
  }
}

main()

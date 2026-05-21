#!/usr/bin/env node
/* eslint-disable no-console */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const BUILD_DIR = 'build'
const ASSETS_DIR = join(BUILD_DIR, 'assets')

function getDirectorySize(dir) {
  if (!existsSync(dir)) return 0
  try {
    const output = execSync(`du -sk "${dir}"`, { encoding: 'utf8' })
    return Number.parseInt(output.split('\t')[0], 10) * 1024
  } catch {
    return 0
  }
}

function getRuntimeBundleSize(dir) {
  if (!existsSync(dir)) return 0
  try {
    const output = execSync(
      `find "${dir}" -type f \\( -name "*.js" -o -name "*.css" -o -name "*.woff" -o -name "*.woff2" -o -name "*.ttf" -o -name "*.eot" \\) -exec sh -c 'wc -c < "{}"' \\; | awk '{sum+=$1} END {print sum}'`,
      { encoding: 'utf8' },
    )
    return Number.parseInt(output.trim(), 10) || 0
  } catch {
    return 0
  }
}

function getGzippedSize(dir) {
  if (!existsSync(dir)) return 0
  try {
    const output = execSync(
      `find "${dir}" -type f \\( -name "*.js" -o -name "*.css" -o -name "*.woff" -o -name "*.woff2" -o -name "*.ttf" -o -name "*.eot" \\) -exec sh -c 'gzip -c "{}" | wc -c' \\; | awk '{sum+=$1} END {print sum}'`,
      { encoding: 'utf8' },
    )
    return Number.parseInt(output.trim(), 10) || 0
  } catch {
    return 0
  }
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

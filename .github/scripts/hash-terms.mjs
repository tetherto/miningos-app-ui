#!/usr/bin/env node
/**
 * Generate `.github/security/denylist.sha256` from a plaintext term list.
 *
 * The term list is deliberately NOT stored in this repository — see the note in
 * `lib/content-scan.mjs`. Keep it somewhere private and pass its path:
 *
 *   node .github/scripts/hash-terms.mjs <path-to-terms.txt> > .github/security/denylist.sha256
 *
 * Input format — INI-style sections name the category, one term per line:
 *
 *   # comment
 *   [site]
 *   Some Place
 *   Another Place
 *
 *   [partner]
 *   Somevendor
 *
 * Categories appear in scan output, so they must describe the *class* of leak
 * ("site", "partner", "codename", "infra", "placeholder", "credential") and never
 * hint at the term itself.
 */

import { readFileSync } from 'node:fs'

import { canonicalize, digest, MAX_NGRAM } from './lib/content-scan.mjs'

const source = process.argv[2]
if (!source) {
  console.error('usage: hash-terms.mjs <path-to-terms.txt>')
  process.exit(2)
}

const entries = new Map()
let category = null
let lineNo = 0

for (const raw of readFileSync(source, 'utf8').split('\n')) {
  lineNo++
  const line = raw.trim()
  if (line === '' || line.startsWith('#')) continue

  const section = line.match(/^\[([a-z][a-z0-9-]*)\]$/)
  if (section) {
    category = section[1]
    continue
  }

  if (!category) {
    console.error(`${source}:${lineNo}: term before any [category] section`)
    process.exit(2)
  }

  const canonical = canonicalize(line)
  if (canonical === '') {
    console.error(`${source}:${lineNo}: term has no alphanumeric content`)
    process.exit(2)
  }

  // A term longer than MAX_NGRAM tokens can never be produced by the scanner, so it
  // would sit in the denylist matching nothing — exactly the silent-pass failure this
  // whole mechanism exists to avoid. Fail loudly instead.
  const width = canonical.split('.').length
  if (width > MAX_NGRAM) {
    console.error(
      `${source}:${lineNo}: term spans ${width} tokens but the scanner only builds ` +
        `${MAX_NGRAM}-grams; it would never match. Use a shorter distinctive fragment.`,
    )
    process.exit(2)
  }

  entries.set(digest(canonical), category)
}

if (entries.size === 0) {
  console.error(`${source}: no terms found`)
  process.exit(2)
}

const rows = [...entries].map(([hash, cat]) => `${hash}  ${cat}`).sort()

process.stdout.write(
  [
    '# Content-scan denylist — SHA-256 digests only, never plaintext.',
    '#',
    '# Regenerate with:',
    '#   node .github/scripts/hash-terms.mjs <path-to-private-terms.txt> \\',
    '#     > .github/security/denylist.sha256',
    '#',
    '# The category is what the scanner reports; it names the class of leak, not the term.',
    `# ${rows.length} entries.`,
    '',
    ...rows,
    '',
  ].join('\n'),
)

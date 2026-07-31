#!/usr/bin/env node
/**
 * Scan tracked files for terms that must not appear in this repository.
 *
 * This repository is public. Two things follow from that, and both are load-bearing:
 *
 *   1. The terms live in `.github/security/denylist.sha256` as digests, never plaintext.
 *      See `lib/content-scan.mjs`.
 *   2. **Output names the file, the line and the category — never the matched text.**
 *      CI logs are as public as the code, so echoing the offending line would leak the
 *      term to exactly the audience the denylist exists to hide it from. Nothing in this
 *      file may print file content.
 *
 * Usage:
 *   node .github/scripts/scan-content.mjs [paths...]
 *
 * Exits 1 on any unexempted finding, on an expired exemption, or on a missing denylist.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { digest, digestExemption, ngrams, parseDigestFile, segment } from './lib/content-scan.mjs'

// Overridable so the self-test can point the scanner at a throwaway fixture repo.
const REPO_ROOT =
  process.env.CONTENT_SCAN_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DENYLIST = join(REPO_ROOT, '.github', 'security', 'denylist.sha256')
const EXEMPTIONS = join(REPO_ROOT, '.github', 'security', 'exemptions.tsv')

/**
 * Paths whose contents cannot meaningfully be scanned. Kept deliberately short — every
 * entry is a blind spot, so it must be justified by the file being generated, vendored,
 * or the denylist itself.
 */
const SKIP = [
  /^package-lock\.json$/,
  /^\.github\/security\/denylist\.sha256$/,
  /(^|\/)node_modules\//,
  /^(build|dist|coverage)\//,
]

/** Anything above this is a data dump, not source; reading it whole would be wasteful. */
const MAX_BYTES = 8 * 1024 * 1024

const fail = (msg) => {
  console.error(`error: ${msg}`)
  process.exit(1)
}

if (!existsSync(DENYLIST)) {
  fail(`missing ${DENYLIST} — generate it with .github/scripts/hash-terms.mjs`)
}

const denylist = new Map(
  parseDigestFile(readFileSync(DENYLIST, 'utf8')).map(({ hash, fields }) => [
    hash,
    fields[0] ?? 'unknown',
  ]),
)
if (denylist.size === 0) fail(`${DENYLIST} contains no entries`)

/**
 * Exemptions are keyed by digest(path + category) so the file names neither the term nor
 * — via the category alone — anything sensitive. Every entry carries an expiry: an
 * exemption that cannot lapse is just a permanently disabled check.
 */
const today = new Date().toISOString().slice(0, 10)
const exemptions = new Map()
if (existsSync(EXEMPTIONS)) {
  for (const { hash, fields } of parseDigestFile(readFileSync(EXEMPTIONS, 'utf8'))) {
    const [expires, ticket] = fields
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expires ?? '')) {
      fail(`${EXEMPTIONS}: entry ${hash.slice(0, 12)}… has no valid YYYY-MM-DD expiry`)
    }
    exemptions.set(hash, { expires, ticket: ticket ?? '(no ticket)', used: false })
  }
}

const listFiles = (paths) =>
  execFileSync('git', ['ls-files', '-z', '--', ...paths], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
    .split('\0')
    .filter(Boolean)

const files = listFiles(process.argv.slice(2).length ? process.argv.slice(2) : ['.']).filter(
  (f) => !SKIP.some((re) => re.test(f)),
)

const findings = []
const expired = []
const oversize = []
const binary = []

for (const file of files) {
  const abs = join(REPO_ROOT, file)
  let stat
  try {
    stat = statSync(abs)
  } catch {
    continue // deleted from the worktree but still indexed
  }
  if (!stat.isFile()) continue
  if (stat.size > MAX_BYTES) {
    oversize.push(file)
    continue
  }

  const buf = readFileSync(abs)
  // A NUL byte means "binary" and there is nothing useful to tokenise — but skipping
  // silently is how this scanner once stopped scanning its own source: a stray NUL in a
  // constant made a .mjs file look binary, and the terms in its comments went unreported.
  // Anything we decline to read is now named in the output, so a blind spot is visible.
  if (buf.includes(0)) {
    binary.push(file)
    continue
  }

  const lines = buf.toString('utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    // A line matches at most once per category — one report per line is enough to act on,
    // and repeating it would hint at how many terms the line contains.
    let hits = null
    for (const gram of ngrams(segment(lines[i]))) {
      const category = denylist.get(digest(gram))
      if (category) (hits ??= new Set()).add(category)
    }
    if (!hits) continue

    for (const category of hits) {
      const exemption = exemptions.get(digestExemption(file, category))
      if (exemption) {
        exemption.used = true
        if (exemption.expires >= today) continue
        expired.push({ file, category, ...exemption })
        continue
      }
      findings.push({ file, line: i + 1, category })
    }
  }
}

/* ---------------------------------------------------------------- reporting */

const byCategory = (rows) => {
  const groups = new Map()
  for (const r of rows) {
    if (!groups.has(r.category)) groups.set(r.category, [])
    groups.get(r.category).push(r)
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b))
}

if (findings.length > 0) {
  console.error(`\nContent scan FAILED — ${findings.length} disallowed term occurrence(s).\n`)
  for (const [category, rows] of byCategory(findings)) {
    console.error(`  [${category}] ${rows.length} occurrence(s)`)
    for (const r of rows) console.error(`    ${r.file}:${r.line}`)
    console.error('')
  }
  console.error('The matched text is withheld on purpose — CI logs are public. Open each')
  console.error('file:line to see it. Categories are defined in the private term list.\n')
}

if (expired.length > 0) {
  const seen = new Set()
  console.error('Expired exemptions — these no longer suppress anything:\n')
  for (const e of expired) {
    const key = `${e.file}/${e.category}`
    if (seen.has(key)) continue
    seen.add(key)
    console.error(`    ${e.file}  [${e.category}]  expired ${e.expires}  ${e.ticket}`)
  }
  console.error('')
}

const unused = [...exemptions.values()].filter((e) => !e.used)
if (unused.length > 0) {
  console.warn(`note: ${unused.length} exemption(s) matched nothing and can be removed.\n`)
}

if (oversize.length > 0) {
  console.warn(`note: skipped ${oversize.length} file(s) over ${MAX_BYTES} bytes:`)
  for (const f of oversize) console.warn(`    ${f}`)
  console.warn('')
}

if (binary.length > 0) {
  console.warn(`note: skipped ${binary.length} binary file(s) — unscanned, so verify by hand`)
  console.warn('      that none is a text file made binary by a stray NUL byte:')
  for (const f of binary) console.warn(`    ${f}`)
  console.warn('')
}

if (findings.length > 0 || expired.length > 0) process.exit(1)

console.log(
  `Content scan passed — ${files.length - binary.length - oversize.length} of ` +
    `${files.length} files scanned, ${denylist.size} denylist entries.`,
)
if (exemptions.size > 0) {
  console.log(`${exemptions.size} active exemption(s); the scan fails when one expires.`)
}

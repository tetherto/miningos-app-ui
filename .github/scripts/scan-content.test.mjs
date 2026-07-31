#!/usr/bin/env node --test
/**
 * Self-test for the content scan.
 *
 * This exists because of a specific near-miss. The scan was first prototyped with
 * `git grep -E '\b<term>\b'`, and POSIX ERE has no `\b` — every pattern matched nothing
 * and the scan reported a clean tree that was not clean. A security check that fails
 * open is worse than no check, because it manufactures confidence.
 *
 * So the contract under test is not "the scanner works" but **"the scanner still
 * detects a term it is supposed to detect"**. The canary cases below must fail the scan;
 * if a refactor makes them pass, this test goes red instead of the scan going quiet.
 *
 * Run: node --test .github/scripts/scan-content.test.mjs
 */

import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { after, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { canonicalize, digest, digestExemption, ngrams, segment } from './lib/content-scan.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const SCANNER = join(HERE, 'scan-content.mjs')

/** A term that appears nowhere in this repository, so the fixtures stay self-contained. */
const CANARY = 'zqxjcanary'

const roots = []
after(() => roots.forEach((r) => rmSync(r, { recursive: true, force: true })))

/**
 * Build a throwaway git repo containing `files`, plus a denylist holding `terms`.
 * Returns the scanner's exit code and combined output.
 */
function runScan({ files, terms = [CANARY], exemptions = null }) {
  const root = mkdtempSync(join(tmpdir(), 'content-scan-'))
  roots.push(root)

  mkdirSync(join(root, '.github', 'security'), { recursive: true })
  writeFileSync(
    join(root, '.github', 'security', 'denylist.sha256'),
    terms.map((t) => `${digest(canonicalize(t))}  canary`).join('\n') + '\n',
  )
  if (exemptions !== null) {
    writeFileSync(join(root, '.github', 'security', 'exemptions.tsv'), exemptions)
  }

  for (const [path, content] of Object.entries(files)) {
    const abs = join(root, path)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, content)
  }

  const git = (...args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  git('init', '-q')
  git('add', '-A')

  const res = spawnSync(process.execPath, [SCANNER], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, CONTENT_SCAN_ROOT: root },
  })
  return { code: res.status, out: `${res.stdout}${res.stderr}` }
}

const dateOffset = (days) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)

describe('detection — these must never start passing', () => {
  // Each case is a real shape from this codebase, with the term substituted.
  for (const [label, content] of [
    ['bare word', `const x = '${CANARY}'`],
    ['hyphen compound', `type: 'container-mbt-${CANARY}'`],
    ['embedded in an id', `'m221-${CANARY}-1-miner1': 'normal'`],
    ['screaming snake constant', `MODEL_${CANARY.toUpperCase()}: 'x'`],
    ['camelCase identifier', `export const is${CANARY[0].toUpperCase()}${CANARY.slice(1)} = 1`],
    ['inside a JSON string array', `{"tags": ["site-${CANARY}"]}`],
    ['capitalised prose', `Deployed at the ${CANARY[0].toUpperCase()}${CANARY.slice(1)} facility.`],
  ]) {
    it(`flags ${label}`, () => {
      const { code, out } = runScan({ files: { 'src/fixture.ts': content } })
      assert.equal(code, 1, `expected a failure for ${label}\n${out}`)
      assert.match(out, /src\/fixture\.ts:1/)
    })
  }

  it('flags a multi-token hostname joined by dots', () => {
    const { code } = runScan({
      files: { 'src/domains.ts': `const hosts = ['dev.${CANARY}.example']` },
      terms: [`${CANARY}.example`],
    })
    assert.equal(code, 1)
  })
})

describe('output must not leak the term', () => {
  it('reports file, line and category but never the matched text', () => {
    const { code, out } = runScan({
      files: { 'src/fixture.ts': `const x = 'prefix-${CANARY}-suffix'` },
    })
    assert.equal(code, 1)
    assert.match(out, /src\/fixture\.ts:1/)
    assert.match(out, /\[canary\]/)
    // The whole point of the hashed denylist: CI logs are public.
    assert.doesNotMatch(out, new RegExp(CANARY, 'i'), 'scanner echoed the matched term')
    assert.doesNotMatch(out, /prefix|suffix/, 'scanner echoed surrounding line content')
  })
})

describe('no false positives on legitimate content', () => {
  it('passes a clean tree', () => {
    const { code, out } = runScan({ files: { 'src/clean.ts': 'export const ok = 1' } })
    assert.equal(code, 0, out)
  })

  it('does not join tokens across whitespace', () => {
    // "Example. To use…" must not synthesise the hostname "example.to".
    const { code, out } = runScan({
      files: { 'README.md': 'Copyright Example. To use this, read the docs.' },
      terms: ['example.to'],
    })
    assert.equal(code, 0, out)
  })

  it('does not match a longer word that merely contains the term', () => {
    const { code, out } = runScan({
      files: { 'src/clean.ts': `export const x = '${CANARY}extra'` },
    })
    assert.equal(code, 0, out)
  })

  it('skips the denylist itself', () => {
    const { code, out } = runScan({ files: {} })
    assert.equal(code, 0, out)
  })
})

describe('exemptions', () => {
  const files = { 'src/wire.ts': `export const TYPE = '${CANARY}'` }
  const key = digestExemption('src/wire.ts', 'canary')

  it('suppresses a finding while current', () => {
    const { code, out } = runScan({
      files,
      exemptions: `${key}\t${dateOffset(30)}\tTICKET-1\n`,
    })
    assert.equal(code, 0, out)
  })

  it('fails once expired, so it cannot become permanent', () => {
    const { code, out } = runScan({
      files,
      exemptions: `${key}\t${dateOffset(-1)}\tTICKET-1\n`,
    })
    assert.equal(code, 1)
    assert.match(out, /[Ee]xpired/)
  })

  it('rejects an entry with no expiry', () => {
    const { code, out } = runScan({ files, exemptions: `${key}\n` })
    assert.equal(code, 1)
    assert.match(out, /expiry/)
  })

  it('does not suppress the same term in a different file', () => {
    const { code } = runScan({
      files: { ...files, 'src/other.ts': `export const T = '${CANARY}'` },
      exemptions: `${key}\t${dateOffset(30)}\tTICKET-1\n`,
    })
    assert.equal(code, 1)
  })
})

describe('tokeniser', () => {
  const grams = (s) => [...ngrams(segment(s))]

  it('splits identifiers on case and punctuation', () => {
    assert.deepEqual(grams('isMicroBTFoo').includes('foo'), true)
    assert.deepEqual(grams('CONTAINER_MBT_FOO').includes('foo'), true)
    assert.deepEqual(grams('container-mbt-foo').includes('foo'), true)
  })

  it('joins across non-whitespace separators only', () => {
    assert.ok(grams('a.b').includes('a.b'))
    assert.ok(grams('a-b').includes('a.b'), 'separator runs canonicalise to a dot')
    assert.ok(!grams('a b').includes('a.b'))
  })

  it('builds no n-gram longer than the generator allows', () => {
    assert.ok(grams('a.b.c.d').every((g) => g.split('.').length <= 3))
  })
})

describe('the real denylist', () => {
  it('is present and parseable', () => {
    const real = resolve(HERE, '..', 'security', 'denylist.sha256')
    const res = spawnSync(process.execPath, [SCANNER, '.github/security/denylist.sha256'], {
      cwd: resolve(HERE, '..', '..'),
      encoding: 'utf8',
    })
    assert.notEqual(res.status, null, `scanner did not run against ${real}`)
    assert.doesNotMatch(res.stderr, /missing|no entries/)
  })
})

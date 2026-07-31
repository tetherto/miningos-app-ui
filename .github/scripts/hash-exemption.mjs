#!/usr/bin/env node
/**
 * Print an exemption row for `.github/security/exemptions.tsv`.
 *
 *   node .github/scripts/hash-exemption.mjs <path> <category> <expires> [ticket]
 *
 * The row keys on a digest of path+category so the file never names a term. `expires`
 * is mandatory and enforced by the scanner: on that date the exemption stops
 * suppressing and the build fails. That is the point — an exemption is a deadline, not
 * a way to switch the check off.
 *
 * Run the scan first; its output tells you the path and category to exempt.
 */

import { digestExemption } from './lib/content-scan.mjs'

const [path, category, expires, ticket] = process.argv.slice(2)

if (!path || !category || !expires) {
  console.error('usage: hash-exemption.mjs <path> <category> <YYYY-MM-DD> [ticket]')
  process.exit(2)
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(expires)) {
  console.error(`invalid expiry ${expires}; use YYYY-MM-DD`)
  process.exit(2)
}

process.stdout.write(
  `${digestExemption(path, category)}\t${expires}\t${ticket ?? 'no-ticket'}\n`,
)

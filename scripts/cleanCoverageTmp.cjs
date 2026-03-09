/**
 * Removes coverage temp directory created by Vitest v8 coverage.
 * Prevents accumulation of 260+ JSON files in coverage/tmp (or project temp).
 */
const fs = require('fs')
const path = require('path')

const coverageTmp = path.join(process.cwd(), 'coverage', '.tmp')
if (fs.existsSync(coverageTmp)) {
  fs.rmSync(coverageTmp, { recursive: true, force: true })
}

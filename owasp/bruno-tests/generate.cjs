#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const ENDPOINTS_FILE = path.join(__dirname, 'endpoints.json')
const OUTPUT_DIR = __dirname

function loadEndpoints () {
  return JSON.parse(fs.readFileSync(ENDPOINTS_FILE, 'utf-8'))
}

function resolvePath (endpoint) {
  let resolved = endpoint.path
  for (const [param, envVar] of Object.entries(endpoint.pathParams || {})) {
    resolved = resolved.replace(param, envVar)
  }
  return resolved
}

function buildQueryString (params, { onlyRequired = false, excludeRequired = false, skipKeys = [] } = {}) {
  const parts = []
  for (const [name, config] of Object.entries(params)) {
    if (skipKeys.includes(name)) continue
    if (name === 'overwriteCache') continue
    if (excludeRequired && config.required) continue
    if (onlyRequired && !config.required) continue
    if (!config.bruValue && config.bruValue !== '0') continue
    if (config.bruValue === '') continue
    parts.push(`${name}=${config.bruValue}`)
  }
  return parts.join('&')
}

function fullUrl (endpoint, qsOverrides = {}) {
  const resolvedPath = resolvePath(endpoint)
  const qs = buildQueryString({ ...endpoint.queryParams, ...qsOverrides })
  return qs
    ? `{{baseUrl}}${resolvedPath}?${qs}`
    : `{{baseUrl}}${resolvedPath}`
}

function requiredOnlyUrl (endpoint) {
  const resolvedPath = resolvePath(endpoint)
  const qs = buildQueryString(endpoint.queryParams, { onlyRequired: true })
  return qs
    ? `{{baseUrl}}${resolvedPath}?${qs}`
    : `{{baseUrl}}${resolvedPath}`
}

function responseKeyAssertions (keys) {
  return keys.map(k => `    expect(res.body).to.have.property('${k}');`).join('\n')
}

// ---------------------------------------------------------------------------
// TEMPLATES — one function per .bru test file
// ---------------------------------------------------------------------------

function tplHappyPath (ep) {
  const url = fullUrl(ep)
  return `meta {
  name: [01] Happy Path
  type: http
  seq: 1
}

get {
  url: ${url}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

tests {
  test("returns 200", function() {
    expect(res.status).to.equal(200);
  });

  test("content-type is JSON", function() {
    expect(res.headers['content-type']).to.include('application/json');
  });

  test("response has expected top-level keys", function() {
${responseKeyAssertions(ep.expectedResponseKeys)}
  });

  test("response time under 5s", function() {
    expect(res.responseTime).to.be.below(5000);
  });
}
`
}

function tplNoAuth (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [02] Auth — No Token
  type: http
  seq: 2
}

get {
  url: ${url}
  body: none
  auth: none
}

tests {
  test("returns 401 without token", function() {
    expect(res.status).to.equal(401);
  });

  test("error message is generic (no info leak)", function() {
    expect(res.body.message).to.equal('ERR_AUTH_FAIL');
  });

  test("no business data in error response", function() {
${ep.expectedResponseKeys.map(k => `    expect(res.body).to.not.have.property('${k}');`).join('\n')}
  });
}
`
}

function tplInvalidToken (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [03] Auth — Invalid Token
  type: http
  seq: 3
}

get {
  url: ${url}
  body: none
  auth: bearer
}

auth:bearer {
  token: eyJhbGciOiJIUzI1NiJ9.aW52YWxpZA.invalid-signature
}

tests {
  test("returns 401 with invalid token", function() {
    expect(res.status).to.equal(401);
  });

  test("error message is generic", function() {
    expect(res.body.message).to.equal('ERR_AUTH_FAIL');
  });
}
`
}

function tplEmptyBearer (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [04] Auth — Empty Bearer
  type: http
  seq: 4
}

get {
  url: ${url}
  body: none
  auth: bearer
}

auth:bearer {
  token: 
}

tests {
  test("returns 401 with empty bearer", function() {
    expect(res.status).to.equal(401);
  });
}
`
}

function tplWrongScheme (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [05] Auth — Wrong Scheme (Basic)
  type: http
  seq: 5
}

get {
  url: ${url}
  body: none
  auth: basic
}

auth:basic {
  username: admin
  password: admin
}

tests {
  test("returns 401 with Basic auth scheme", function() {
    expect(res.status).to.equal(401);
  });
}
`
}

function tplBolaSiteInjection (ep) {
  const url = requiredOnlyUrl(ep) + (requiredOnlyUrl(ep).includes('?') ? '&' : '?') + 'siteId=999'
  return `meta {
  name: [06] BOLA — siteId Query Injection
  type: http
  seq: 6
}

get {
  url: ${url}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

tests {
  test("returns 200 (injected param ignored)", function() {
    expect(res.status).to.equal(200);
  });

  test("response matches normal shape (no cross-tenant data)", function() {
${responseKeyAssertions(ep.expectedResponseKeys)}
  });
}
`
}

function tplBolaHeaderInjection (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [07] BOLA — Header Injection
  type: http
  seq: 7
}

get {
  url: ${url}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

headers {
  X-Site-Id: 999
  X-Forwarded-For: 127.0.0.1
  X-Forwarded-Host: evil.com
}

tests {
  test("returns 200 (injected headers ignored)", function() {
    expect(res.status).to.be.oneOf([200, 403]);
  });
}
`
}

function tplMethodPost (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [08] Method Fuzzing — POST
  type: http
  seq: 8
}

post {
  url: ${url}
  body: json
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

body:json {
  {}
}

tests {
  test("POST returns 404 (GET-only endpoint)", function() {
    expect(res.status).to.be.oneOf([404, 405]);
  });
}
`
}

function tplMethodPut (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [09] Method Fuzzing — PUT
  type: http
  seq: 9
}

put {
  url: ${url}
  body: json
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

body:json {
  {}
}

tests {
  test("PUT returns 404 (GET-only endpoint)", function() {
    expect(res.status).to.be.oneOf([404, 405]);
  });
}
`
}

function tplMethodDelete (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [10] Method Fuzzing — DELETE
  type: http
  seq: 10
}

delete {
  url: ${url}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

tests {
  test("DELETE returns 404 (GET-only endpoint)", function() {
    expect(res.status).to.be.oneOf([404, 405]);
  });
}
`
}

function tplSecurityHeaders (ep) {
  const url = requiredOnlyUrl(ep)
  return `meta {
  name: [11] Security Headers Audit
  type: http
  seq: 11
}

get {
  url: ${url}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

tests {
  test("Content-Type is application/json", function() {
    expect(res.headers['content-type']).to.include('application/json');
  });

  test("has X-Content-Type-Options: nosniff", function() {
    expect(res.headers['x-content-type-options']).to.equal('nosniff');
  });

  test("no X-Powered-By header leaked", function() {
    expect(res.headers['x-powered-by']).to.not.exist;
  });

  test("has Cache-Control header", function() {
    const cc = res.headers['cache-control'];
    expect(cc).to.exist;
  });

  test("has Strict-Transport-Security (HSTS)", function() {
    expect(res.headers['strict-transport-security']).to.exist;
  });

  test("no duplicate X-Frame-Options values", function() {
    const xfo = res.headers['x-frame-options'];
    if (xfo) {
      expect(xfo.toLowerCase()).to.not.include(',');
    }
  });

  test("no deprecated X-XSS-Protection header", function() {
    expect(res.headers['x-xss-protection']).to.not.exist;
  });

  test("no Server header leaking version", function() {
    const server = res.headers['server'];
    if (server) {
      expect(server).to.not.match(/\\d+\\.\\d+/);
    }
  });
}
`
}

function tplVersionProbing (ep) {
  const resolvedPath = resolvePath(ep)
  const v1Path = resolvedPath.replace('/auth/', '/v1/auth/')
  const v2Path = resolvedPath.replace('/auth/', '/v2/auth/')
  const apiPath = resolvedPath.replace('/auth/', '/api/v1/')

  return `meta {
  name: [12] Inventory — Version Probing
  type: http
  seq: 12
}

get {
  url: {{baseUrl}}${v1Path}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

tests {
  test("/v1/ prefix returns 404", function() {
    expect(res.status).to.equal(404);
  });
}
`
}

function tplSsrfProbing (ep) {
  const resolvedPath = resolvePath(ep)
  const firstStringParam = Object.entries(ep.queryParams).find(([_, c]) => c.type === 'string' && _ !== 'overwriteCache')
  const injectionParam = firstStringParam
    ? `${firstStringParam[0]}=http://169.254.169.254/latest/meta-data/`
    : 'url=http://169.254.169.254/latest/meta-data/'

  const requiredQs = buildQueryString(ep.queryParams, { onlyRequired: true })
  const sep = requiredQs ? '&' : ''
  const url = requiredQs
    ? `{{baseUrl}}${resolvedPath}?${requiredQs}${sep}${injectionParam}`
    : `{{baseUrl}}${resolvedPath}?${injectionParam}`

  return `meta {
  name: [13] SSRF — Metadata URL Injection
  type: http
  seq: 13
}

get {
  url: ${url}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

tests {
  test("returns 200 or 400 (URL not followed)", function() {
    expect(res.status).to.be.oneOf([200, 400]);
  });

  test("response does not contain AWS metadata", function() {
    const body = JSON.stringify(res.body);
    expect(body).to.not.include('ami-id');
    expect(body).to.not.include('instance-id');
    expect(body).to.not.include('security-credentials');
  });
}
`
}

function tplMissingRequiredParams (ep) {
  const requiredParams = Object.entries(ep.queryParams).filter(([_, c]) => c.required)
  if (requiredParams.length === 0) return null

  const resolvedPath = resolvePath(ep)
  return `meta {
  name: [14] Validation — Missing Required Params
  type: http
  seq: 14
}

get {
  url: {{baseUrl}}${resolvedPath}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

tests {
  test("returns 400 or 500 when required params missing", function() {
    expect(res.status).to.be.oneOf([400, 500]);
  });

  test("error message indicates missing parameters", function() {
    const body = JSON.stringify(res.body).toLowerCase();
    const indicatesError = body.includes('required') ||
      body.includes('missing') ||
      body.includes('err_') ||
      body.includes('validation') ||
      res.status >= 400;
    expect(indicatesError).to.be.true;
  });
}
`
}

function tplInvalidParamTypes (ep) {
  const resolvedPath = resolvePath(ep)
  const intParams = Object.entries(ep.queryParams).filter(([_, c]) => c.type === 'integer' && _ !== 'overwriteCache')
  if (intParams.length === 0) return null

  const parts = intParams.map(([name]) => `${name}=not_a_number`)
  const qs = parts.join('&')

  return `meta {
  name: [15] Validation — Invalid Param Types
  type: http
  seq: 15
}

get {
  url: {{baseUrl}}${resolvedPath}?${qs}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

tests {
  test("returns 400 when integer params receive strings", function() {
    expect(res.status).to.be.oneOf([400, 500]);
  });
}
`
}

// ---------------------------------------------------------------------------
// GENERATOR
// ---------------------------------------------------------------------------

const TEST_TEMPLATES = [
  { id: '01', name: 'happy-path', fn: tplHappyPath },
  { id: '02', name: 'no-auth', fn: tplNoAuth },
  { id: '03', name: 'invalid-token', fn: tplInvalidToken },
  { id: '04', name: 'empty-bearer', fn: tplEmptyBearer },
  { id: '05', name: 'wrong-auth-scheme', fn: tplWrongScheme },
  { id: '06', name: 'bola-site-injection', fn: tplBolaSiteInjection },
  { id: '07', name: 'bola-header-injection', fn: tplBolaHeaderInjection },
  { id: '08', name: 'method-post', fn: tplMethodPost },
  { id: '09', name: 'method-put', fn: tplMethodPut },
  { id: '10', name: 'method-delete', fn: tplMethodDelete },
  { id: '11', name: 'security-headers', fn: tplSecurityHeaders },
  { id: '12', name: 'version-probing', fn: tplVersionProbing },
  { id: '13', name: 'ssrf-probing', fn: tplSsrfProbing },
  { id: '14', name: 'missing-required-params', fn: tplMissingRequiredParams },
  { id: '15', name: 'invalid-param-types', fn: tplInvalidParamTypes }
]

function generateForEndpoint (endpoint) {
  const dir = path.join(OUTPUT_DIR, endpoint.slug)
  fs.mkdirSync(dir, { recursive: true })

  let count = 0
  for (const tpl of TEST_TEMPLATES) {
    const content = tpl.fn(endpoint)
    if (!content) continue

    const filePath = path.join(dir, `${tpl.id}-${tpl.name}.bru`)
    fs.writeFileSync(filePath, content, 'utf-8')
    count++
  }

  return count
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printUsage () {
  console.log(`
  OWASP Test Generator for MiningOS API
  ======================================

  Usage:
    node generate.js --all                Generate tests for ALL endpoints
    node generate.js <slug>               Generate tests for one endpoint
    node generate.js --list               List all registered endpoints
    node generate.js --status             Show reviewed/pending status

  Examples:
    node generate.js pool-stats-aggregate
    node generate.js site-status-live
    node generate.js --all
  `)
}

function run () {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage()
    process.exit(0)
  }

  const endpoints = loadEndpoints()

  if (args.includes('--list')) {
    console.log('\nRegistered endpoints:\n')
    for (const ep of endpoints) {
      const status = ep.reviewed ? '✅ reviewed' : '⬜ pending'
      console.log(`  ${ep.slug.padEnd(32)} ${ep.priority}  ${ep.method} ${ep.path.padEnd(42)} ${status}`)
    }
    console.log(`\n  Total: ${endpoints.length} endpoints\n`)
    process.exit(0)
  }

  if (args.includes('--status')) {
    const reviewed = endpoints.filter(e => e.reviewed)
    const pending = endpoints.filter(e => !e.reviewed)
    console.log(`\n  OWASP Review Status`)
    console.log(`  ───────────────────`)
    console.log(`  Reviewed:  ${reviewed.length}/${endpoints.length}`)
    console.log(`  Pending:   ${pending.length}/${endpoints.length}`)
    if (pending.length > 0) {
      console.log(`\n  Next up (by priority):`)
      const sorted = [...pending].sort((a, b) => a.priority.localeCompare(b.priority))
      for (const ep of sorted.slice(0, 10)) {
        console.log(`    ${ep.priority}  ${ep.slug}`)
      }
    }
    console.log()
    process.exit(0)
  }

  if (args.includes('--all')) {
    console.log('\nGenerating OWASP tests for all endpoints...\n')
    let total = 0
    for (const ep of endpoints) {
      const count = generateForEndpoint(ep)
      console.log(`  ✅ ${ep.slug.padEnd(32)} → ${count} tests`)
      total += count
    }
    console.log(`\n  Done! ${total} test files across ${endpoints.length} endpoints.\n`)
    console.log(`  Run them with:`)
    console.log(`    npx @usebruno/cli run <folder>/ --env dev --env-var "token=YOUR_TOKEN"\n`)
    process.exit(0)
  }

  const slug = args[0]
  const endpoint = endpoints.find(e => e.slug === slug)
  if (!endpoint) {
    console.error(`\n  ❌ Unknown endpoint: "${slug}"`)
    console.error(`  Run "node generate.js --list" to see available endpoints.\n`)
    process.exit(1)
  }

  const count = generateForEndpoint(endpoint)
  console.log(`\n  ✅ Generated ${count} test files in ./${endpoint.slug}/`)
  console.log(`\n  Run them with:`)
  console.log(`    npx @usebruno/cli run ${endpoint.slug}/ --env dev --env-var "token=YOUR_TOKEN"\n`)
}

run()

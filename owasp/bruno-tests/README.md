# MiningOS OWASP API Security Tests

Automated OWASP API Security Top 10 (2023) test suite for all 29 MiningOS v2 endpoints, built with [Bruno](https://www.usebruno.com/).

## Prerequisites

- Node.js 18+
- A valid Bearer token for the target environment
- (Optional) Bruno desktop app for GUI-based testing

## Quick Start

```bash
# Generate test files for all endpoints (already generated, re-run after editing templates)
node generate.cjs --all

# Run tests for a single endpoint
npx @usebruno/cli run pool-stats-aggregate/ --env dev --env-var "token=YOUR_TOKEN"

# Run ALL endpoint suites
OWASP_TOKEN='YOUR_TOKEN' ./run.sh

# Run a specific endpoint via the runner
OWASP_TOKEN='YOUR_TOKEN' ./run.sh pool-stats-aggregate

# Use staging environment
OWASP_TOKEN='YOUR_TOKEN' OWASP_ENV=staging ./run.sh
```

## Structure

```
bruno-tests/
├── bruno.json                    # Bruno collection config
├── collection.bru                # Collection-level defaults (headers)
├── generate.cjs                  # Test generator — 15 OWASP templates
├── endpoints.json                # Registry of all 29 endpoints
├── run.sh                        # Convenience runner (all or single endpoint)
├── environments/
│   ├── dev.bru                   # https://dev-moria.tether.to
│   └── staging.bru               # https://staging-moria.tether.to
├── site-status-live/             # Generated .bru test files
├── pool-stats-aggregate/
├── alerts-history/
│   ... (29 endpoint folders)
```

## Generator CLI

```bash
node generate.cjs --all                # Generate tests for ALL endpoints
node generate.cjs <slug>               # Generate tests for one endpoint
node generate.cjs --list               # List all 29 registered endpoints
node generate.cjs --status             # Show reviewed vs pending count
```

`--status` prioritizes by P0/P1/P2 so you know which endpoint to review next.

## Tests Per Endpoint

Each endpoint gets 13–15 `.bru` test files covering the OWASP API Top 10:

| File | What it tests | OWASP # |
|---|---|---|
| `01-happy-path.bru` | Valid request → 200, response shape, timing | Baseline |
| `02-no-auth.bru` | No Authorization header → 401 | #2 Broken Auth |
| `03-invalid-token.bru` | Malformed JWT → 401 | #2 Broken Auth |
| `04-empty-bearer.bru` | `Bearer` with no token → 401 | #2 Broken Auth |
| `05-wrong-auth-scheme.bru` | `Basic` instead of `Bearer` → 401 | #2 Broken Auth |
| `06-bola-site-injection.bru` | `?siteId=999` → ignored | #1 BOLA |
| `07-bola-header-injection.bru` | `X-Site-Id` / `X-Forwarded-*` → ignored | #1 BOLA |
| `08-method-post.bru` | POST on GET-only route → 404 | #3 / #5 Auth |
| `09-method-put.bru` | PUT → 404 | #3 / #5 Auth |
| `10-method-delete.bru` | DELETE → 404 | #3 / #5 Auth |
| `11-security-headers.bru` | Cache-Control, HSTS, nosniff, etc. (8 checks) | #8 Misconfig |
| `12-version-probing.bru` | `/v1/...` prefix → 404 | #9 Inventory |
| `13-ssrf-probing.bru` | AWS metadata URL in params → not followed | #7 SSRF |
| `14-missing-required-params.bru` | Omit required params → 400 | #4 Resources |
| `15-invalid-param-types.bru` | Strings where integers expected → 400 | #4 Resources |

Tests 14 and 15 are only generated for endpoints that have required or integer parameters.

## Environment Variables

Defined in `environments/dev.bru` and `environments/staging.bru`:

| Variable | Description | Secret |
|---|---|---|
| `baseUrl` | API base URL | No |
| `token` | Bearer auth token | **Yes** |
| `startTs` | Example start timestamp (Unix ms) | No |
| `endTs` | Example end timestamp (Unix ms) | No |
| `containerId` | Example container ID for path params | No |
| `cabinetId` | Example cabinet ID for path params | No |
| `poolName` | Example pool name for path params | No |

Secret variables are not stored in the `.bru` file — set them via CLI (`--env-var`) or in the Bruno GUI secrets tab.

## Using the Bruno GUI

1. Open Bruno desktop app
2. **Open Collection** → select the `owasp/bruno-tests/` folder
3. All 29 endpoint folders appear in the sidebar
4. Select environment (`dev` or `staging`) from the dropdown
5. Go to **Environments** → click the lock icon → enter your `token`
6. Click any request to run it, or right-click a folder → **Run Folder**

## Adding a New Endpoint

1. Add the endpoint definition to `endpoints.json`:

```json
{
  "slug": "my-new-endpoint",
  "method": "GET",
  "path": "/auth/my-new-endpoint",
  "priority": "P1",
  "description": "What this endpoint does",
  "queryParams": {
    "start": { "type": "integer", "required": true, "bruValue": "{{startTs}}" },
    "end": { "type": "integer", "required": true, "bruValue": "{{endTs}}" },
    "overwriteCache": { "type": "boolean", "required": false, "bruValue": "false" }
  },
  "pathParams": {},
  "expectedResponseKeys": ["data", "summary"],
  "reviewed": false
}
```

2. Generate the tests:

```bash
node generate.cjs my-new-endpoint
```

3. Run them:

```bash
npx @usebruno/cli run my-new-endpoint/ --env dev --env-var "token=YOUR_TOKEN"
```

For endpoints with path parameters (e.g., `/auth/containers/:id/telemetry`), use `pathParams` to map to environment variables:

```json
{
  "path": "/auth/containers/:id/telemetry",
  "pathParams": {
    ":id": "{{containerId}}"
  }
}
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Generate OWASP Tests
  run: node owasp/bruno-tests/generate.cjs --all

- name: Run OWASP Tests
  working-directory: owasp/bruno-tests
  run: |
    npx @usebruno/cli run . --env dev \
      --env-var "token=${{ secrets.OWASP_TEST_TOKEN }}" \
      --format junit \
      --output ../../owasp-results.xml

- name: Upload Results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: owasp-results
    path: owasp-results.xml
```

### Manual JUnit Report

```bash
npx @usebruno/cli run pool-stats-aggregate/ \
  --env dev \
  --env-var "token=YOUR_TOKEN" \
  --format junit \
  --output results.xml
```

## Review Workflow

1. Check what's next: `node generate.cjs --status`
2. Run the auto-generated tests for that endpoint
3. Analyze failures and inspect the backend code in `../miningos-app-node`
4. Write a detailed OWASP review `.md` in the `owasp/` folder (see existing reviews as templates)
5. Mark `"reviewed": true` in `endpoints.json`
6. Add endpoint-specific tests if the auto-generated ones aren't sufficient

## Existing Reviews

| Endpoint | Review File |
|---|---|
| `GET /auth/site/status/live` | `owasp/owasp-site-status-live.md` |
| `GET /auth/pool-stats/aggregate` | `owasp/owasp-pool-stats-aggregate.md` |

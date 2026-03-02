#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV="${OWASP_ENV:-dev}"

if [ -z "${OWASP_TOKEN:-}" ]; then
  echo ""
  echo "  Error: OWASP_TOKEN environment variable is required."
  echo ""
  echo "  Usage:"
  echo "    OWASP_TOKEN='your-token' ./run.sh                     # run ALL endpoints"
  echo "    OWASP_TOKEN='your-token' ./run.sh pool-stats-aggregate # run one endpoint"
  echo "    OWASP_TOKEN='your-token' OWASP_ENV=staging ./run.sh    # use staging env"
  echo ""
  exit 1
fi

if [ $# -eq 0 ]; then
  echo ""
  echo "  Running OWASP tests for ALL endpoints (env: $ENV)..."
  echo ""

  PASS=0
  FAIL=0

  for dir in "$SCRIPT_DIR"/*/; do
    slug=$(basename "$dir")
    # Skip non-test directories
    [ "$slug" = "environments" ] && continue
    [ ! -f "$dir/01-happy-path.bru" ] && continue

    echo "  ─── $slug ───"
    if npx @usebruno/cli run "$dir" --env "$ENV" --env-var "token=$OWASP_TOKEN" 2>&1 | tail -5; then
      PASS=$((PASS + 1))
    else
      FAIL=$((FAIL + 1))
    fi
    echo ""
  done

  echo "  ════════════════════════════════"
  echo "  Suites passed: $PASS"
  echo "  Suites failed: $FAIL"
  echo "  ════════════════════════════════"
else
  SLUG="$1"
  DIR="$SCRIPT_DIR/$SLUG"

  if [ ! -d "$DIR" ]; then
    echo "  Error: No test suite found for '$SLUG'"
    echo "  Available suites:"
    for dir in "$SCRIPT_DIR"/*/; do
      slug=$(basename "$dir")
      [ "$slug" = "environments" ] && continue
      [ -f "$dir/01-happy-path.bru" ] && echo "    $slug"
    done
    exit 1
  fi

  echo ""
  echo "  Running OWASP tests for: $SLUG (env: $ENV)"
  echo ""
  npx @usebruno/cli run "$DIR" --env "$ENV" --env-var "token=$OWASP_TOKEN"
fi

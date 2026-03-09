# 80% Code Coverage Plan for `mos`

## Current State

| Metric | Value |
| --- | --- |
| Test files | 154 |
| Source files | ~1,160+ |
| Redux slices tested | 1 of 13 |
| Custom hooks tested | 16 of 72 |
| Coverage thresholds | **None configured** |
| Existing coverage report | **None** |

The project uses Vitest + `@vitest/coverage-v8` (already set up), but with no thresholds and poor `exclude` rules in `vitest.config.js`.

## Target Thresholds (matching `m-sdk-ui-dev-kit`)

```
lines: 80, statements: 80, functions: 79, branches: 75
```

## Key Insight: Fix Exclusions First

The biggest unlock is fixing `coverage.exclude` in `vitest.config.js`. Right now every barrel file, type file, mock data file, and router file inflates the denominator. Excluding non-logic files (as `m-sdk-ui-dev-kit` does) will realistically shift the baseline from ~30–40% to ~55–60% — meaning the remaining gap to 80% is achievable.

**Files to exclude:**

- `src/**/index.{ts,tsx}` — barrel re-exports, zero logic
- `src/types/**` — pure TypeScript declarations
- `src/mockdata/**` — demo/mock data
- `src/router/**` — route config, no logic
- `src/styles/**` — CSS
- `src/constants/**` — constant values (or test them cheaply)
- `src/App.tsx`, `src/index.tsx` — entry points
- `src/setupTests/**`

**Also add to `vitest.config.js` test config:**

```js
mockReset: true,
restoreMocks: true,
clearMocks: true,
```

## High-ROI Coverage Layers

The approach mirrors `m-sdk-ui-dev-kit`: test pure logic layers exhaustively. Each layer below is ordered by ROI (most coverage gain per engineering day).

```
Infrastructure (config + baseline)
        │
        ├── Redux Slices (12 untested / 13 total)
        │
        ├── Utils gap fill (src/app/utils/)
        │
        └── Business Hooks (56 untested / 72 total)
                │
                └── Views business logic (Financial, Reports, Dashboard)
                        │
                        └── Component helpers (Explorer, Container, Inventory)
                                │
                                └── CI enforcement
```

---

### Layer 1: Infrastructure (1–2 days)

- Fix `coverage.exclude` in `vitest.config.js` (barrel files, types, mockdata, router, constants)
- Add `thresholds: { lines: 80, statements: 80, functions: 79, branches: 75 }`
- Add `lcov` to reporters (for CI tools)
- Add `mockReset`, `restoreMocks`, `clearMocks: true`
- Run `npm run test:coverage` to produce a baseline HTML report
- Triage: identify top 20 files by uncovered lines

### Layer 2: Redux Slices (3 days)

12 slices in `src/app/slices/` are untested: `authSlice`, `devicesSlice`, `minersSlice`, `multiSiteSlice`, `notificationSlice`, `pduSlice`, `themeSlice`, `timezoneSlice`, `userInfoSlice`, `appSidebarSlice`, `actionsSidebarSlice`. Only `actionsSlice` has a test.

**Pattern (from `m-sdk-ui-dev-kit` `auth-slice.test.ts`):**

- Test initial state
- Test each action/reducer with valid and edge-case inputs
- Test state immutability
- Test selectors independently

Each slice test file is ~80–120 lines. At ~1.5 hours per slice, this is a ~3-day task. High ROI because slice logic is dense with branches.

### Layer 3: Utility Gap Fill (3 days)

`src/app/utils/` has 49 files, ~33 already tested. The 16 remaining (e.g. `powerConsumptionUtils`, `costDataUtils` if not fully covered) plus **branch coverage gaps in existing tests** (error paths, null inputs, edge cases) are the target. Follow the same exhaustive branch-per-`it` pattern as `auth-utils.test.ts`.

### Layer 4: Business Hook Coverage (5 days)

72 hooks in `src/hooks/`, only 16 tested. Priority order:

- **Data-fetching/calculation hooks:** `useHashCostData`, `useCostData`, `useRevenueData`, `useEnergyCostData`, `useOperationsDashboardData`, `useSiteOverviewDetailsData`, etc.
- **UI state hooks:** `useWindowSize`, `useTableDateRange`, `useDeviceResolution`, etc.
- **Permission/auth hooks**

**Pattern (from `m-sdk-ui-dev-kit` `use-permissions.test.ts`):**

- Mock `useSelector`/RTK Query selectors with `vi.mock`
- Test the hook's data transformation logic, not the Redux internals
- Test memoization with `rerender()`
- Test error/null states explicitly

This is the single highest-impact task — hooks contain most of the application's business logic.

### Layer 5: Views Business Logic (3 days)

`src/Views/Financial/` and `src/Views/Reports/` have many helper/hook files. Some are tested (Revenue Summary, HashBalance), others are not. Focus on:

- Untested `helpers.ts` / `utils.ts` files under Views
- Hooks under `src/Views/Dashboard/`, `src/Views/Container/`, `src/Views/Alerts/`

### Layer 6: Component Helper Functions (2 days)

`src/Components/` has ~605 files but most are rendering — skip those. Target only the co-located `*.utils.ts`, `*.helper.ts`, and `*.helpers.ts` files that contain pure logic and are currently uncovered after the baseline report.

### Layer 7: CI Enforcement (1 day)

Add `npm run test:coverage` to the CI pipeline so the `thresholds` in `vitest.config.js` are enforced on every PR. Vitest exits non-zero when thresholds fail, so no additional tooling is needed.

---

## Asana Tasks to Create

Ordered by priority:

1. **[Coverage] Configure vitest coverage thresholds and exclusions** *(1–2 days)*
   - Fix `vitest.config.js` excludes, add thresholds, add lcov reporter, add mock cleanup flags

2. **[Coverage] Run baseline coverage report and triage gaps** *(1 day)*
   - Produce first HTML/LCOV report, document top 20 uncovered files by lines, share with team

3. **[Tests] Add tests for all 12 untested Redux slices** *(3 days)*
   - `src/app/slices/` — one test file per slice, covering reducers, actions, selectors, immutability

4. **[Tests] Fill branch coverage gaps in `src/app/utils/`** *(3 days)*
   - Add error-path, null-input, and edge-case tests to existing util test files; add missing utils

5. **[Tests] Add hook tests: data-fetching and calculation hooks** *(3 days)*
   - Priority: `useHashCostData`, `useCostData`, `useRevenueData`, `useOperationsDashboardData`, `useEnergyCostData`, `useSitesOverviewData`, `useSiteOverviewDetailsData`

6. **[Tests] Add hook tests: UI state and utility hooks** *(2 days)*
   - `useWindowSize`, `useTableDateRange`, `useDeviceResolution`, `useGetListThingsPaginated`, remaining hooks

7. **[Tests] Add business logic tests for Financial view helpers** *(2 days)*
   - `src/Views/Financial/` helpers and hooks not currently covered after baseline

8. **[Tests] Add business logic tests for Reports and Dashboard helpers** *(2 days)*
   - `src/Views/Reports/`, `src/Views/Dashboard/`, `src/Views/Container/` uncovered helpers

9. **[Tests] Add helper/util tests for uncovered Component files** *(2 days)*
   - Only `*.utils.ts`/`*.helper.ts` files under `src/Components/` identified by baseline report as gaps

10. **[CI] Enforce coverage threshold in CI pipeline** *(1 day)*
    - Add `test:coverage` step to CI; pipeline fails if thresholds not met

---

## Timeline Estimate

| Phase | Tasks | Days |
| --- | --- | --- |
| Sprint 1 | Config + Baseline + Slices | 7 |
| Sprint 2 | Utils + Hooks (data) | 6 |
| Sprint 3 | Hooks (UI) + Views | 6 |
| Sprint 4 | Components + CI | 3 |
| **Total** | | **~22 engineering days** |

For one developer this is roughly **4–5 weeks**. For two developers working in parallel on hooks vs. utils, this compresses to **~2.5–3 weeks**.

---

## What NOT to Test (to stay realistic)

- Component rendering (no value for coverage ROI vs. effort)
- RTK Query endpoint definitions (they're config, not logic)
- `src/constants/` files unless they contain computed values/logic
- Entry points (`App.tsx`, `index.tsx`)
- Styled-components theme tokens

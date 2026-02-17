# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-17

### Added
- Operations Dashboard with comprehensive charts for monitoring mining operations
- Operations Efficiency reporting with three views: site, miner type, and miner unit
- Reporting Tool layout and navigation structure
- Balance Report with interactive charts and data tables
- Storybook stories for multiple components (Card, DoughnutChart, Farm, LineChart, Logs, Miners, Sidebar)
- Multi-site charts: Average Fees, BTC Network Hashprice, Hashprice, Network Hashrate, Power, Production Cost Price, Revenue, Site Energy vs Cost, Site Hash Revenue, Subsidy Fees, Threshold Bar Chart
- Report Time Frame Selector component for flexible date range selection

### Fixed
- Alerts: Critical load enhancement based on query parameters (#24)
- Paginated hooks: Ensure query changes trigger data re-fetch (#23)
- Operations energy report: Correct miner type and unit chart calculations (#21)
- Infinite loops in various components preventing proper rendering (#20, #14)
- Page reload: Prevent premature redirects during permission loading (#18)
- Power mode calculations: Correct miner type and mining unit power summary in operations reports (#13)
- Comment modal: Fix button wrapping issue when clicked (#11)

### Improved
- Timezone handling across the entire application for consistent time display (#12)
- Header stats: Now displays total miners amount for better visibility (#17)
- Test coverage: Added comprehensive test suites for multiple components and utilities
- Type safety: Enhanced TypeScript definitions across the codebase

### Changed
- Updated React to v19.0.0 for improved performance
- Upgraded Vite to v7.3.1 for faster build times
- Updated multiple dependencies for security and performance improvements

[1.0.0]: https://github.com/your-org/miningos-app-ui/releases/tag/v1.0.0

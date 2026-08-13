/**
 * Sidebar Configuration - Barrel Export
 *
 * This file serves as the main entry point for sidebar configuration.
 * It re-exports all necessary types, constants, and functions from the
 * organized configuration files.
 *
 * @see ./configs/singleSiteMenu.config.ts - Single-site menu configuration
 * @see ./configs/multiSiteMenu.builder.ts - Multi-site menu builder
 * @see ./Sidebar.constants.ts - Menu IDs, labels, and feature keys
 */

// Export types
export type { Site as MultiSiteNavigationSite } from './configs/multiSiteMenu.builder'
export type { SidebarItem } from './configs/singleSiteMenu.config'

// Export single-site menu configuration
export { SIDEBAR_MENU_ITEMS } from './configs/singleSiteMenu.config'

// Export multi-site menu builder
export { getMultiSiteNavigationList } from './configs/multiSiteMenu.builder'

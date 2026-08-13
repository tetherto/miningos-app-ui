import { describe, expect, it } from 'vitest'

import { MENU_IDS, MENU_LABELS } from '../Sidebar.constants'

import type { Site } from './multiSiteMenu.builder'
import { getMultiSiteNavigationList } from './multiSiteMenu.builder'

import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import { ROUTE } from '@/constants/routes'

describe('multiSiteMenu.builder', () => {
  describe('getMultiSiteNavigationList', () => {
    it('should return menu with "All Sites" and Settings when site list is empty', () => {
      const result = getMultiSiteNavigationList([])

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(MENU_IDS.MULTI_SITE_ALL_SITES)
      expect(result[0].label).toBe(MENU_LABELS.ALL_SITES)
      expect(result[1].id).toBe(MENU_IDS.SETTINGS)
      expect(result[1].label).toBe(MENU_LABELS.SETTINGS)
    })

    it('should create menu items for each site in the list', () => {
      const sites: Site[] = [
        { id: 'site-1', name: 'Site One' },
        { id: 'site-2', name: 'Site Two' },
        { id: 'site-3', name: 'Site Three' },
      ]

      const result = getMultiSiteNavigationList(sites)

      // Should have: All Sites + 3 sites + Settings = 5 items
      expect(result).toHaveLength(5)
      expect(result[0].id).toBe(MENU_IDS.MULTI_SITE_ALL_SITES)
      expect(result[1].id).toBe('site-1')
      expect(result[1].label).toBe('Site One')
      expect(result[2].id).toBe('site-2')
      expect(result[2].label).toBe('Site Two')
      expect(result[3].id).toBe('site-3')
      expect(result[3].label).toBe('Site Three')
      expect(result[4].id).toBe(MENU_IDS.SETTINGS)
    })

    it('should create correct "All Sites" menu structure', () => {
      const result = getMultiSiteNavigationList([])
      const allSitesMenu = result[0]

      expect(allSitesMenu.id).toBe(MENU_IDS.MULTI_SITE_ALL_SITES)
      expect(allSitesMenu.to).toBe(ROUTE.HOME)
      expect(allSitesMenu.label).toBe(MENU_LABELS.ALL_SITES)
      expect(allSitesMenu.icon).toBeDefined()
      expect(allSitesMenu.items).toBeDefined()
      expect(allSitesMenu.items).toHaveLength(4)

      // Check sub-items
      const items = allSitesMenu.items!
      expect(items[0].id).toBe(MENU_IDS.DASHBOARD)
      expect(items[0].to).toBe('/dashboard')
      expect(items[1].id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST)
      expect(items[2].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS)
      expect(items[3].id).toBe(MENU_IDS.MULTI_SITE_REPORTS)
    })

    it('should create correct Revenue and Cost submenu for "All Sites"', () => {
      const result = getMultiSiteNavigationList([])
      const allSitesMenu = result[0]
      const revenueAndCostMenu = allSitesMenu.items![1]

      expect(revenueAndCostMenu.id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST)
      expect(revenueAndCostMenu.label).toBe(MENU_LABELS.REVENUE_AND_COST)
      expect(revenueAndCostMenu.items).toHaveLength(3)

      const subItems = revenueAndCostMenu.items!
      expect(subItems[0].id).toBe(MENU_IDS.MULTI_SITE_REVENUE)
      expect(subItems[0].to).toBe('/revenue-and-cost/revenue')
      expect(subItems[1].id).toBe(MENU_IDS.MULTI_SITE_COST)
      expect(subItems[1].to).toBe('/revenue-and-cost/cost')
      expect(subItems[2].id).toBe(MENU_IDS.MULTI_SITE_COST_INPUT)
      expect(subItems[2].to).toBe('/revenue-and-cost/cost-input')
    })

    it('should create correct Operations submenu for "All Sites"', () => {
      const result = getMultiSiteNavigationList([])
      const allSitesMenu = result[0]
      const operationsMenu = allSitesMenu.items![2]

      expect(operationsMenu.id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS)
      expect(operationsMenu.label).toBe(MENU_LABELS.OPERATIONS_REPORTS)
      expect(operationsMenu.items).toHaveLength(5)

      const subItems = operationsMenu.items!
      expect(subItems[0].id).toBe(MENU_IDS.DASHBOARD)
      expect(subItems[0].to).toBe('/site-operations')
      expect(subItems[1].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_HASHRATE)
      expect(subItems[1].to).toBe('/site-operations/hashrate')
      expect(subItems[2].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_EFFICIENCY)
      expect(subItems[3].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_MINERS)
      expect(subItems[4].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_POWER_CONSUMPTION)
    })

    it('should create correct site-specific menu structure', () => {
      const sites: Site[] = [{ id: 'test-site', name: 'Test Site' }]
      const result = getMultiSiteNavigationList(sites)
      const siteMenu = result[1]

      expect(siteMenu.id).toBe('test-site')
      expect(siteMenu.to).toBe('/sites/test-site')
      expect(siteMenu.label).toBe('Test Site')
      expect(siteMenu.icon).toBeDefined()
      expect(siteMenu.items).toBeDefined()
      expect(siteMenu.items).toHaveLength(4)

      const items = siteMenu.items!
      expect(items[0].id).toBe(MENU_IDS.DASHBOARD)
      expect(items[0].to).toBe('/sites/test-site/dashboard')
      expect(items[1].id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST)
      expect(items[2].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS)
      expect(items[3].id).toBe(MENU_IDS.MULTI_SITE_REPORTS)
    })

    it('should create correct Revenue and Cost submenu for specific site', () => {
      const sites: Site[] = [{ id: 'site-1', name: 'Site 1' }]
      const result = getMultiSiteNavigationList(sites)
      const siteMenu = result[1]
      const revenueAndCostMenu = siteMenu.items![1]

      expect(revenueAndCostMenu.id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST)
      expect(revenueAndCostMenu.label).toBe(MENU_LABELS.REVENUE_AND_COST)
      expect(revenueAndCostMenu.items).toHaveLength(7)

      const subItems = revenueAndCostMenu.items!
      expect(subItems[0].id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST_EBITDA)
      expect(subItems[0].to).toBe('/sites/site-1/revenue-and-cost/ebitda')
      expect(subItems[0].label).toBe(MENU_LABELS.EBITDA)

      expect(subItems[1].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_EFFICIENCY)
      expect(subItems[1].to).toBe('/sites/site-1/revenue-and-cost/subsidy-fee')
      expect(subItems[1].label).toBe(MENU_LABELS.SUBSIDY_FEE_SHORT)

      expect(subItems[2].id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST_ENERGY_REVENUE)
      expect(subItems[2].to).toBe('/sites/site-1/revenue-and-cost/energy-revenue')

      expect(subItems[3].id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST_ENERGY_COST)
      expect(subItems[3].to).toBe('/sites/site-1/revenue-and-cost/energy-cost')

      expect(subItems[4].id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST_HASH_REVENUE)
      expect(subItems[4].to).toBe('/sites/site-1/revenue-and-cost/hash-revenue')

      expect(subItems[5].id).toBe(MENU_IDS.MULTI_SITE_REVENUE_AND_COST_HASH_COST)
      expect(subItems[5].to).toBe('/sites/site-1/revenue-and-cost/hash-cost')

      expect(subItems[6].id).toBe(MENU_IDS.MULTI_SITE_COST_INPUT)
      expect(subItems[6].to).toBe('/sites/site-1/revenue-and-cost/cost-input')
    })

    it('should create correct Operations submenu for specific site', () => {
      const sites: Site[] = [{ id: 'site-1', name: 'Site 1' }]
      const result = getMultiSiteNavigationList(sites)
      const siteMenu = result[1]
      const operationsMenu = siteMenu.items![2]

      expect(operationsMenu.id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS)
      expect(operationsMenu.label).toBe(MENU_LABELS.OPERATIONS_REPORTS)
      expect(operationsMenu.items).toHaveLength(5)

      const subItems = operationsMenu.items!
      expect(subItems[0].id).toBe(MENU_IDS.DASHBOARD)
      expect(subItems[0].to).toBe('/sites/site-1/site-operations')

      expect(subItems[1].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_HASHRATE)
      expect(subItems[1].to).toBe('/sites/site-1/site-operations/hashrate')

      expect(subItems[2].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_EFFICIENCY)
      expect(subItems[2].to).toBe('/sites/site-1/site-operations/efficiency')

      expect(subItems[3].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_WORKERS)
      expect(subItems[3].to).toBe('/sites/site-1/site-operations/miners')
      expect(subItems[3].label).toBe(MENU_LABELS.WORKERS)

      expect(subItems[4].id).toBe(MENU_IDS.MULTI_SITE_OPERATIONS_POWER_CONSUMPTION)
      expect(subItems[4].to).toBe('/sites/site-1/site-operations/power-consumption')
    })

    it('should create correct Settings menu with permissions', () => {
      const result = getMultiSiteNavigationList([])
      const settingsMenu = result[result.length - 1]

      expect(settingsMenu.id).toBe(MENU_IDS.SETTINGS)
      expect(settingsMenu.to).toBe(ROUTE.SETTINGS)
      expect(settingsMenu.label).toBe(MENU_LABELS.SETTINGS)
      expect(settingsMenu.icon).toBeDefined()
      expect(settingsMenu.authPermKey).toEqual({
        perm: `${AUTH_PERMISSIONS.USERS}:${AUTH_LEVELS.READ}`,
      })
      expect(settingsMenu.items).toHaveLength(1)
      expect(settingsMenu.items![0].id).toBe(MENU_IDS.MULTI_SITE_SETTINGS_USERS)
      expect(settingsMenu.items![0].to).toBe(ROUTE.SETTINGS)
      expect(settingsMenu.items![0].label).toBe(MENU_LABELS.USER_MANAGEMENT)
    })

    it('should handle sites with additional properties', () => {
      const sites: Site[] = [
        {
          id: 'site-1',
          name: 'Site One',
          location: 'USA',
          capacity: 100,
          active: true,
        },
      ]

      const result = getMultiSiteNavigationList(sites)

      expect(result).toHaveLength(3) // All Sites + 1 site + Settings
      expect(result[1].id).toBe('site-1')
      expect(result[1].label).toBe('Site One')
    })

    it('should generate unique routes for multiple sites', () => {
      const sites: Site[] = [
        { id: 'site-a', name: 'Site A' },
        { id: 'site-b', name: 'Site B' },
      ]

      const result = getMultiSiteNavigationList(sites)

      const siteAMenu = result[1]
      const siteBMenu = result[2]

      expect(siteAMenu.to).toBe('/sites/site-a')
      expect(siteBMenu.to).toBe('/sites/site-b')

      expect(siteAMenu.items![0].to).toBe('/sites/site-a/dashboard')
      expect(siteBMenu.items![0].to).toBe('/sites/site-b/dashboard')

      expect(siteAMenu.items![3].to).toBe('/sites/site-a/site-reports')
      expect(siteBMenu.items![3].to).toBe('/sites/site-b/site-reports')
    })

    it('should maintain correct order: All Sites, then sites, then Settings', () => {
      const sites: Site[] = [
        { id: 'site-3', name: 'Site 3' },
        { id: 'site-1', name: 'Site 1' },
        { id: 'site-2', name: 'Site 2' },
      ]

      const result = getMultiSiteNavigationList(sites)

      expect(result).toHaveLength(5)
      expect(result[0].id).toBe(MENU_IDS.MULTI_SITE_ALL_SITES)
      expect(result[1].id).toBe('site-3')
      expect(result[2].id).toBe('site-1')
      expect(result[3].id).toBe('site-2')
      expect(result[4].id).toBe(MENU_IDS.SETTINGS)
    })

    it('should create Reports menu item for each site', () => {
      const sites: Site[] = [{ id: 'site-1', name: 'Site 1' }]
      const result = getMultiSiteNavigationList(sites)
      const siteMenu = result[1]
      const reportsMenu = siteMenu.items![3]

      expect(reportsMenu.id).toBe(MENU_IDS.MULTI_SITE_REPORTS)
      expect(reportsMenu.to).toBe('/sites/site-1/site-reports')
      expect(reportsMenu.label).toBe(MENU_LABELS.REPORTS)
    })

    it('should handle site IDs with special characters', () => {
      const sites: Site[] = [
        { id: 'site-123-abc', name: 'Special Site' },
        { id: 'site_with_underscores', name: 'Underscore Site' },
      ]

      const result = getMultiSiteNavigationList(sites)

      expect(result[1].to).toBe('/sites/site-123-abc')
      expect(result[2].to).toBe('/sites/site_with_underscores')
      expect(result[1].items![0].to).toBe('/sites/site-123-abc/dashboard')
      expect(result[2].items![0].to).toBe('/sites/site_with_underscores/dashboard')
    })
  })
})

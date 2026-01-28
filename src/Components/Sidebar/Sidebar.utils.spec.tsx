import { filterMenuItems, isPathActiveForItem } from './Sidebar.utils'

/**
 * @type {import('./Sidebar.config').SidebarItem[]}
 */
const ALL_ITEMS = [
  {
    id: 'a',
    featConfigKey: 'A',
  },
  {
    id: 'b',
    authPermKey: 'B',
    featFlagKey: 'B',
  },
  {
    id: 'c',
    items: [
      {
        id: 'c.1',
      },
      {
        id: 'c.2',
        featConfigKey: 'C-2',
      },
      {
        id: 'c.3',
        items: [
          {
            id: 'c.3.1',
          },
          {
            id: 'c.3.2',
            authPermKey: 'C-3-2',
          },
          {
            id: 'c.3.3',
            featFlagKey: 'C-3-3',
          },
        ],
      },
    ],
  },
]

describe('Sidebar utils', () => {
  describe('filterMenuItems', () => {
    it('should return all menu items', () => {
      expect(
        filterMenuItems(ALL_ITEMS, {
          featureConfig: {
            A: true,
            'C-2': true,
          },
          featureFlags: {
            B: true,
            'C-3-3': true,
          },
          hasPerms: (key) =>
            ({
              B: true,
              'C-3-2': true,
            })[key] || false,
        }),
      ).toEqual(ALL_ITEMS)
    })

    it('should return few menu items based on config exceptions', () => {
      expect(
        filterMenuItems(ALL_ITEMS, {
          featureFlags: {
            B: true,
            'C-3-3': true,
          },
          hasPerms: (key) =>
            ({
              B: true,
              'C-3-2': true,
            })[key] || false,
        }),
      ).toEqual([
        {
          id: 'b',
          authPermKey: 'B',
          featFlagKey: 'B',
        },
        {
          id: 'c',
          items: [
            {
              id: 'c.1',
            },
            {
              id: 'c.3',
              items: [
                {
                  id: 'c.3.1',
                },
                {
                  id: 'c.3.2',
                  authPermKey: 'C-3-2',
                },
                {
                  id: 'c.3.3',
                  featFlagKey: 'C-3-3',
                },
              ],
            },
          ],
        },
      ])
    })

    it('should return few menu items based on flags exceptions', () => {
      expect(
        filterMenuItems(ALL_ITEMS, {
          featureConfig: {
            A: true,
            'C-2': true,
          },
          hasPerms: (key) =>
            ({
              'C-3-2': true,
            })[key] || false,
        }),
      ).toEqual([
        {
          id: 'a',
          featConfigKey: 'A',
        },
        {
          id: 'c',
          items: [
            {
              id: 'c.1',
            },
            {
              id: 'c.2',
              featConfigKey: 'C-2',
            },
            {
              id: 'c.3',
              items: [
                {
                  id: 'c.3.1',
                },
                {
                  id: 'c.3.2',
                  authPermKey: 'C-3-2',
                },
              ],
            },
          ],
        },
      ])
    })

    it('should return few menu items based on auth perms exceptions', () => {
      expect(
        filterMenuItems(ALL_ITEMS, {
          featureConfig: {
            A: true,
            'C-2': true,
          },
          featureFlags: {
            B: true,
            'C-3-3': true,
          },
          hasPerms: () => Boolean(false),
        }),
      ).toEqual([
        {
          id: 'a',
          featConfigKey: 'A',
        },
        {
          id: 'c',
          items: [
            {
              id: 'c.1',
            },
            {
              id: 'c.2',
              featConfigKey: 'C-2',
            },
            {
              id: 'c.3',
              items: [
                {
                  id: 'c.3.1',
                },
                {
                  id: 'c.3.3',
                  featFlagKey: 'C-3-3',
                },
              ],
            },
          ],
        },
      ])
    })
  })

  describe('isPathActiveForItem', () => {
    it('should return false when item has no "to" property', () => {
      const item = { id: 'test' }
      expect(isPathActiveForItem(item, '/dashboard')).toBe(false)
    })

    it('should return true when currentPath matches itemPath exactly', () => {
      const item = { to: '/dashboard' }
      expect(isPathActiveForItem(item, '/dashboard')).toBe(true)
    })

    it('should return true when currentPath matches itemPath with query params', () => {
      const item = { to: '/dashboard?foo=bar' }
      expect(isPathActiveForItem(item, '/dashboard')).toBe(true)
    })

    it('should return true when tab parameter matches', () => {
      const item = { to: '/settings?tab=profile' }
      expect(isPathActiveForItem(item, '/settings', 'profile')).toBe(true)
    })

    it('should return false when tab parameter does not match', () => {
      const item = { to: '/settings?tab=profile' }
      expect(isPathActiveForItem(item, '/settings', 'security')).toBe(false)
    })

    it('should return true when currentPath is a subpath of itemPath', () => {
      const item = { to: '/dashboard' }
      expect(isPathActiveForItem(item, '/dashboard/overview')).toBe(true)
    })

    it('should return false when paths are different', () => {
      const item = { to: '/dashboard' }
      expect(isPathActiveForItem(item, '/settings')).toBe(false)
    })

    it('should return true when nested item matches currentPath', () => {
      const item = {
        to: '/parent',
        items: [{ to: '/parent/child1' }, { to: '/parent/child2' }],
      }
      expect(isPathActiveForItem(item, '/parent/child2')).toBe(true)
    })

    it('should return false when no nested items match', () => {
      const item = {
        to: '/parent',
        items: [{ to: '/parent/child1' }, { to: '/parent/child2' }],
      }
      expect(isPathActiveForItem(item, '/other')).toBe(false)
    })

    it('should handle empty items array', () => {
      const item = {
        to: '/dashboard',
        items: [],
      }
      expect(isPathActiveForItem(item, '/settings')).toBe(false)
    })
  })
})

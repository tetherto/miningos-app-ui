import _clone from 'lodash/clone'
import _defaultTo from 'lodash/defaultTo'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _last from 'lodash/last'
import _reduce from 'lodash/reduce'
import _some from 'lodash/some'
import _split from 'lodash/split'
import _startsWith from 'lodash/startsWith'

import type { NavigationItem, SidebarItem } from './Sidebar.types'

interface ItemEnabledOptions {
  featureConfig?: Record<string, boolean>
  featureFlags?: Record<string, boolean>
  hasPerms: (key: string) => boolean
}

const isItemEnabled = (
  item: SidebarItem,
  { featureConfig, featureFlags, hasPerms }: ItemEnabledOptions,
): boolean => {
  const { authPermKey, featConfigKey, featFlagKey } = item

  if (authPermKey && !hasPerms(authPermKey)) {
    return false
  }

  if (featConfigKey && !featureConfig?.[featConfigKey]) {
    return false
  }

  if (featFlagKey && !featureFlags?.[featFlagKey]) {
    return false
  }

  return true
}

export const filterMenuItems = (items: SidebarItem[], options: ItemEnabledOptions): SidebarItem[] =>
  _reduce(
    items,
    (acc: SidebarItem[], item: SidebarItem) => {
      if (isItemEnabled(item, options)) {
        const newItem = _clone(item)

        if (_has(item, 'items')) {
          newItem.items = filterMenuItems(_get(item, 'items', []), options)
        }

        acc.push(newItem)
      }

      return acc
    },
    [] as SidebarItem[],
  )

export const isPathActiveForItem = (
  item: NavigationItem,
  currentPath: string,
  currentTab?: string | null,
  siblings?: NavigationItem[],
): boolean => {
  const itemTo = _get(item, 'to')
  if (_isEmpty(itemTo)) return false

  const itemPath = _defaultTo(_head(_split(itemTo, '?')), '')
  const itemChildren = _get(item, 'items', []) as NavigationItem[]

  if (_includes(itemTo, '?tab=')) {
    if (_isEmpty(currentTab)) return false

    const queryString = _defaultTo(_last(_split(itemTo, '?')), '')
    const url = new URLSearchParams(queryString)
    const toTab = url.get('tab')

    return itemPath === currentPath && toTab === currentTab
  }

  if (currentPath === itemPath) return true

  if (!_isEmpty(itemChildren)) {
    const hasActiveChild = _some(itemChildren, (child: NavigationItem) =>
      isPathActiveForItem(child, currentPath, currentTab, itemChildren),
    )
    if (hasActiveChild) return true

    return _startsWith(currentPath, `${itemPath}/`)
  }

  if (!_startsWith(currentPath, `${itemPath}/`)) return false

  if (!_isEmpty(siblings)) {
    const hasExactSiblingMatch = _some(siblings, (sibling: NavigationItem) => {
      if (sibling === item) return false

      const siblingTo = _get(sibling, 'to')

      if (_isEmpty(siblingTo)) return false

      const siblingPath = _defaultTo(_head(_split(siblingTo, '?')), '')

      return currentPath === siblingPath
    })

    if (hasExactSiblingMatch) return false
  }

  return true
}

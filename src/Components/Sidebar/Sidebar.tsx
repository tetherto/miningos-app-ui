import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import _map from 'lodash/map'
import type { ComponentType } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'

import { MenuItem } from './MenuItem/MenuItem'
import type { MultiSiteNavigationSite } from './Sidebar.config'
import { SIDEBAR_MENU_ITEMS, getMultiSiteNavigationList } from './Sidebar.config'
import { ExpandBtnContainer, MenuItems, SidebarContainer } from './Sidebar.styles'
import type { NavigationItem, SidebarItem } from './Sidebar.types'
import { filterMenuItems, isPathActiveForItem } from './Sidebar.utils'

import { useGetFeatureConfigQuery, useGetFeaturesQuery } from '@/app/services/api'
import { sidebarSlice } from '@/app/slices/appSidebarSlice'
import { TOGGLE_SIDEBAR, getHasSidebar } from '@/app/slices/themeSlice'
import { useHasPerms } from '@/hooks/useHasTokenPerms'

interface SidebarProps {
  isMobile: boolean
  siteList?: MultiSiteNavigationSite[]
  onToggle: VoidFunction
  isMultiSiteModeEnabled?: boolean
}

const Sidebar = ({
  isMobile,
  onToggle,
  siteList = [],
  isMultiSiteModeEnabled = false,
}: SidebarProps) => {
  const location = useLocation()
  const currentPath = location.pathname
  const currentTab = new URLSearchParams(location.search).get('tab')

  const dispatch = useDispatch()
  // sidebar id hidden by default in mobile version (screenSize < 768)
  const showSidebar = useSelector(getHasSidebar)
  const navigate = useNavigate()
  const { data: featureFlags } = useGetFeaturesQuery(undefined)
  const { data: featureConfig } = useGetFeatureConfigQuery(undefined)

  const hasPerms = useHasPerms()

  const isExpanded = useSelector(
    (state: unknown) => (state as { sidebar: { isExpanded: boolean } }).sidebar.isExpanded,
  )
  const shouldShowMenuItemsOnExpand =
    !isMultiSiteModeEnabled || (isMultiSiteModeEnabled && isExpanded)
  const shouldShowExpandedLabel = !isExpanded && isMultiSiteModeEnabled
  const { setSidebarState } = sidebarSlice.actions

  const handleExpandClick = () => {
    if (isMobile) {
      dispatch({ type: TOGGLE_SIDEBAR, payload: false })
      return
    }

    onToggle()
  }

  const rawMenuItems = isMultiSiteModeEnabled
    ? getMultiSiteNavigationList(siteList)
    : SIDEBAR_MENU_ITEMS

  const menuItems = filterMenuItems(rawMenuItems as unknown as SidebarItem[], {
    featureConfig: featureConfig as Record<string, boolean> | undefined,
    featureFlags: (featureFlags as Record<string, boolean>) || undefined,
    hasPerms,
  })

  useEffect(
    () => {
      if (isMobile) {
        // On mobile, always expand the sidebar content when visible
        dispatch(setSidebarState(true))
        // Hide the sidebar overlay if it's currently showing
        if (showSidebar) {
          dispatch({ type: TOGGLE_SIDEBAR, payload: false })
        }
      }
      // For desktop, the Redux persisted state will be used automatically
    },
    /* NOTE: there is a issue with resizing related to the library which
     * does not properly trigger the event in some case when resizing back and forth.
     * this is a workaround to force the sidebar to be hidden when resizing to mobile.
     * Do not add the showSidebar to the dependency array, because it would trigger whenever
     * the user tries to open it.
     */
    [isMobile],
  )

  interface MenuItem {
    to?: string
    id: string
    label: string
    icon?: ComponentType<{ color?: string }>
    items?: Array<{ to: string; label: string }>
    isActive?: boolean
    disabled?: boolean
    [key: string]: unknown
  }

  const handleItemClick = (item: { to: string }) => {
    const path = item.to.startsWith('/') ? item.to : '/' + item.to
    navigate(path)
  }

  return (
    <SidebarContainer $isExpanded={isExpanded} $showSidebar={showSidebar}>
      <ExpandBtnContainer
        $isExpanded={isExpanded}
        $showButton={!isMobile || showSidebar}
        onClick={handleExpandClick}
      >
        {isExpanded ? <LeftOutlined /> : <RightOutlined />}
      </ExpandBtnContainer>
      {shouldShowMenuItemsOnExpand && (
        <MenuItems>
          {_map(menuItems, (item: MenuItem) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              disabled={item.disabled}
              shouldShowExpandedLabel={shouldShowExpandedLabel}
              showLabel={isExpanded}
              isActive={isPathActiveForItem(
                item as NavigationItem,
                currentPath,
                currentTab,
                menuItems as NavigationItem[],
              )}
              items={item.items}
              isCollapsed={!isExpanded}
              isMobile={isMobile}
              currentPath={currentPath}
              currentTab={currentTab ?? ''}
              item={item}
              onClickItem={handleItemClick}
            />
          ))}
        </MenuItems>
      )}
    </SidebarContainer>
  )
}

export { Sidebar }

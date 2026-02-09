import { DownOutlined, UpOutlined } from '@ant-design/icons'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _lower from 'lodash/lowerCase'
import _map from 'lodash/map'
import { MouseEvent, useEffect, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'

import { isPathActiveForItem } from '../Sidebar.utils'

import {
  GroupContainer,
  GroupItems,
  GroupToggleIcon,
  Label,
  MenuItemContainer,
  MenuItemLabel,
  OverlayGroup,
} from './MenuItem.styles'

import Tooltip from '@/Components/Tooltip/Tooltip'
import { ROUTE } from '@/constants/routes'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

const DEFAULT_OVERLAY_POSITION = { top: 0, left: 0 }

export interface MenuSubItem {
  to: string
  label: string
  id?: string | number
  items?: MenuSubItem[] | null
  disabled?: boolean
  icon?: ComponentType<{ color?: string }> | null
}

interface MenuItemProps {
  label: string
  icon?: ComponentType<{ color?: string; isActive?: boolean }> | null
  showLabel?: boolean
  isActive?: boolean
  items?: MenuSubItem[] | null
  isSubLink?: boolean
  depth?: number
  isCollapsed?: boolean
  isMobile?: boolean
  disabled?: boolean
  shouldShowExpandedLabel?: boolean
  onClickItem: (item: { to: string }) => void
  onClose?: VoidFunction
  item: { to?: string }
  currentPath: string
  currentTab: string | null
}

const MenuItem = ({
  label,
  icon: Icon = null,
  showLabel = false,
  isActive = false,
  items = null,
  isSubLink = false,
  depth = 1,
  isCollapsed = false,
  isMobile = false,
  disabled = false,
  shouldShowExpandedLabel = false,
  onClickItem,
  onClose,
  item,
  currentPath,
  currentTab,
}: MenuItemProps) => {
  const hasSubgroup = !_isEmpty(items)
  const { isMultiSiteModeEnabled } = useMultiSiteMode()

  const [showSubgroup, setShowSubgroup] = useState(hasSubgroup && isActive)
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayPosition, setOverlayPosition] = useState(DEFAULT_OVERLAY_POSITION)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wasActive = useRef(isActive)
  const isOverContainer = useRef(false)
  const isOverOverlay = useRef(false)

  const handleGroupIconClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSubgroup(!showSubgroup)
  }

  useEffect(() => {
    if (hasSubgroup && isActive && !wasActive.current) {
      setShowSubgroup(true)
    }
    wasActive.current = isActive
  }, [hasSubgroup, isActive, currentPath])

  const handleContainerMouseEnter = () => {
    isOverContainer.current = true
    if (showLabel) return

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setOverlayPosition({
        top: rect.top,
        left: rect.right,
      })
    }

    setShowOverlay(true)
  }

  const handleContainerMouseLeave = () => {
    isOverContainer.current = false

    requestAnimationFrame(() => {
      if (!isOverContainer.current && !isOverOverlay.current) {
        setShowOverlay(false)
      }
    })
  }

  const handleOverlayMouseEnter = () => {
    isOverOverlay.current = true
  }

  const handleOverlayMouseLeave = () => {
    isOverOverlay.current = false
    requestAnimationFrame(() => {
      if (!isOverContainer.current && !isOverOverlay.current) {
        setShowOverlay(false)
      }
    })
  }

  const handleClick = () => {
    if (item?.to && !isActive) {
      onClickItem({ to: item.to })
      // Close sidebar on mobile when clicking a menu item without children
      if (isMobile && !hasSubgroup && onClose) {
        onClose()
      }
    }
  }

  const renderItem = (item: MenuSubItem, index: number) => {
    const displayLabel =
      shouldShowExpandedLabel && _includes(ROUTE.DASHBOARD, _lower(item.label))
        ? `${label} ${item.label}`
        : item.label

    const isItemActive = isPathActiveForItem(item, currentPath, currentTab, items ?? undefined)

    return (
      <MenuItem
        key={item.id || item.to || index}
        label={displayLabel}
        icon={item.icon}
        showLabel={showLabel}
        isActive={isItemActive && !item.disabled}
        isSubLink
        items={item.items}
        depth={depth + 1}
        item={item}
        disabled={item.disabled}
        isCollapsed={isCollapsed && !isItemActive}
        onClickItem={onClickItem}
        onClose={onClose}
        isMobile={isMobile}
        currentPath={currentPath}
        currentTab={currentTab}
      />
    )
  }

  if (!hasSubgroup) {
    const menuContent = (
      <MenuItemContainer
        $showLabel={showLabel}
        $isSubLink={isSubLink}
        $disabled={disabled}
        data-depth={depth}
        onClick={handleClick}
      >
        {Icon && !isMultiSiteModeEnabled && <Icon isActive={isActive && !disabled} />}
        {(showLabel || isSubLink) && (
          <MenuItemLabel $isActive={isActive} $disabled={disabled}>
            {label}
          </MenuItemLabel>
        )}
      </MenuItemContainer>
    )

    const shouldShowTooltip = isCollapsed && !isMobile && !showLabel && !isSubLink

    if (shouldShowTooltip) {
      return (
        <Tooltip content={label} placement="right" trigger="hover" delay={300} offset={12}>
          {menuContent}
        </Tooltip>
      )
    }

    return menuContent
  }

  return (
    <>
      <GroupContainer
        ref={containerRef}
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        <MenuItemContainer
          $showLabel={showLabel}
          $isActive={isActive}
          $disabled={disabled}
          data-depth={depth}
          onClick={handleClick}
        >
          {Icon && !isMultiSiteModeEnabled && <Icon isActive={isActive} />}
          {(showLabel || isSubLink) && <Label>{label}</Label>}
          {showLabel && (
            <GroupToggleIcon onClick={handleGroupIconClick}>
              {showSubgroup ? <UpOutlined /> : <DownOutlined />}
            </GroupToggleIcon>
          )}
        </MenuItemContainer>
        {showSubgroup && showLabel && <GroupItems>{_map(items, renderItem)}</GroupItems>}
      </GroupContainer>
      {showOverlay &&
        createPortal(
          <OverlayGroup
            onMouseEnter={handleOverlayMouseEnter}
            onMouseLeave={handleOverlayMouseLeave}
            style={{
              top: `${overlayPosition.top}px`,
              left: `${overlayPosition.left}px`,
            }}
          >
            {_map(items, renderItem)}
          </OverlayGroup>,
          document.body,
        )}
    </>
  )
}

export { MenuItem }

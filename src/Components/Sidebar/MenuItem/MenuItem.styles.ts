import styled, { css } from 'styled-components'

interface StyledProps {
  $isActive?: boolean
  $isSubLink?: boolean
  $showLabel?: boolean
  $disabled?: boolean
}

import { flexColumn, flexRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const MenuItemContainer = styled.div<StyledProps>`
  ${flexRow};
  background-color: transparent;
  color: ${({ $isActive, $isSubLink }) => {
    if ($isActive) return COLOR.COLD_ORANGE
    if ($isSubLink) return COLOR.LIGHT
    return COLOR.SIDEBAR_ITEM
  }};
  border: none;
  align-items: center;
  height: ${({ $isSubLink }) => ($isSubLink ? '32px' : '40px')};
  column-gap: 12px;
  font-weight: 600;
  font-size: 12px;
  justify-content: ${({ $showLabel, $isSubLink }) =>
    $showLabel || $isSubLink ? 'flex-start' : 'center'};
  width: 100%;
  min-width: ${({ $showLabel, $isSubLink }) => ($showLabel && !$isSubLink ? '190px' : 'auto')};
  padding: ${({ $showLabel, $isSubLink }) => {
    if (!$showLabel) return '0'
    return $isSubLink ? '8px 12px' : '5px 10px'
  }};
  box-sizing: border-box;
  cursor: pointer;
  &[data-depth] {
    width: 100%;
  }
  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`

export const MenuItemLabel = styled.div<StyledProps>`
  color: ${({ $isActive, $disabled }) => {
    if ($disabled) return COLOR.SIDEBAR_ITEM
    if ($isActive) return COLOR.COLD_ORANGE
    return COLOR.SIDEBAR_ITEM
  }};
`

export const GroupContainer = styled.div`
  ${flexColumn};
  align-items: flex-start;
  width: 100%;
  position: relative;
`

export const GroupToggleIcon = styled.div`
  cursor: pointer;
`

export const GroupItems = styled.div.attrs({
  className: 'sidebar-group-items',
})`
  ${flexColumn};
  margin-left: 12px;
  font-size: 12px;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 5px;

  .sidebar-group-items {
    margin-left: 8px;
  }
`

export const Label = styled.div`
  flex: 1;
  padding: 8px 0;
  white-space: nowrap;
`

export const OverlayGroup = styled.div`
  position: fixed;
  ${flexColumn};
  background: ${COLOR.DARK};
  border: 1px solid ${COLOR.COLD_ORANGE};
  width: 180px;
  padding: 5px 10px;
  z-index: 100;

  @media (max-height: 590px) {
    transform: translateY(-90%);
  }
`

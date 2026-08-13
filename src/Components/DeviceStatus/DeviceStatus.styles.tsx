import styled from 'styled-components'

import { flexCenterRow, flexColumn, flexRow } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

interface DeviceStatusRootProps {
  $row?: boolean
  $secondary?: boolean
}

interface DeviceStatusTitleProps {
  $secondary?: boolean
}

interface DeviceStatusTagProps {
  $fullWidthTag?: boolean
  $textColor?: string
}

export const DeviceStatusRoot = styled.div<DeviceStatusRootProps>`
  ${({ $row }) => ($row ? flexRow : '')}
  ${(props) =>
    props.$row
      ? `
    align-items: center;
    justify-content: space-between
  `
      : flexColumn};
  gap: 8px;
  font-size: ${({ $secondary }) => ($secondary ? '12px' : '14px')};
  font-weight: 400;
  line-height: normal;
  width: ${({ $secondary }) => ($secondary ? 'auto' : '100%')};
  flex-wrap: wrap;
`

export const DeviceStatusTitle = styled.span<DeviceStatusTitleProps>`
  color: ${({ $secondary }) => ($secondary ? COLOR.WHITE_ALPHA_05 : COLOR.WHITE)};
  font-size: ${({ $secondary }) => ($secondary ? 'inherit' : '18px')};
  text-wrap: nowrap;
`

export const DeviceStatusTag = styled.span<DeviceStatusTagProps>`
  ${flexCenterRow};
  padding: 4px 8px;
  ${(props) => {
    if (!props.$fullWidthTag) {
      return ''
    }

    return `
      width: 100%;
    `
  }}
  color: ${(props) => props.$textColor};
  background-color: ${(props) => props.$textColor}1A;
`

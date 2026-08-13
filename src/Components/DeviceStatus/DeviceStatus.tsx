import _isString from 'lodash/isString'
import { FC, PropsWithChildren } from 'react'

import { DeviceStatusRoot, DeviceStatusTag, DeviceStatusTitle } from './DeviceStatus.styles'

import { DeviceStatusColors, StatusLabelColors } from '@/Theme/GlobalColors'

interface DeviceStatusProps {
  status?: string
  title?: string
  fault?: string | boolean
  unavailable?: boolean
  isTagFullWidth?: boolean
  isRow?: boolean
  secondary?: boolean
}

export const DeviceStatus: FC<PropsWithChildren<DeviceStatusProps>> = ({
  status = '',
  title = '',
  fault,
  unavailable = false,
  isTagFullWidth = false,
  isRow = false,
  secondary = false,
  children,
}) => (
  <DeviceStatusRoot $row={isRow} $secondary={secondary}>
    {title && <DeviceStatusTitle $secondary={secondary}>{title}</DeviceStatusTitle>}
    <>
      {unavailable ? (
        'Unavailable'
      ) : (
        <>
          {status && (
            <DeviceStatusTag $fullWidthTag={isTagFullWidth} $textColor={DeviceStatusColors[status]}>
              {status}
            </DeviceStatusTag>
          )}
          {fault && _isString(fault) && (
            <DeviceStatusTag $fullWidthTag={isTagFullWidth} $textColor={StatusLabelColors[fault]}>
              {fault}
            </DeviceStatusTag>
          )}
        </>
      )}
      {children}
    </>
  </DeviceStatusRoot>
)

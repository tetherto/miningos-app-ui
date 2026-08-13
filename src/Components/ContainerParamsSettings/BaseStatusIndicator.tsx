import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { FC } from 'react'

import { StatusIndicator, NoFlashIcon, NoSoundIcon } from './EditableThresholdForm.styles'

/**
 * Base status indicator component
 * @param {Object} props
 * @param {boolean} props.isActive - Whether the indicator is active
 * @param {string} props.color - Color for the active indicator
 * @param {string} props.type - Type of indicator ('flash' or 'sound')
 * @returns {JSX.Element}
 */

interface BaseStatusIndicatorProps {
  isActive?: boolean
  color?: unknown
  type?: unknown
}

export const BaseStatusIndicator: FC<BaseStatusIndicatorProps> = ({ isActive, color, type }) => {
  if (isActive) {
    return (
      <StatusIndicator>
        <span style={{ color: color as string }}>
          <CheckOutlined />
        </span>
      </StatusIndicator>
    )
  }

  const IconWrapper = type === 'flash' ? NoFlashIcon : NoSoundIcon

  return (
    <StatusIndicator>
      <IconWrapper>
        <CloseOutlined />
      </IconWrapper>
    </StatusIndicator>
  )
}

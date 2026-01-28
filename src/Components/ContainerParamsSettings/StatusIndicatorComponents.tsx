import { FC } from 'react'

import { BaseStatusIndicator } from './BaseStatusIndicator'

/**
 * Flash status indicator component
 * @param {Object} props
 * @param {boolean} props.isFlashing - Whether the flash is active
 * @param {string} props.color - Color for the active flash indicator
 * @returns {JSX.Element}
 */

interface FlashStatusIndicatorProps {
  isFlashing?: unknown
  color?: unknown
}

export const FlashStatusIndicator: FC<FlashStatusIndicatorProps> = ({ isFlashing, color }) => (
  <BaseStatusIndicator isActive={isFlashing as boolean} color={color} type="flash" />
)

/**
 * Sound status indicator component
 * @param {Object} props
 * @param {boolean} props.isSuperflashing - Whether the sound is active
 * @param {string} props.color - Color for the active sound indicator
 * @returns {JSX.Element}
 */
export const SoundStatusIndicator = ({
  isSuperflashing,
  color,
}: {
  isSuperflashing: boolean
  color: string
}) => <BaseStatusIndicator isActive={isSuperflashing} color={color} type="sound" />

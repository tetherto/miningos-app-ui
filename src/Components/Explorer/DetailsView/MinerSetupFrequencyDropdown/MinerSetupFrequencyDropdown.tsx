import Dropdown from 'antd/es/dropdown'
import _map from 'lodash/map'
import _times from 'lodash/times'
import { FC } from 'react'

import { SecondaryButton } from '../../../../styles/shared-styles'

interface MinerSetupFrequencyDropdownProps {
  disabled?: boolean
  buttonText?: string
  onFrequencyToggle?: (frequency: string | number) => void
  selectedFrequency?: (string | number)[]
}

export const MinerSetupFrequencyDropdown: FC<MinerSetupFrequencyDropdownProps> = ({
  disabled,
  buttonText = '',
  onFrequencyToggle,
  selectedFrequency = [],
}) => {
  const handleDropdownFrequencyChange = (e: { key: string | number }) => {
    onFrequencyToggle?.(e.key)
  }

  const frequencyDropdownButtons = [
    {
      key: buttonText,
      type: 'group' as const,
      label: buttonText,
      children: _map(_times(10), (_, index) => ({
        key: String(index),
        label: `Frequency: ${index}`,
      })),
    },
  ]

  // Convert selectedFrequency to string[] for antd Dropdown
  const selectedKeysString = selectedFrequency.map((key) => String(key))

  return (
    <Dropdown
      disabled={disabled}
      menu={{
        items: frequencyDropdownButtons,
        selectable: true,
        onSelect: handleDropdownFrequencyChange,
        selectedKeys: selectedKeysString,
      }}
      placement="topLeft"
    >
      <SecondaryButton>{buttonText}</SecondaryButton>
    </Dropdown>
  )
}

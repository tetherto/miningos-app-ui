import { DownOutlined } from '@ant-design/icons'
import Dropdown from 'antd/es/dropdown'
import Tooltip from 'antd/es/tooltip'
import _filter from 'lodash/filter'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import { useState, FC } from 'react'

import { getSupportedPowerModes } from '../../../../app/utils/deviceUtils'
import { getDefaultSelectedPowerModes } from '../MinerControlsCard/MinerControlsCard.util'

import { DropdownButton } from './MinerPowerModeSelectionButtons.styles'

interface PowerModeSelectionDropdownProps {
  model?: string
  currentPowerModes?: Record<string, number>
  onPowerModeToggle?: (mode: string) => void
  buttonText?: string
  disabled?: boolean
}

export const PowerModeSelectionDropdown: FC<PowerModeSelectionDropdownProps> = ({
  model = '',
  currentPowerModes = {},
  onPowerModeToggle,
  buttonText = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedKeysRaw = currentPowerModes ? getDefaultSelectedPowerModes(currentPowerModes) : []
  // Convert to string[] - filter out undefined values
  const selectedKeys: string[] = _filter(selectedKeysRaw, (key): key is string => _isString(key))

  const powerModeDropdownButtons = _map(getSupportedPowerModes(model), (mode: string) => ({
    key: mode,
    label: currentPowerModes ? `${mode} (${currentPowerModes[mode] || 0})` : mode,
  })).filter(
    (item): item is { key: string; label: string } =>
      item.key !== undefined && item.label !== undefined,
  )

  const handleDropdownPowerModeChange = (e: { key: string }) => {
    onPowerModeToggle?.(e.key)
  }

  return (
    <Dropdown
      disabled={disabled}
      menu={{
        items: powerModeDropdownButtons,
        selectable: true,
        onSelect: handleDropdownPowerModeChange,
        selectedKeys,
      }}
      placement="topLeft"
      onOpenChange={setIsOpen}
    >
      {disabled ? (
        <Tooltip title={'Cannot change power mode while container is stopped.'}>
          <DropdownButton $disabled={disabled} $isOpen={isOpen}>
            <div>Set Power Mode</div>
            <DownOutlined />
          </DropdownButton>
        </Tooltip>
      ) : (
        <DropdownButton $disabled={disabled} $isOpen={isOpen}>
          <div>{buttonText}</div>
          <DownOutlined />
        </DropdownButton>
      )}
    </Dropdown>
  )
}

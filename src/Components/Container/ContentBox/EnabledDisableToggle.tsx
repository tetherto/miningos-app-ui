import Switch from 'antd/es/switch'
import Tooltip from 'antd/es/tooltip'
import _isBoolean from 'lodash/isBoolean'
import { FC } from 'react'

import { PrimaryButton, SecondaryButton } from '../../ActionsSidebar/ActionCard/ActionCard.styles'

import { EnabledDisableToggleWrapper, Toggle } from './ContentBox.styles'

type EnabledDisableToggleCbParams = Pick<EnabledDisableToggleProps, 'tankNumber'> & {
  isOn: boolean
}

export interface EnabledDisableToggleProps {
  value?: unknown
  tankNumber?: number | string
  isButtonDisabled?: boolean
  isOffline?: boolean
  onToggle?: (params: EnabledDisableToggleCbParams) => void
}

const EnabledDisableToggle: FC<EnabledDisableToggleProps> = ({
  value,
  tankNumber,
  isButtonDisabled,
  isOffline,
  onToggle,
}) => {
  const label = tankNumber ? `Tank ${tankNumber} Circulation` : 'Air Exhaust System'

  const handleToggle = (isOn: boolean) => {
    onToggle?.({ tankNumber, isOn })
  }

  return (
    <EnabledDisableToggleWrapper>
      <Tooltip title={isOffline && 'Container is offline'}>
        {_isBoolean(value) && (
          <Toggle>
            {label}
            <Switch disabled checked={value} />
          </Toggle>
        )}
        {(!value || !_isBoolean(value)) && (
          <PrimaryButton
            disabled={isOffline || isButtonDisabled}
            onClick={() => handleToggle(true)}
          >
            Enable {label}
          </PrimaryButton>
        )}
        {(value || !_isBoolean(value)) && (
          <SecondaryButton
            disabled={isOffline || isButtonDisabled}
            onClick={() => handleToggle(false)}
          >
            Disable {label}
          </SecondaryButton>
        )}
      </Tooltip>
    </EnabledDisableToggleWrapper>
  )
}

export default EnabledDisableToggle

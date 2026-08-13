import Popconfirm from 'antd/es/popconfirm'
import Tooltip from 'antd/es/tooltip'
import { FC, ReactNode } from 'react'

import { DangerButton, PrimaryButton } from '../ActionsSidebar/ActionCard/ActionCard.styles'

interface ConfirmationProps {
  title?: string
  description?: ReactNode
  icon?: ReactNode
  onConfirm?: () => void
  onCancel?: () => void
}

interface DangerActionButtonProps {
  confirmation: ConfirmationProps
  disabled?: boolean
  label?: string
  tooltip?: string
  onClick?: () => void
  isRed?: boolean
  noBackground?: boolean
  loading?: boolean
  block?: boolean
}

const DangerActionButton: FC<DangerActionButtonProps> = ({
  confirmation: { title, description, icon, onConfirm, onCancel },
  disabled,
  label,
  onClick,
  isRed,
  noBackground,
  loading,
  block = false,
  tooltip,
}) => (
  <Popconfirm
    disabled={disabled}
    title={title}
    description={description}
    icon={icon}
    onConfirm={onConfirm}
    onCancel={onCancel}
  >
    <Tooltip title={tooltip}>
      {isRed ? (
        <DangerButton
          block={block}
          loading={loading}
          size="large"
          onClick={onClick}
          disabled={disabled}
        >
          {label}
        </DangerButton>
      ) : (
        <PrimaryButton
          block={block}
          loading={loading}
          onClick={onClick}
          disabled={disabled}
          $noBackground={noBackground}
        >
          {label}
        </PrimaryButton>
      )}
    </Tooltip>
  </Popconfirm>
)

export { DangerActionButton }

// @TODO: Remove d.ts after component migration to TS
import type { ReactNode, FC } from 'react'

export interface DangerActionButtonProps {
  confirmation?: {
    title?: string
    description?: ReactNode
    icon?: ReactNode
    onConfirm?: VoidFunction
    onCancel?: VoidFunction
  }
  disabled?: boolean
  label?: string
  tooltip?: string
  onClick?: VoidFunction
  isRed?: boolean
  noBackground?: boolean
  loading?: boolean
  block?: boolean
}

export const DangerActionButton: FC<DangerActionButtonProps>

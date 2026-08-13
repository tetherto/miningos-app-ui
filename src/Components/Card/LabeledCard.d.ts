// @TODO: Remove d.ts after component migration to TS

import type { ReactElement, ReactNode } from 'react'

export interface LabeledCardNavigateOptions {
  to?: string
  target?: string
}

export interface LabeledCardProps {
  children?: ReactNode
  fullWidth?: boolean
  isDark?: boolean
  label?: string
  noWrap?: boolean
  fullHeight?: boolean
  underline?: boolean
  noMargin?: boolean
  noBorder?: boolean
  scrollable?: boolean
  relative?: boolean
  onGetNavigationOptions?: (label: string) => LabeledCardNavigateOptions | undefined
  className?: string
}

declare const LabeledCard: (props: LabeledCardProps) => ReactElement

export default LabeledCard

import Tooltip from 'antd/es/tooltip'
import _includes from 'lodash/includes'
import _isString from 'lodash/isString'
import { ReactNode } from 'react'
import { Link } from 'react-router'

import { CardContainer, CardTitle } from './Card.styles'
import { LabeledCardBody, LabeledCardHeaderLabel } from './LabeledCard.styles'

interface NavigateOptions {
  to?: string
  target?: string
}

interface LabeledCardProps {
  children?: ReactNode
  fullWidth?: boolean
  isDark?: boolean
  label?: string | ReactNode
  noWrap?: boolean
  fullHeight?: boolean
  underline?: boolean
  noMargin?: boolean
  noBorder?: boolean
  scrollable?: boolean
  relative?: boolean
  navigateOptions?: (label: string) => NavigateOptions | undefined
  className?: string
}

const LabeledCard = ({
  children = null,
  fullWidth = false,
  isDark = false,
  label = '',
  noWrap = false,
  fullHeight = false,
  underline = false,
  noMargin = false,
  noBorder = false,
  scrollable = false,
  relative = false,
  navigateOptions,
  className,
}: LabeledCardProps) => {
  const labelString = _isString(label) ? label : ''
  const navOpts = navigateOptions?.(labelString)
  const { to, target } = navOpts || {}

  const isErrorIncludes = _isString(label) && _includes(label, 'Miners with error')

  const CardTitleRenderer = isErrorIncludes ? (
    <Tooltip title={'This does not include minor errors not affecting the miner`s hash rate'}>
      <CardTitle>{label}</CardTitle>
    </Tooltip>
  ) : (
    <CardTitle>{label}</CardTitle>
  )

  const renderCardTitle =
    navOpts && to ? (
      <Link to={to} target={target} style={{ textDecoration: 'none' }}>
        {CardTitleRenderer}
      </Link>
    ) : (
      CardTitleRenderer
    )

  return (
    <CardContainer
      $noWrap={noWrap}
      $fullWidth={fullWidth}
      $isDark={isDark}
      $fullHeight={fullHeight}
      $noMargin={noMargin}
      $noBorder={noBorder}
      $scrollable={scrollable}
      $relative={relative}
      className={className}
    >
      <LabeledCardHeaderLabel $underline={underline}>{renderCardTitle}</LabeledCardHeaderLabel>
      <LabeledCardBody>{children}</LabeledCardBody>
    </CardContainer>
  )
}

export default LabeledCard

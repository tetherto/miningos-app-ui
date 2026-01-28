import { FC, ReactNode } from 'react'

import RightArrowIcon from '../../Icons/RightArrowIcon'
import {
  ChangeContainerText,
  ChangeContainerRightWrapper,
  ActionBadge,
  IconWrapper,
  ChangeContainerTextRight,
} from '../ActionCard.styles'

import { ACTION_STATUS_CONFIG } from './ActionCardHeader.const'

interface HeaderTextComponentProps {
  leftText?: string
  rightText?: ReactNode
  isRightIcon?: boolean
  actionCardType?: string
}

export const HeaderTextComponent: FC<HeaderTextComponentProps> = ({
  leftText,
  rightText,
  isRightIcon,
  actionCardType,
}) => {
  const actionStatusConfig = actionCardType ? ACTION_STATUS_CONFIG[actionCardType] : undefined

  return (
    <>
      <ChangeContainerText>{leftText}</ChangeContainerText>
      {actionStatusConfig && (
        <ActionBadge $color={actionStatusConfig.color}>{actionStatusConfig.label}</ActionBadge>
      )}
      <ChangeContainerRightWrapper>
        {isRightIcon && (
          <IconWrapper>
            <RightArrowIcon />
          </IconWrapper>
        )}
        {rightText && <ChangeContainerTextRight>{rightText}</ChangeContainerTextRight>}
      </ChangeContainerRightWrapper>
    </>
  )
}

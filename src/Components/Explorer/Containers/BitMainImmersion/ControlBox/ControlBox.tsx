import type { ReactNode } from 'react'
import { FC } from 'react'

import {
  BottomRow,
  ControlBoxContainer,
  LeftColumn,
  RightColumn,
  Title,
  TopRow,
} from './ControlBox.styles'

interface ControlBoxProps {
  title?: string
  leftContent?: ReactNode
  rightContent?: ReactNode
  bottomContent?: ReactNode
  secondary?: boolean
}

const ControlBox: FC<ControlBoxProps> = ({
  title,
  leftContent,
  rightContent,
  bottomContent,
  secondary = false,
}) => (
  <ControlBoxContainer $secondary={secondary}>
    <TopRow>
      <LeftColumn $secondary={secondary}>
        <Title>{title}</Title>
        {leftContent}
      </LeftColumn>
      <RightColumn $secondary={secondary}>{rightContent}</RightColumn>
    </TopRow>
    {bottomContent ? <BottomRow>{bottomContent}</BottomRow> : null}
  </ControlBoxContainer>
)

export { ControlBox }

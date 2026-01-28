import _map from 'lodash/map'
import _split from 'lodash/split'
import type { FC } from 'react'

import RightNavigateToIcon from '@/Components/Icons/RightNavigateToIcon'
import {
  IconWrapper,
  LogBodyText,
  LogContainer,
  LogDataContainer,
  LogHeaderContainer,
  LogInnerContainer,
  LogSubTitleText,
  LogTitleText,
} from '@/Components/LogsCard/LogsCard.styles'

export interface LogData {
  title: string
  subtitle: string
  body: string
  uuid: string
  [key: string]: unknown
}

interface LogComponentProps {
  data: LogData
  onLogClicked?: (uuid: string) => void
}

export const LogComponent: FC<LogComponentProps> = ({ data, onLogClicked }) => {
  const { title, subtitle, body, uuid } = data

  const onClick = () => {
    if (onLogClicked) {
      onLogClicked(uuid)
    }
  }

  return (
    <LogContainer>
      <LogInnerContainer onClick={onClick}>
        <LogDataContainer>
          <LogHeaderContainer>
            <LogTitleText>{title}</LogTitleText>
          </LogHeaderContainer>
          <LogSubTitleText title={subtitle}>{subtitle}</LogSubTitleText>
          <LogBodyText>
            {_map(_split(body, '|'), (item: string, index: number) => (
              <div key={index}>{item}</div>
            ))}
          </LogBodyText>
        </LogDataContainer>
        {onLogClicked && (
          <IconWrapper>
            <RightNavigateToIcon />
          </IconWrapper>
        )}
      </LogInnerContainer>
    </LogContainer>
  )
}

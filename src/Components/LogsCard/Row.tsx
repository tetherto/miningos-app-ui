import type { CSSProperties, FC } from 'react'

import { LogComponent } from '@/Components/LogsCard/LogComponent'
import { LogDotComponent } from '@/Components/LogsCard/LogDotComponent'
import { RowContainer } from '@/Components/LogsCard/LogsCard.styles'

interface LogData {
  status: string
  title: string
  subtitle: string
  body: string
  uuid: string
  [key: string]: unknown
}

interface RowProps {
  style: CSSProperties
  log: LogData
  onLogClicked?: (uuid: string) => void
  type: string
}

export const Row: FC<RowProps> = ({ style, log, onLogClicked, type }) => (
  <RowContainer style={{ ...style }}>
    <LogDotComponent status={log.status} type={type} />
    <LogComponent data={log} onLogClicked={onLogClicked} />
  </RowContainer>
)

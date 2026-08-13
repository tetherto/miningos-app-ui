import type { FC } from 'react'

import { ActivityLogIcon } from '@/Components/LogsCard/ActivityLogIcon'
import { LOG_TYPES } from '@/Components/LogsCard/constants'
import { LogStatusIcon } from '@/Components/LogsCard/LogsCard.styles'

interface LogDotComponentProps {
  type: string
  status: string
}

export const LogDotComponent: FC<LogDotComponentProps> = ({ type, status }) => {
  if (type === LOG_TYPES.INCIDENTS) return <LogStatusIcon $status={status} />

  if (type === LOG_TYPES.ACTIVITY) return <ActivityLogIcon status={status} />

  return null
}

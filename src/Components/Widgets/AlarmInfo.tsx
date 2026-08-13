import Tooltip from 'antd/es/tooltip'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _split from 'lodash/split'
import { FC, ReactNode } from 'react'

import { AlarmInfoTitle, AlarmInfoIcon } from './AlarmInfo.styles'

import type { Alert } from '@/app/utils/alertUtils'
import { getAlertsDescription } from '@/app/utils/alertUtils'
import useTimezone from '@/hooks/useTimezone'

interface AlarmInfoProps {
  title: string
  icon: ReactNode
  items?: unknown[]
}

export const AlarmInfo: FC<AlarmInfoProps> = ({ title, icon, items }) => {
  const { getFormattedDate } = useTimezone()

  if (_isEmpty(items)) {
    return null
  }

  const alertsArray: Alert[] = Array.isArray(items) ? (items as Alert[]) : []

  return (
    <Tooltip
      title={
        <>
          <AlarmInfoTitle>{`${title} issues`}</AlarmInfoTitle>
          {_map(
            _split(getAlertsDescription(alertsArray, getFormattedDate), '\n\n'),
            (line, index) => (
              <div key={index}>{line}</div>
            ),
          )}
        </>
      }
    >
      <AlarmInfoIcon>{icon}</AlarmInfoIcon>
    </Tooltip>
  )
}

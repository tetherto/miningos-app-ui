import Empty from 'antd/es/empty'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import type { ReactNode } from 'react'

import { DataRowContainer } from '../../../../Components/Container/ContentBox/DataRow.styles'

import { AlarmRow, type TimelineItemData } from './AlarmRow'
import { AlarmContentContainer, AlarmList } from './HomeTab.styles'

interface AlarmContentsProps {
  alarmsData?: TimelineItemData[] | unknown
}

export const AlarmContents = ({ alarmsData }: AlarmContentsProps) => {
  if (_isEmpty(alarmsData)) {
    return <Empty description="No active alarm or event" />
  }

  if (_isArray(alarmsData)) {
    return (
      <AlarmContentContainer>
        <AlarmList>
          {_map(alarmsData as TimelineItemData[], (alarm, idx) => (
            <AlarmRow key={idx} data={alarm} style={{}} />
          ))}
        </AlarmList>
      </AlarmContentContainer>
    )
  }

  return <DataRowContainer>{alarmsData as ReactNode}</DataRowContainer>
}

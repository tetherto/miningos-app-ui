import { CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons'
import type { FC } from 'react'

import { ACTIVITY_LOG_STATUS } from '@/Components/LogsCard/constants'

interface ActivityLogIconProps {
  status: string
}

export const ActivityLogIcon: FC<ActivityLogIconProps> = ({ status }) => {
  switch (status) {
    case ACTIVITY_LOG_STATUS.COMPLETED:
      return <CheckCircleFilled style={{ color: 'green' }} />
    case ACTIVITY_LOG_STATUS.PENDING:
      return <ClockCircleOutlined style={{ color: 'red' }} />
    default:
      return null
  }
}

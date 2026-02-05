import { ExclamationOutlined, WarningFilled } from '@ant-design/icons'
import _map from 'lodash/map'
import _split from 'lodash/split'
import type { CSSProperties, ReactNode } from 'react'
import { useNavigate } from 'react-router'

import {
  AlarmBody,
  AlarmContainer,
  AlarmDotIcon,
  AlarmRowWrapper,
  AlarmSubTitle,
  AlarmTitle,
  AlarmTitleRow,
} from './HomeTab.styles'

import { ALERT_SEVERITY_TYPES } from '@/app/utils/alertUtils'
import { COLOR } from '@/constants/colors'
import { onLogClicked } from '@/Views/Alerts/Alerts.util'

const ALERT_COLOR_MAP = {
  [ALERT_SEVERITY_TYPES.CRITICAL]: COLOR.RED,
  [ALERT_SEVERITY_TYPES.HIGH]: COLOR.COLD_ORANGE,
  [ALERT_SEVERITY_TYPES.MEDIUM]: COLOR.YELLOW,
}

const ALERT_ICON_MAP = {
  [ALERT_SEVERITY_TYPES.CRITICAL]: (
    <WarningFilled style={{ color: ALERT_COLOR_MAP[ALERT_SEVERITY_TYPES.CRITICAL] }} />
  ),
  [ALERT_SEVERITY_TYPES.HIGH]: (
    <ExclamationOutlined style={{ color: ALERT_COLOR_MAP[ALERT_SEVERITY_TYPES.HIGH] }} />
  ),
  [ALERT_SEVERITY_TYPES.MEDIUM]: (
    <AlarmDotIcon $color={ALERT_COLOR_MAP[ALERT_SEVERITY_TYPES.MEDIUM]} />
  ),
}

export interface AlarmItemData {
  title: string
  subtitle: string
  body: string
  uuid?: string
  status: string
  [key: string]: unknown
}

export interface TimelineItemData {
  item: AlarmItemData
  dot: ReactNode
  children: ReactNode
}

interface AlarmRowProps {
  data: TimelineItemData
  style: CSSProperties
}

export const AlarmRow = ({ data, style }: AlarmRowProps) => {
  const navigate = useNavigate()
  const { title, subtitle, body, uuid, status } = data.item

  const handleClick = () => {
    onLogClicked(navigate, uuid)
  }

  return (
    <AlarmRowWrapper style={style} $color={ALERT_COLOR_MAP[status as keyof typeof ALERT_COLOR_MAP]}>
      <AlarmContainer onClick={handleClick}>
        <AlarmTitleRow>
          {ALERT_ICON_MAP[status as keyof typeof ALERT_ICON_MAP]}
          <AlarmTitle>{title}</AlarmTitle>
        </AlarmTitleRow>
        <AlarmSubTitle>{subtitle}</AlarmSubTitle>
        <AlarmBody>
          {_map(_split(body, '|'), (item, index) => (
            <div key={index}>{item}</div>
          ))}
        </AlarmBody>
      </AlarmContainer>
    </AlarmRowWrapper>
  )
}

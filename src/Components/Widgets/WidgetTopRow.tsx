import Tooltip from 'antd/es/tooltip'
import _get from 'lodash/get'
import _map from 'lodash/map'
import { FC } from 'react'

import { AlarmInfo } from './AlarmInfo'
import { WIDGET_ALARMS, type AlarmPropKey, type WidgetAlarmItem } from './WidgetTopRow.const'
import {
  MainContainer,
  Power,
  PowerProps,
  Title,
  TitleProps,
  TopRowInnerContainer,
} from './WidgetTopRow.styles'

import { unitToKilo } from '@/app/utils/deviceUtils'
import { formatErrors, formatNumber } from '@/app/utils/format'
import type { ErrorWithTimestamp } from '@/app/utils/utils.types'
import useTimezone from '@/hooks/useTimezone'

type AlarmsMap = Partial<Record<AlarmPropKey, unknown[]>>

interface WidgetTopRowProps {
  title: string
  power?: number
  unit?: string
  statsErrorMessage?: string | ErrorWithTimestamp[] | null
  alarms?: AlarmsMap
  titleFontSize?: TitleProps['$fontSize']
  powerColor?: PowerProps['$color']
  powerFontSize?: PowerProps['$fontSize']
  powerValueFontWeight?: PowerProps['$valueFontWeight']
}

const WidgetTopRow: FC<WidgetTopRowProps> = ({
  title,
  power,
  unit,
  statsErrorMessage,
  alarms,
  titleFontSize,
  powerColor,
  powerFontSize,
  powerValueFontWeight = 700,
}) => {
  const { getFormattedDate } = useTimezone()

  const powerLabel = power ? (
    <>
      {formatNumber(unitToKilo(power))}
      &nbsp;
      <span>{unit}</span>
    </>
  ) : null

  return (
    <MainContainer>
      <TopRowInnerContainer>
        <Title $fontSize={titleFontSize}>{title}</Title>
        {_map(WIDGET_ALARMS, (alarm: WidgetAlarmItem) => (
          <AlarmInfo
            title={alarm.title}
            icon={<alarm.Icon />}
            items={_get(alarms, alarm.propKey)}
            key={alarm.title}
          />
        ))}
        <Power
          $color={powerColor}
          $fontSize={powerFontSize}
          $valueFontWeight={powerValueFontWeight}
        >
          {statsErrorMessage ? (
            <Tooltip title={formatErrors(statsErrorMessage, getFormattedDate)}>-</Tooltip>
          ) : (
            powerLabel
          )}
        </Power>
      </TopRowInnerContainer>
    </MainContainer>
  )
}

export { WidgetTopRow }

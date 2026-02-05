import _get from 'lodash/get'
import _map from 'lodash/map'
import _sumBy from 'lodash/sumBy'
import { RefObject } from 'react'
import { Link } from 'react-router'

import {
  getCabinetTitle,
  getLvCabinetTransformerTempSensorColor,
  getPowerSensorName,
  getRootTempSensorTempValue,
  getTemperatureSensorName,
} from '../../app/utils/deviceUtils'
import { WidgetTopRow } from '../../Components/Widgets/WidgetTopRow'
import { UNITS } from '../../constants/units'
import useTimezone from '../../hooks/useTimezone'

import { LVCabinetWidgetCardDataRow } from './LVCabinetWidgetCardDataRow'
import { DEVICE_PATHS } from './LVCabinetWidgets.constants'
import {
  LVCabinetWidgetBox,
  LVCabinetWidgetBoxInnerContainer,
  LvCabinetWidgetWrapper,
} from './LVCabinetWidgets.styles'
import type { LVCabinet } from './LVCabinetWidgets.types'

import { getProcessedAlarms } from '@/app/utils/alertUtils'
import { processPowerMeterData } from '@/app/utils/electricityUtils'
import { useGridRowSpan } from '@/hooks/useGridRowSpan'

interface LVCabinetWidgetCardProps {
  lvCabinet: LVCabinet
}

const LVCabinetWidgetCard = ({ lvCabinet }: LVCabinetWidgetCardProps) => {
  const deviceTitle = getCabinetTitle(lvCabinet)
  const rootTempSensor = _get(lvCabinet, DEVICE_PATHS.ROOT_TEMP_SENSOR)
  const rootTemperatureValue = getRootTempSensorTempValue(lvCabinet)
  const { getFormattedDate } = useTimezone()
  const { ref, span } = useGridRowSpan()

  const lvcPmTotal = _sumBy(lvCabinet?.powerMeters, (pm) => _get(pm, DEVICE_PATHS.POWER_W) || 0)

  return (
    <LvCabinetWidgetWrapper
      $span={span}
      ref={ref as RefObject<HTMLDivElement>}
      key={`cabinet-widget-${lvCabinet?.id}`}
    >
      <Link to={`/cabinets/${lvCabinet?.id}`}>
        <LVCabinetWidgetBox
          title={
            (
              <WidgetTopRow
                alarms={getProcessedAlarms(lvCabinet?.alerts, getFormattedDate)}
                title={deviceTitle}
                power={lvcPmTotal}
                unit={UNITS.POWER_W}
              />
            ) as unknown as string
          }
        >
          <LVCabinetWidgetBoxInnerContainer>
            {rootTempSensor ? (
              <LVCabinetWidgetCardDataRow
                title={getTemperatureSensorName(
                  rootTempSensor?.type || '',
                  rootTempSensor?.info?.pos || '',
                )}
                values={[
                  {
                    title: 'Root Temperature',
                    value: rootTemperatureValue as string | number,
                    color: getLvCabinetTransformerTempSensorColor(
                      (rootTemperatureValue as number) || 0,
                    ),
                    unit: UNITS.TEMPERATURE_C,
                  },
                ]}
              />
            ) : null}
            {_map(lvCabinet?.tempSensors, (tempSensor) => {
              const sensorTempValue = tempSensor?.last?.snap?.stats?.temp_c
              return (
                <LVCabinetWidgetCardDataRow
                  key={tempSensor?.id}
                  values={[
                    {
                      title: 'Temperature',
                      value: sensorTempValue || 0,
                      color: getLvCabinetTransformerTempSensorColor(sensorTempValue || 0),
                      unit: UNITS.TEMPERATURE_C,
                    },
                  ]}
                  title={getTemperatureSensorName(
                    tempSensor?.type || '',
                    tempSensor?.info?.pos || '',
                  )}
                />
              )
            })}
            {_map(lvCabinet?.powerMeters, (powerMeter) => (
              <LVCabinetWidgetCardDataRow
                key={powerMeter?.id}
                values={processPowerMeterData(_get(powerMeter, DEVICE_PATHS.POWER_METER_STATS))}
                title={getPowerSensorName(powerMeter?.type || '', powerMeter?.info?.pos)}
              />
            ))}
          </LVCabinetWidgetBoxInnerContainer>
        </LVCabinetWidgetBox>
      </Link>
    </LvCabinetWidgetWrapper>
  )
}

export default LVCabinetWidgetCard

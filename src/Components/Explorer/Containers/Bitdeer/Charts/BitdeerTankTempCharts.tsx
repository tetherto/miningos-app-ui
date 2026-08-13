import _replace from 'lodash/replace'

import { CHART_COLORS } from '../../../../../constants/colors'
import ContainerChartsBuilder from '../../../../ContainerChartsBuilder/ContainerChartsBuilder'

import { CHART_TITLES } from '@/constants/charts'

interface BitdeerTankTempChartsProps {
  tag?: unknown
  tankNumber?: number | string
  dateRange?: unknown
}

const BitdeerTankTempCharts = ({ tag, tankNumber, dateRange }: BitdeerTankTempChartsProps) => {
  const LIQUID_TEMP_CHART_DATA_PAYLOAD = {
    unit: '°C',
    lines: [
      {
        label: `Tank${tankNumber} Oil TempL`,
        backendAttribute: `cold_temp_c_${tankNumber}_group`,
        borderColor: CHART_COLORS.yellow,
        borderWidth: 4,
      },
      {
        label: `Tank${tankNumber} Oil TempH`,
        backendAttribute: `hot_temp_c_${tankNumber}_group`,
        borderColor: CHART_COLORS.VIOLET,
      },
      {
        label: `Tank${tankNumber} Water TempL`,
        backendAttribute: `cold_temp_c_w_${tankNumber}_group`,
        borderColor: CHART_COLORS.blue,
      },
      {
        label: `Tank${tankNumber} Water TempH`,
        backendAttribute: `hot_temp_c_w_${tankNumber}_group`,
        borderColor: CHART_COLORS.SKY_BLUE,
      },
    ],
    currentValueLabel: {
      backendAttribute: `cold_temp_c_${tankNumber}_group`,
    },
  }
  return (
    <ContainerChartsBuilder
      dateRange={dateRange as { start?: number; end?: number }}
      chartTitle={_replace(CHART_TITLES.TANK_OIL_TEMP, 'TANK_NUMBER', String(tankNumber ?? ''))}
      tag={tag as string}
      chartDataPayload={LIQUID_TEMP_CHART_DATA_PAYLOAD}
    />
  )
}

export default BitdeerTankTempCharts

import Col from 'antd/es/col'
import Empty from 'antd/es/empty'
import _isNil from 'lodash/isNil'

import {
  isAntspaceHydro,
  isBitdeer,
  isBitmainImmersion,
} from '../../../../app/utils/containerUtils'
import type { Device } from '../../../../app/utils/deviceUtils'
import { appendContainerToTag, getContainerSpecificStats } from '../../../../app/utils/deviceUtils'
import ConsumptionLineChart from '../../../../Components/Dashboard/ConsumptionLineChart/ConsumptionLineChart'
import { HashRateLineChart } from '../../../../Components/Dashboard/HashRateLineChart'
import { BitdeerTankPressureCharts } from '../../../../Components/Explorer/Containers/Bitdeer/Charts/BitdeerTankPressureCharts'
import BitdeerTankTempCharts from '../../../../Components/Explorer/Containers/Bitdeer/Charts/BitdeerTankTempCharts'
import { BitMainHydroLiquidTemperatureCharts } from '../../../../Components/Explorer/Containers/BitMainHydro/BitMainCharts/BitMainHydroLiquidTemperatureCharts'
import BitMainLiquidPressureCharts from '../../../../Components/Explorer/Containers/BitMainHydro/BitMainCharts/BitMainLiquidPressureCharts'
import BitMainLiquidTempCharts from '../../../../Components/Explorer/Containers/BitMainHydro/BitMainCharts/BitMainLiquidTempCharts'
import BitMainPowerCharts from '../../../../Components/Explorer/Containers/BitMainHydro/BitMainCharts/BitMainPowerCharts'
import BitMainSupplyLiquidFlowCharts from '../../../../Components/Explorer/Containers/BitMainHydro/BitMainCharts/BitMainSupplyLiquidFlowCharts'
import { CHART_TITLES } from '../../../../constants/charts'

import { ChartTabWrapper } from './ChartsTab.styles'

import { useDateRangePicker } from '@/hooks/useDatePicker'

const isBitdeerTankPressureAvailable = (data: Device) => {
  const cooling_system = getContainerSpecificStats(data)?.cooling_system as
    | Record<string, unknown>
    | undefined
  const { tank1_bar, tank2_bar } = cooling_system || {}

  return !_isNil(tank1_bar) || !_isNil(tank2_bar)
}

interface ChartsTabProps {
  data?: Device
}

export const ChartsTab = ({ data }: ChartsTabProps) => {
  const { dateRange, datePicker } = useDateRangePicker()

  if (!data) {
    return <Empty />
  }

  return (
    <ChartTabWrapper>
      {datePicker}
      <Col sm={24} lg={24}>
        <HashRateLineChart
          dateRange={dateRange}
          tag={appendContainerToTag(data.info?.container ?? '')}
        />
      </Col>
      <Col sm={24} lg={24}>
        <ConsumptionLineChart
          dateRange={dateRange}
          tag={appendContainerToTag(data.info?.container ?? '')}
        />
      </Col>
      {isAntspaceHydro(data?.type ?? '') && (
        <>
          <Col sm={24} lg={24}>
            <BitMainPowerCharts
              dateRange={dateRange}
              tag={appendContainerToTag(data?.info?.container ?? '')}
            />
          </Col>
          <Col sm={24} lg={24}>
            <BitMainSupplyLiquidFlowCharts
              dateRange={dateRange}
              tag={appendContainerToTag(data?.info?.container ?? '')}
            />
          </Col>
          <Col sm={24} lg={24}>
            <BitMainLiquidTempCharts
              dateRange={dateRange}
              tag={appendContainerToTag(data?.info?.container ?? '')}
            />
          </Col>
          <Col sm={24} lg={24}>
            <BitMainLiquidPressureCharts
              dateRange={dateRange}
              tag={appendContainerToTag(data?.info?.container ?? '')}
            />
          </Col>
        </>
      )}
      {isBitmainImmersion(data?.type ?? '') && (
        <>
          <Col sm={24} lg={24}>
            <BitMainHydroLiquidTemperatureCharts
              dateRange={dateRange}
              tag={appendContainerToTag(data?.info?.container ?? '')}
            />
          </Col>
        </>
      )}
      {isBitdeer(data?.type ?? '') && (
        <>
          <Col sm={24} lg={24}>
            <BitdeerTankTempCharts
              tankNumber="1"
              dateRange={dateRange}
              tag={appendContainerToTag(data?.info?.container ?? '')}
            />
          </Col>
          <Col sm={24} lg={24}>
            <BitdeerTankTempCharts
              tankNumber="2"
              dateRange={dateRange}
              tag={appendContainerToTag(data?.info?.container ?? '')}
            />
          </Col>
          {isBitdeerTankPressureAvailable(data) && (
            <Col sm={24} lg={24}>
              <BitdeerTankPressureCharts
                dateRange={dateRange}
                chartTitle={CHART_TITLES.TANK_PRESSURE}
                tag={appendContainerToTag(data?.info?.container ?? '')}
              />
            </Col>
          )}
        </>
      )}
    </ChartTabWrapper>
  )
}

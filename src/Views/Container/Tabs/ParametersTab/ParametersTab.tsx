import Col from 'antd/es/col'
import Row from 'antd/es/row'

import type { Device } from '../../../../app/utils/deviceUtils'
import { getStats } from '../../../../app/utils/deviceUtils'
import { ContentBox } from '../../../../Components/Container/ContentBox/ContentBox'
import { GaugeChartComponent } from '../../../../Components/Explorer/Containers/MicroBT/GaugeChart/GaugeChartComponent'
import { MAX_UNIT_VALUE, UNITS } from '../../../../constants/units'

import { GaugesRow, ParametersTabContainer } from './ParametersTab.styles'

import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'

interface ParametersTabProps {
  data?: Device
}

const ParametersTab = ({ data }: ParametersTabProps) => {
  const { ambient_temp_c, humidity_percent } = getStats(data as Device)

  return (
    <ParametersTabContainer>
      <Row gutter={[10, 10]}>
        <Col xs={24} span={12}>
          <ContainerPanel>
            <ContentBox title="Realtime value Temperature1 and Humidity1">
              <GaugesRow>
                <GaugeChartComponent
                  label="Temperature"
                  max={MAX_UNIT_VALUE.TEMPERATURE_PERCENT}
                  value={ambient_temp_c as number}
                  unit={UNITS.TEMPERATURE_C}
                />
                <GaugeChartComponent
                  label="Humidity"
                  max={MAX_UNIT_VALUE.HUMIDITY_PERCENT}
                  value={humidity_percent as number}
                  unit={UNITS.PERCENT}
                />
              </GaugesRow>
            </ContentBox>
          </ContainerPanel>
        </Col>
      </Row>
    </ParametersTabContainer>
  )
}

export { ParametersTab }

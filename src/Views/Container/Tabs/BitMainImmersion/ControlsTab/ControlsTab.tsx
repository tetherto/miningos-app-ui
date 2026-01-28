import Col from 'antd/es/col'
import Row from 'antd/es/row'

import type { Device } from '../../../../../app/utils/deviceUtils'
import { getContainerSpecificStats } from '../../../../../app/utils/deviceUtils'
import { DEVICE_STATUS } from '../../../../../app/utils/statusUtils'
import { Title } from '../../../../../Components/Container/ContentBox/ContentBox.styles'
import { DeviceStatus } from '../../../../../Components/DeviceStatus/DeviceStatus'
import { InputTitleColumn } from '../../../../../Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.styles'
import { ControlBoxContainer } from '../../../../../Components/Explorer/Containers/BitMainImmersion/ControlBox/ControlBox.styles'

import {
  ControlBoxesContainer,
  ControlBoxesRow,
  ControlsBoxInnerContainer,
  ControlsTabContainer,
  SectionTitle,
} from './ControlsTab.styles'

import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'

interface ControlsTabProps {
  data: Device
}

const ControlsTab = ({ data }: ControlsTabProps) => {
  const containerSpecific = getContainerSpecificStats(data)
  return (
    <ControlsTabContainer>
      <ControlBoxesContainer $expand>
        <ContainerPanel>
          <DeviceStatus
            isRow
            status={containerSpecific?.container_fan ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
            fault={(containerSpecific?.fan_fault && DEVICE_STATUS.ERROR) as string | boolean}
            title="Container fan"
          />
        </ContainerPanel>
      </ControlBoxesContainer>
      <ControlBoxesContainer $expand={false}>
        <ControlBoxesRow></ControlBoxesRow>
        <ControlBoxesRow>
          <ControlBoxContainer>
            <ControlsBoxInnerContainer>
              <Row>
                <Col span={12}>
                  <SectionTitle>
                    Tank A Level : {containerSpecific?.tank_a_level as number} cm
                  </SectionTitle>
                </Col>
                <Col span={12}>
                  <SectionTitle>
                    Tank B Level : {containerSpecific?.tank_b_level as number} cm
                  </SectionTitle>
                </Col>
                <Col span={12}>
                  <SectionTitle>
                    Tank C Level : {containerSpecific?.tank_c_level as number} cm
                  </SectionTitle>
                </Col>
                <Col span={12}>
                  <SectionTitle>
                    Tank D Level : {containerSpecific?.tank_d_level as number} cm
                  </SectionTitle>
                </Col>
              </Row>
            </ControlsBoxInnerContainer>
          </ControlBoxContainer>
        </ControlBoxesRow>
        <ControlBoxContainer>
          <ControlsBoxInnerContainer>
            <Title>Location</Title>
            <Row>
              <Col span={12}>
                <SectionTitle>Latitude:</SectionTitle>
                <InputTitleColumn>
                  <p>Latitude : {containerSpecific?.latitude as number}</p>
                  <p>Direction : {containerSpecific?.latitude_direction as string}</p>
                </InputTitleColumn>
              </Col>
              <Col span={12}>
                <SectionTitle>Longitude:</SectionTitle>
                <InputTitleColumn>
                  <p>Longitude : {containerSpecific?.longitude as number}</p>
                  <p>Direction : {containerSpecific?.longitude_direction as string}</p>
                </InputTitleColumn>
              </Col>
            </Row>
          </ControlsBoxInnerContainer>
        </ControlBoxContainer>
      </ControlBoxesContainer>
    </ControlsTabContainer>
  )
}

export { ControlsTab }

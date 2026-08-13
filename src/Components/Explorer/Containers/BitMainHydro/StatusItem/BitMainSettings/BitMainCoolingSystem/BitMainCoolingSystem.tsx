import Col from 'antd/es/col'
import { FC } from 'react'

import { getDeviceData } from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { DEVICE_STATUS } from '@/app/utils/statusUtils'
import { DeviceStatus } from '@/Components/DeviceStatus/DeviceStatus'
import {
  BiMainCoolingSystemWrapper,
  ButtonsContainer,
} from '@/Components/Explorer/Containers/BitMainHydro/StatusItem/BitMainSettings/BitMainBasicSettings.styles'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'

interface BitMainCoolingSystemProps {
  data?: UnknownRecord
}

/**
 * Type-safe helper to get fault status from unknown value
 */
const getFaultStatus = (faultValue: unknown): string | undefined =>
  faultValue ? DEVICE_STATUS.ERROR : undefined

const BitMainCoolingSystem: FC<BitMainCoolingSystemProps> = ({ data }) => {
  const [, deviceData] = getDeviceData(data as Device)
  const snap = deviceData?.snap
  const containerSpecific = snap?.stats?.container_specific as UnknownRecord | undefined

  return (
    <ContainerPanel>
      <BiMainCoolingSystemWrapper>
        <ButtonsContainer>
          <Col>
            <DeviceStatus
              status={
                containerSpecific?.circulating_pump ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF
              }
              fault={getFaultStatus(containerSpecific?.circulating_pump_fault)}
              title="Circulating pump"
            />
          </Col>
          <Col>
            <DeviceStatus
              status={
                containerSpecific?.fluid_infusion_pump ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF
              }
              fault={getFaultStatus(containerSpecific?.fluid_infusion_pump_fault)}
              title="Fluid Infusion pump"
            />
          </Col>
          <Col>
            <DeviceStatus
              status={containerSpecific?.fan1 ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
              fault={getFaultStatus(containerSpecific?.fan1_fault)}
              title="Fan #1"
            />
          </Col>
          <Col>
            <DeviceStatus
              status={containerSpecific?.fan2 ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
              fault={getFaultStatus(containerSpecific?.fan2_fault)}
              title="Fan #2"
            />
          </Col>
        </ButtonsContainer>
        <ButtonsContainer>
          {' '}
          <Col>
            <DeviceStatus
              status={
                containerSpecific?.cooling_tower_fan1 ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF
              }
              fault={getFaultStatus(containerSpecific?.cooling_tower_fan1_fault)}
              title="Cooling tower fan #1"
            />
          </Col>
          <Col>
            <DeviceStatus
              status={
                containerSpecific?.cooling_tower_fan2 ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF
              }
              fault={getFaultStatus(containerSpecific?.cooling_tower_fan2_fault)}
              title="Cooling tower fan #2"
            />
          </Col>
          <Col>
            <DeviceStatus
              status={
                containerSpecific?.cooling_tower_fan3 ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF
              }
              fault={getFaultStatus(containerSpecific?.cooling_tower_fan3_fault)}
              title="Cooling tower fan #3"
            />
          </Col>
        </ButtonsContainer>
      </BiMainCoolingSystemWrapper>
    </ContainerPanel>
  )
}

export default BitMainCoolingSystem

import Divider from 'antd/es/divider'
import { FC } from 'react'

import { isMicroBTKehua } from '../../../../../app/utils/containerUtils'
import { getContainerSpecificStats } from '../../../../../app/utils/deviceUtils'
import { DEVICE_STATUS } from '../../../../../app/utils/statusUtils'
import { UNITS } from '../../../../../constants/units'
import { ContentBox } from '../../../../Container/ContentBox/ContentBox'
import { DeviceStatus } from '../../../../DeviceStatus/DeviceStatus'
import { RightOptionsButtonsContainer } from '../../Bitdeer/Settings/ContainerOptions/BitdeerOptions.styles'
import { ContainerPanel } from '../../Container.styles'

import { CoolingContainerRow } from './MicroBTCooling.styles'

import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'

interface MicroBTCoolingProps {
  data?: UnknownRecord
}

interface CduStats {
  cycle_pump_control?: boolean
  circulation_pump_running_status?: string
  circulation_pump_switch?: string
  circulation_pump_speed?: number
  cooling_fan_control?: boolean
  cooling_system_status?: string
  cooling_fan_switch?: string
  makeup_water_pump_control?: boolean
  makeup_water_pump_fault?: boolean
  makeup_water_pump_switch?: string
}

const MicroBTCooling: FC<MicroBTCoolingProps> = ({ data }) => {
  const { cdu } = getContainerSpecificStats((data ?? {}) as Device)
  const cduTyped = cdu as UnknownRecord as CduStats

  return (
    <>
      <ContainerPanel $noWrap>
        <DeviceStatus
          isRow
          title="Cycle Pump"
          status={cduTyped?.cycle_pump_control ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
        />
        <Divider size="small" />
        <ContentBox>
          <CoolingContainerRow>
            <RightOptionsButtonsContainer>
              <DeviceStatus
                title="Main Circulation Pump"
                status={cduTyped?.circulation_pump_running_status}
              />
            </RightOptionsButtonsContainer>
            <RightOptionsButtonsContainer>
              <DeviceStatus title="Switch State" secondary>
                <>{cduTyped?.circulation_pump_switch}</>
              </DeviceStatus>
            </RightOptionsButtonsContainer>
            <RightOptionsButtonsContainer>
              <DeviceStatus title="Speed" secondary>
                {cduTyped?.circulation_pump_speed}{' '}
                {isMicroBTKehua(data?.type as string) ? UNITS.PERCENT : UNITS.FREQUENCY_HERTZ}
              </DeviceStatus>
            </RightOptionsButtonsContainer>
          </CoolingContainerRow>
        </ContentBox>
        <Divider size="small" />
        <CoolingContainerRow>
          <RightOptionsButtonsContainer>
            <DeviceStatus
              title="Cooling Fan"
              status={cduTyped?.cooling_fan_control ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
            />
          </RightOptionsButtonsContainer>
          {isMicroBTKehua(data?.type as string) ? (
            <RightOptionsButtonsContainer>
              <DeviceStatus title={'Speed'} secondary>
                <span>{cduTyped?.cooling_system_status}</span>
              </DeviceStatus>
            </RightOptionsButtonsContainer>
          ) : null}
          <RightOptionsButtonsContainer>
            <DeviceStatus title={'Switch State'} secondary>
              <span>{cduTyped?.cooling_fan_switch}</span>
            </DeviceStatus>
          </RightOptionsButtonsContainer>
        </CoolingContainerRow>
        <Divider size="small" />
        <CoolingContainerRow>
          <RightOptionsButtonsContainer>
            <DeviceStatus
              title="Make Up Pump"
              status={
                cduTyped?.makeup_water_pump_control ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF
              }
              fault={cduTyped?.makeup_water_pump_fault && DEVICE_STATUS.ERROR}
            />
          </RightOptionsButtonsContainer>
          <RightOptionsButtonsContainer>
            <DeviceStatus title={'Switch State'} secondary>
              <span>{cduTyped?.makeup_water_pump_switch}</span>
            </DeviceStatus>
          </RightOptionsButtonsContainer>
        </CoolingContainerRow>
      </ContainerPanel>
    </>
  )
}

export default MicroBTCooling

import Col from 'antd/es/col'
import Row from 'antd/es/row'
import _isNil from 'lodash/isNil'
import { FC } from 'react'

import { getDeviceData, unitToKilo } from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import {
  InputTitle,
  InputTitleColumn,
} from '@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.styles'
import {
  PowerStatus,
  SectionContainer,
  SubsectionTitle,
} from '@/Components/Explorer/Containers/BitMainHydro/StatusItem/BitMainSettings/BitMainBasicSettings.styles'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'
import { StatDataWrapper } from '@/Views/Container/Tabs/HomeTab/HomeTab.styles'

interface BitMainPowerAndPositioningProps {
  data?: UnknownRecord
}

/**
 * Safely converts unknown value to number for unitToKilo
 * Returns 0 if value is not a number
 */
const safeNumber = (value: unknown): number => {
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

/**
 * Safely converts unknown value to string for display
 * Returns empty string if value is null or undefined
 */
const safeString = (value: unknown): string => {
  if (_isNil(value)) {
    return ''
  }

  return String(value)
}

const BitMainPowerAndPositioning: FC<BitMainPowerAndPositioningProps> = ({ data }) => {
  const [, deviceData] = getDeviceData(data as Device)
  const snap = deviceData?.snap
  const stats = snap?.stats as UnknownRecord | undefined
  const containerSpecific = stats?.container_specific as UnknownRecord | undefined

  return (
    <>
      <StatDataWrapper>
        <ContainerPanel>
          <ContentBox title="Power">
            <SectionContainer>
              <div>
                <PowerStatus>
                  <SubsectionTitle>#1 Power Distribution:</SubsectionTitle>
                  <InputTitle>
                    Power : {formatNumber(unitToKilo(safeNumber(stats?.distribution_box1_power_w)))}{' '}
                    KW
                  </InputTitle>
                </PowerStatus>
                <PowerStatus>
                  <SubsectionTitle>#2 Power Distribution:</SubsectionTitle>
                  <InputTitle>
                    Power : {formatNumber(unitToKilo(safeNumber(stats?.distribution_box2_power_w)))}{' '}
                    KW
                  </InputTitle>
                </PowerStatus>
              </div>
            </SectionContainer>
          </ContentBox>
        </ContainerPanel>
        <ContainerPanel>
          <ContentBox title="Location">
            <SectionContainer>
              <Row>
                <Col span={12}>
                  <SubsectionTitle>Latitude</SubsectionTitle>
                  <InputTitleColumn>
                    <p>Latitude : {safeString(containerSpecific?.latitude)}</p>
                    <p>Direction : {safeString(containerSpecific?.latitude_direction)}</p>
                  </InputTitleColumn>
                </Col>
                <Col span={12}>
                  <SubsectionTitle>Longitude</SubsectionTitle>
                  <InputTitleColumn>
                    <p>Longitude : {safeString(containerSpecific?.longitude)}</p>
                    <p>Direction : {safeString(containerSpecific?.longitude_direction)}</p>
                  </InputTitleColumn>
                </Col>
              </Row>
            </SectionContainer>
          </ContentBox>
        </ContainerPanel>
      </StatDataWrapper>
    </>
  )
}

export default BitMainPowerAndPositioning

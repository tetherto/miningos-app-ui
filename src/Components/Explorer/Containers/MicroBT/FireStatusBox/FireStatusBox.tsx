import { FC } from 'react'

import { FireStatusBoxContainer } from './FireStatusBox.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { DeviceStatus } from '@/Components/DeviceStatus/DeviceStatus'

interface FireStatusBoxProps {
  data?: UnknownRecord
}

const FireStatusBox: FC<FireStatusBoxProps> = ({ data }) => {
  const smokeDetector = data?.smokeDetector
  const waterIngressDetector = data?.waterIngressDetector
  const coolingFanStatus = data?.coolingFanStatus

  return (
    <FireStatusBoxContainer>
      <DeviceStatus title="Smoke Detector 1" isRow>
        {smokeDetector !== null && smokeDetector !== undefined ? String(smokeDetector) : ''}
      </DeviceStatus>
      <DeviceStatus title="Water Ingress Detector" isRow>
        {waterIngressDetector !== null && waterIngressDetector !== undefined
          ? String(waterIngressDetector)
          : ''}
      </DeviceStatus>
      <DeviceStatus title="Fan status" isRow>
        {coolingFanStatus !== null && coolingFanStatus !== undefined
          ? String(coolingFanStatus)
          : ''}
      </DeviceStatus>
    </FireStatusBoxContainer>
  )
}

export { FireStatusBox }

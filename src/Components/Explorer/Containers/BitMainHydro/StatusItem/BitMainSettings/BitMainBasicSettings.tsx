import { FC } from 'react'

import { SectionTitle } from './BitMainBasicSettings.styles'
import BitMainCoolingSystem from './BitMainCoolingSystem/BitMainCoolingSystem'
import BitMainPowerAndPositioning from './BitMainPowerAndPositioning/BitMainPowerAndPositioning'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface BitMainBasicSettingsProps {
  data?: UnknownRecord
}

export const BitMainBasicSettings: FC<BitMainBasicSettingsProps> = ({ data }) => (
  <>
    <BitMainCoolingSystem data={data} />
    <SectionTitle>Power & Positioning</SectionTitle>
    <BitMainPowerAndPositioning data={data} />
  </>
)

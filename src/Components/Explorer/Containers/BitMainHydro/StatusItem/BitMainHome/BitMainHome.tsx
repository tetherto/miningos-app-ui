import { FC } from 'react'

import BitMainPowerAndPositioning from '../BitMainSettings/BitMainPowerAndPositioning/BitMainPowerAndPositioning'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface BitMainHomeProps {
  data?: UnknownRecord
}

const BitMainHome: FC<BitMainHomeProps> = ({ data }) => (
  <>
    <BitMainPowerAndPositioning data={data} />
  </>
)

export default BitMainHome

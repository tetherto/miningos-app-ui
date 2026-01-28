import { FC } from 'react'

import MicroBTCooling from '../MicroBTCooling/MicroBTCooling'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface MicroBTHomeProps {
  data?: UnknownRecord
}

const MicroBTHome: FC<MicroBTHomeProps> = ({ data }) => (
  <>
    <MicroBTCooling data={data} />
  </>
)

export default MicroBTHome

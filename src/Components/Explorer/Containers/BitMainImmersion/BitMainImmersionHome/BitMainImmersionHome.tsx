import type { ComponentType } from 'react'
import { FC } from 'react'

import { ControlsTab } from '../../../../../Views/Container/Tabs/BitMainImmersion/ControlsTab/ControlsTab'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface BitMainImmersionHomeProps {
  data?: UnknownRecord
}

const BitMainImmersionHome: FC<BitMainImmersionHomeProps> = ({ data }) => {
  const ControlsTabTyped = ControlsTab as unknown as ComponentType<{
    data: unknown
    isBitmain?: boolean
  }>
  return <ControlsTabTyped isBitmain={true} data={data} />
}

export default BitMainImmersionHome

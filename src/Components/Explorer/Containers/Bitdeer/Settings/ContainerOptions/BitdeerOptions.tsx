import { FC } from 'react'

import { getBitdeerCoolingSystemData } from '../BitdeerSettings.utils'

import { BitdeerOptionsContainer } from './BitdeerOptions.styles'
import BitdeerPumps from './BitdeerPumps'
import DryCooler from './DryCooler/DryCooler'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface BitdeerOptionsProps {
  data?: UnknownRecord
}

const BitdeerOptions: FC<BitdeerOptionsProps> = ({ data }) => {
  const { dryCooler } = getBitdeerCoolingSystemData(data ?? {})

  return (
    <BitdeerOptionsContainer>
      {dryCooler && <DryCooler data={data} />}
      <BitdeerPumps data={data} />
    </BitdeerOptionsContainer>
  )
}

export default BitdeerOptions

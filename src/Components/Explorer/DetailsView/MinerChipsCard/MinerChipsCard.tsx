import _find from 'lodash/find'
import _isUndefined from 'lodash/isUndefined'
import _map from 'lodash/map'
import { FC } from 'react'
import type { ReactElement } from 'react'

import LabeledCard from '../../../Card/LabeledCard'

import MinerChip from './MinerChip/MinerChip'
import { ChipsWrapper } from './MinerChipsCard.styles'

import { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface ChipData {
  index: number
  current: number
}

interface TempChipData {
  index: number
  max?: number
  min?: number
  avg?: number
}

interface MinerChipsCardProps {
  data: UnknownRecord
}

const MinerChipsCard: FC<MinerChipsCardProps> = ({ data }) => {
  const dataTyped = data as {
    frequency_mhz?: { chips?: ChipData[] }
    temperature_c?: { chips?: TempChipData[] }
  }

  const getMinerChips = () =>
    _map(dataTyped?.frequency_mhz?.chips, (chip: ChipData) => {
      const tempData = _find(dataTyped?.temperature_c?.chips, { index: chip.index })

      // Only render chip if we have all required temperature data
      if (
        _isUndefined(tempData?.max) ||
        _isUndefined(tempData?.min) ||
        _isUndefined(tempData?.avg)
      ) {
        return null
      }

      return (
        <MinerChip
          key={chip.index}
          index={chip.index}
          frequency={{ current: chip.current }}
          temperature={{
            max: tempData.max,
            min: tempData.min,
            avg: tempData.avg,
          }}
        />
      )
    }).filter((chip): chip is ReactElement => chip !== null)
  const chips = getMinerChips()
  return (
    <>
      {chips.length > 0 && (
        <LabeledCard label="Chips" noMargin>
          <ChipsWrapper>{getMinerChips()}</ChipsWrapper>
        </LabeledCard>
      )}
    </>
  )
}

export default MinerChipsCard

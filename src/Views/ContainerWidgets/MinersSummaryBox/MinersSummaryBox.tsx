import _map from 'lodash/map'
import _size from 'lodash/size'
import _toNumber from 'lodash/toNumber'
import { FC } from 'react'

import {
  MinersSummaryBoxParam,
  MinersSummaryBoxParamLabel,
  MinersSummaryBoxParamValue,
  MinersSummaryBoxRoot,
} from './MinersSummaryBox.styles'

import { FALLBACK, formatValueUnit } from '@/app/utils/format'
import { convertUnits, UNIT_LABELS } from '@/app/utils/numberUtils'
import { UNITS } from '@/constants/units'

interface MinersSummaryBoxData {
  powerW?: number
  maxtemp: number | string
  avgtemp: number | string
  hashrate: number | string
}

interface MinersSummaryBoxProps {
  data: MinersSummaryBoxData
}

const PARAM_VALUE_SIZE_THRESHOLD = {
  SMALL: 12, // chars
  TINY: 15, // chars
}

export const MinersSummaryBox: FC<MinersSummaryBoxProps> = ({ data }) => {
  const { powerW, maxtemp, avgtemp, hashrate } = data

  const params = [
    {
      lbl: 'Efficiency',
      val: formatValueUnit(
        Number(powerW) / _toNumber(hashrate),
        powerW ? UNITS.EFFICIENCY_W_PER_TH_S : '',
      ),
    },
    {
      lbl: 'Hash Rate',
      val: formatValueUnit(
        convertUnits(_toNumber(hashrate), UNIT_LABELS.TERA, UNIT_LABELS.PETA),
        UNITS.HASHRATE_PH_S,
      ),
    },
    {
      lbl: 'Max Temp',
      val: maxtemp === FALLBACK ? maxtemp : `${maxtemp} ${UNITS.TEMPERATURE_C}`,
    },
    {
      lbl: 'Avg Temp',
      val: avgtemp === 0 ? FALLBACK : `${avgtemp} ${UNITS.TEMPERATURE_C}`,
    },
  ]

  return (
    <MinersSummaryBoxRoot>
      {_map(params, (param) => {
        const valSize = _size(param.val)

        return (
          <MinersSummaryBoxParam key={param.lbl}>
            <MinersSummaryBoxParamLabel
              $small={
                valSize > PARAM_VALUE_SIZE_THRESHOLD.SMALL &&
                valSize <= PARAM_VALUE_SIZE_THRESHOLD.TINY
              }
              $tiny={valSize > PARAM_VALUE_SIZE_THRESHOLD.TINY}
            >
              {param.lbl}
            </MinersSummaryBoxParamLabel>
            &nbsp;
            <MinersSummaryBoxParamValue>{param.val}</MinersSummaryBoxParamValue>
          </MinersSummaryBoxParam>
        )
      })}
    </MinersSummaryBoxRoot>
  )
}

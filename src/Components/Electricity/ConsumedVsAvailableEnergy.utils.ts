import { formatUnit } from '../../app/utils/format'
import { UNITS } from '../../constants/units'

export const formatValue = (value: number) =>
  formatUnit(
    {
      value,
      unit: UNITS.ENERGY_MWH,
    },
    { maximumFractionDigits: 3 },
  )

import { UNITS } from '@/constants/units'

export const LOOP_METRICS_DATA = [
  {
    value: 29.1,
    info: 'From tower',
    title: 'Pre-HX Temp',
    unit: UNITS.TEMPERATURE_C,
  },
  {
    value: 36.8,
    info: 'ΔT: 7.7°C',
    title: 'Post-HX Temp',
    unit: UNITS.TEMPERATURE_C,
  },
  {
    value: 100,
    info: '8 Gcal/h',
    unit: UNITS.POWER_KW,
    title: 'Tower Capacity',
  },
  {
    value: 100,
    info: 'LIT-7502',
    title: 'Tower Level',
    unit: UNITS.POWER_KW,
  },
]

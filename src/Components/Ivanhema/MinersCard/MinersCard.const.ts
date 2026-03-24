import { UNITS } from '@/constants/units'

export type MinersCardChild = {
  label: string
  value: number
  unit: string
}

export type MinersCardData = {
  rack: string
  unit: string
  power_w: number
  children: MinersCardChild[]
}

export const MINERS_CARD_DATA = [
  {
    unit: UNITS.POWER_W,
    rack: 'Rack 1-16',
    power_w: 525.74666,
    children: [
      { label: 'Power', value: 131.436, unit: UNITS.POWER_KW },
      { label: 'Voltage L1-N', value: 123.44, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L2-N', value: 123.12, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L3-N', value: 123.67, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L1-L2', value: 213.88, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L2-L3', value: 214.22, unit: UNITS.VOLTAGE_V },
      { label: 'Current L1', value: 12.34, unit: UNITS.AMPERE },
      { label: 'Current L2', value: 15.67, unit: UNITS.AMPERE },
      { label: 'Current L3', value: 9.87, unit: UNITS.AMPERE },
      { label: 'Current Neutral', value: 9.54, unit: UNITS.AMPERE },
      { label: 'Active Power Total', value: 0.01, unit: UNITS.POWER_KW },
      { label: 'Reactive Power Total', value: 0.02, unit: UNITS.POWER_KW },
    ],
  },
  {
    rack: 'Rack 17-32',
    power_w: 522.17888,
    unit: UNITS.POWER_W,
    children: [
      { label: 'Power', value: 130.88, unit: UNITS.POWER_KW },
      { label: 'Voltage L1-N', value: 123.22, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L2-N', value: 123.55, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L3-N', value: 122.98, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L1-L2', value: 213.67, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L2-L3', value: 214.01, unit: UNITS.VOLTAGE_V },
      { label: 'Current L1', value: 12.01, unit: UNITS.AMPERE },
      { label: 'Current L2', value: 15.21, unit: UNITS.AMPERE },
      { label: 'Current L3', value: 9.65, unit: UNITS.AMPERE },
      { label: 'Current Neutral', value: 9.43, unit: UNITS.AMPERE },
      { label: 'Active Power Total', value: 0.02, unit: UNITS.POWER_KW },
      { label: 'Reactive Power Total', value: 0.01, unit: UNITS.POWER_KW },
    ],
  },
  {
    rack: 'Rack 33-48',
    power_w: 531.92222,
    unit: UNITS.POWER_W,
    children: [
      { label: 'Power', value: 133.02, unit: UNITS.POWER_KW },
      { label: 'Voltage L1-N', value: 123.61, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L2-N', value: 123.33, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L3-N', value: 123.89, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L1-L2', value: 214.11, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L2-L3', value: 214.66, unit: UNITS.VOLTAGE_V },
      { label: 'Current L1', value: 12.78, unit: UNITS.AMPERE },
      { label: 'Current L2', value: 16.03, unit: UNITS.AMPERE },
      { label: 'Current L3', value: 10.11, unit: UNITS.AMPERE },
      { label: 'Current Neutral', value: 9.98, unit: UNITS.AMPERE },
      { label: 'Active Power Total', value: 0.03, unit: UNITS.POWER_KW },
      { label: 'Reactive Power Total', value: 0.02, unit: UNITS.POWER_KW },
    ],
  },
  {
    rack: 'Rack 49-64',
    power_w: 518.46666,
    unit: UNITS.POWER_W,
    children: [
      { label: 'Power', value: 129.61, unit: UNITS.POWER_KW },
      { label: 'Voltage L1-N', value: 122.88, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L2-N', value: 123.14, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L3-N', value: 122.76, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L1-L2', value: 213.52, unit: UNITS.VOLTAGE_V },
      { label: 'Voltage L2-L3', value: 213.98, unit: UNITS.VOLTAGE_V },
      { label: 'Current L1', value: 11.92, unit: UNITS.AMPERE },
      { label: 'Current L2', value: 15.08, unit: UNITS.AMPERE },
      { label: 'Current L3', value: 9.54, unit: UNITS.AMPERE },
      { label: 'Current Neutral', value: 9.31, unit: UNITS.AMPERE },
      { label: 'Active Power Total', value: 0.01, unit: UNITS.POWER_KW },
      { label: 'Reactive Power Total', value: 0.01, unit: UNITS.POWER_KW },
    ],
  },
]

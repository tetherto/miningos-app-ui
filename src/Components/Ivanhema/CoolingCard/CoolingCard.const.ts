import { UNITS } from '@/constants/units'

export type CoolingCardChild = {
  label: string
  value: number
  unit: string
}

export type CoolingCardSection = {
  name: string
  total_kw: number
  children: CoolingCardChild[]
}

export type CoolingCardData = {
  ccm: string
  unit: string
  total_power_kw: number
  sections: CoolingCardSection[]
}

export const COOLING_CARD_DATA = [
  {
    unit: UNITS.POWER_KW,
    ccm: 'CCM Principal',
    total_power_kw: 1224.3,
    sections: [
      {
        name: 'QDG - Cooling + Auxiliary Total',
        total_kw: 1203.0,
        children: [
          { label: 'Power', value: 131.44, unit: UNITS.POWER_KW },
          { label: 'Voltage L1-N', value: 123.44, unit: UNITS.VOLTAGE_V },
          { label: 'Voltage L1-L2', value: 213.44, unit: UNITS.VOLTAGE_V },
          { label: 'Current L1', value: 12.34, unit: UNITS.AMPERE },
          { label: 'Current Neutral', value: 9.87, unit: UNITS.AMPERE },
          { label: 'Active Power Total', value: 0.01, unit: UNITS.POWER_KW },
          { label: 'Reactive Power Total', value: 0.01, unit: UNITS.POWER_KW },
        ],
      },
      {
        name: 'QDI - IT Rack & QAUT Room',
        total_kw: 12.4,
        children: [
          { label: 'Power', value: 128.91, unit: UNITS.POWER_KW },
          { label: 'Voltage L1-N', value: 123.21, unit: UNITS.VOLTAGE_V },
          { label: 'Voltage L1-L2', value: 213.78, unit: UNITS.VOLTAGE_V },
          { label: 'Current L1', value: 11.98, unit: UNITS.AMPERE },
          { label: 'Current Neutral', value: 9.54, unit: UNITS.AMPERE },
          { label: 'Active Power Total', value: 0.02, unit: UNITS.POWER_KW },
          { label: 'Reactive Power Total', value: 0.01, unit: UNITS.POWER_KW },
        ],
      },
      {
        name: 'QDG - Laboratory',
        total_kw: 4.2,
        children: [
          { label: 'Power', value: 132.02, unit: UNITS.POWER_KW },
          { label: 'Voltage L1-N', value: 123.65, unit: UNITS.VOLTAGE_V },
          { label: 'Voltage L1-L2', value: 214.11, unit: UNITS.VOLTAGE_V },
          { label: 'Current L1', value: 12.67, unit: UNITS.AMPERE },
          { label: 'Current Neutral', value: 9.91, unit: UNITS.AMPERE },
          { label: 'Active Power Total', value: 0.01, unit: UNITS.POWER_KW },
          { label: 'Reactive Power Total', value: 0.02, unit: UNITS.POWER_KW },
        ],
      },
      {
        name: 'QDFL TE - Exterior Lighting',
        total_kw: 2.1,
        children: [
          { label: 'Power', value: 127.88, unit: UNITS.POWER_KW },
          { label: 'Voltage L1-N', value: 122.98, unit: UNITS.VOLTAGE_V },
          { label: 'Voltage L1-L2', value: 213.52, unit: UNITS.VOLTAGE_V },
          { label: 'Current L1', value: 11.76, unit: UNITS.AMPERE },
          { label: 'Current Neutral', value: 9.33, unit: UNITS.AMPERE },
          { label: 'Active Power Total', value: 0.01, unit: UNITS.POWER_KW },
          { label: 'Reactive Power Total', value: 0.01, unit: UNITS.POWER_KW },
        ],
      },
      {
        name: 'QDFL 1P - Interior Lighting',
        total_kw: 1.8,
        children: [
          { label: 'Power', value: 126.54, unit: UNITS.POWER_KW },
          { label: 'Voltage L1-N', value: 123.11, unit: UNITS.VOLTAGE_V },
          { label: 'Voltage L1-L2', value: 213.67, unit: UNITS.VOLTAGE_V },
          { label: 'Current L1', value: 11.54, unit: UNITS.AMPERE },
          { label: 'Current Neutral', value: 9.12, unit: UNITS.AMPERE },
          { label: 'Active Power Total', value: 0.01, unit: UNITS.POWER_KW },
          { label: 'Reactive Power Total', value: 0.01, unit: UNITS.POWER_KW },
        ],
      },
    ],
  },
]

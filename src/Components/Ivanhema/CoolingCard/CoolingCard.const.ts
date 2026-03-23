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
    unit: 'kW',
    ccm: 'CCM Principal',
    total_power_kw: 1224.3,
    sections: [
      {
        name: 'QDG - Cooling + Auxiliary Total',
        total_kw: 1203.0,
        children: [
          { label: 'Power', value: 131.44, unit: 'kW' },
          { label: 'Voltage L1-N', value: 123.44, unit: 'V' },
          { label: 'Voltage L1-L2', value: 213.44, unit: 'V' },
          { label: 'Current L1', value: 12.34, unit: 'A' },
          { label: 'Current Neutral', value: 9.87, unit: 'A' },
          { label: 'Active Power Total', value: 0.01, unit: 'kW' },
          { label: 'Reactive Power Total', value: 0.01, unit: 'kW' },
        ],
      },
      {
        name: 'QDI - IT Rack & QAUT Room',
        total_kw: 12.4,
        children: [
          { label: 'Power', value: 128.91, unit: 'kW' },
          { label: 'Voltage L1-N', value: 123.21, unit: 'V' },
          { label: 'Voltage L1-L2', value: 213.78, unit: 'V' },
          { label: 'Current L1', value: 11.98, unit: 'A' },
          { label: 'Current Neutral', value: 9.54, unit: 'A' },
          { label: 'Active Power Total', value: 0.02, unit: 'kW' },
          { label: 'Reactive Power Total', value: 0.01, unit: 'kW' },
        ],
      },
      {
        name: 'QDG - Laboratory',
        total_kw: 4.2,
        children: [
          { label: 'Power', value: 132.02, unit: 'kW' },
          { label: 'Voltage L1-N', value: 123.65, unit: 'V' },
          { label: 'Voltage L1-L2', value: 214.11, unit: 'V' },
          { label: 'Current L1', value: 12.67, unit: 'A' },
          { label: 'Current Neutral', value: 9.91, unit: 'A' },
          { label: 'Active Power Total', value: 0.01, unit: 'kW' },
          { label: 'Reactive Power Total', value: 0.02, unit: 'kW' },
        ],
      },
      {
        name: 'QDFL TE - Exterior Lighting',
        total_kw: 2.1,
        children: [
          { label: 'Power', value: 127.88, unit: 'kW' },
          { label: 'Voltage L1-N', value: 122.98, unit: 'V' },
          { label: 'Voltage L1-L2', value: 213.52, unit: 'V' },
          { label: 'Current L1', value: 11.76, unit: 'A' },
          { label: 'Current Neutral', value: 9.33, unit: 'A' },
          { label: 'Active Power Total', value: 0.01, unit: 'kW' },
          { label: 'Reactive Power Total', value: 0.01, unit: 'kW' },
        ],
      },
      {
        name: 'QDFL 1P - Interior Lighting',
        total_kw: 1.8,
        children: [
          { label: 'Power', value: 126.54, unit: 'kW' },
          { label: 'Voltage L1-N', value: 123.11, unit: 'V' },
          { label: 'Voltage L1-L2', value: 213.67, unit: 'V' },
          { label: 'Current L1', value: 11.54, unit: 'A' },
          { label: 'Current Neutral', value: 9.12, unit: 'A' },
          { label: 'Active Power Total', value: 0.01, unit: 'kW' },
          { label: 'Reactive Power Total', value: 0.01, unit: 'kW' },
        ],
      },
    ],
  },
]

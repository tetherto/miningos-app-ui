import { CHART_COLORS } from '../../constants/colors'

import { generateFakeDataset } from './utils'

import { UNITS } from '@/constants/units'
// For testing to be deleted

// Usage example:
const startDate = '2023-01-01'
const endDate = '2023-04-31'
const minRange = 500
const maxRange = 600

const fakeDataset = generateFakeDataset(startDate, endDate, minRange, maxRange)

export const PROFIT_DATA = {
  currentValueLabel: {
    value: 45,
    unit: UNITS.HASHRATE_PH_S,
  },
  minMaxAvg: {
    min: 30,
    max: 70,
    avg: 45,
  },
  secondaryValueLabel: {
    title: 'Efficiency',
    value: '96%',
  },
  datasets: [
    {
      type: 'line',
      label: 'Total Hash Rate',

      data: fakeDataset.dataset2,
      borderColor: CHART_COLORS.SKY_BLUE,
      borderWidth: 1, // adjust this to modify the line thickness
      pointRadius: 0,
    },
    {
      type: 'line',
      label: 'Cost USD',
      data: fakeDataset.dataset,
      borderColor: CHART_COLORS.red,
      borderWidth: 1, // adjust this to modify the line thickness
      pointRadius: 0,
    },
    {
      type: 'line',
      label: 'Profit USD',
      data: fakeDataset.dataset3,
      borderColor: CHART_COLORS.blue,
      borderWidth: 1, // adjust this to modify the line thickness
      pointRadius: 0,
    },
  ],
}
export const DATA = {
  currentValueLabel: {
    value: 45,
    unit: UNITS.HASHRATE_PH_S,
  },
  minMaxAvg: {
    min: 30,
    max: 70,
    avg: 45,
  },
  secondaryValueLabel: {
    title: 'Efficiency',
    value: '96%',
  },
  datasets: [
    {
      type: 'line',
      label: 'Theoretical',

      data: fakeDataset.dataset2,
      borderColor: CHART_COLORS.VIOLET,
      borderWidth: 1, // adjust this to modify the line thickness
      pointRadius: 0,
    },
    {
      type: 'line',
      label: 'Actual',
      data: fakeDataset.dataset,
      borderColor: CHART_COLORS.SKY_BLUE,
      borderWidth: 1, // adjust this to modify the line thickness
      pointRadius: 0,
    },
  ],
}

export const DOUGHNUT_DATASET = {
  Healthy: { color: '#00CA14', value: 70 },
  Warning: { color: '#FFA500', value: 20 },
  Disabled: { color: '#ACACA7', value: 10 },
  Danger: { color: '#FF0000', value: 7 },
  Pending: { color: '#0030D9', value: 3 },
}

export const DOUGHNUT_DATA = {
  dataset: DOUGHNUT_DATASET,
  label: 'Miners status',
}

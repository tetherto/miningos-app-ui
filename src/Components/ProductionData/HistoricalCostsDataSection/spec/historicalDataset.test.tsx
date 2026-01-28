import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import {
  getCostPerBtc,
  getTotalCostsByMonth,
} from '@/Components/ProductionData/HistoricalCostsDataSection/HistoricalCostsData.utils'

describe('getCostPerBtc', () => {
  const yearlyData: Array<
    Pick<import('../HistoricalCostsData.utils').CostsEntry, 'month' | 'balance'>
  > = [
    { month: 9, balance: 1.1219698679023793 },
    { month: 8, balance: 0.03441002310730085 },
    { month: 7, balance: 0.02928481884645115 },
    { month: 6, balance: 0.02648329592674117 },
    { month: 5, balance: 0.02951306618559416 },
    { month: 4, balance: 0.028039061482627532 },
    { month: 3, balance: 0.03014220697808279 },
    { month: 2, balance: 0.022556258672814994 },
    { month: 1, balance: 0.030505007828427827 },
    { month: 12, balance: 0.03263853150323618 },
    { month: 11, balance: 0.031225388603568813 },
    { month: 10, balance: 0.03578725361664738 },
  ]

  const totalCostsByMont = [
    { month: 'January 2024', value: 120, style: getBarChartItemStyle('BLUE') },
    { month: 'February 2024', value: 30, style: getBarChartItemStyle('BLUE') },
    { month: 'May 2024', value: 0, style: getBarChartItemStyle('BLUE') },
    { month: 'June 2024', value: 0, style: getBarChartItemStyle('BLUE') },
    { month: 'July 2024', value: 0, style: getBarChartItemStyle('BLUE') },
    { month: 'September 2024', value: 35.96, style: getBarChartItemStyle('BLUE') },
  ]

  const energyCostsByMonth = [
    { month: 'January 2024', value: 107, style: getBarChartItemStyle('YELLOW') },
    { month: 'February 2024', value: 21, style: getBarChartItemStyle('YELLOW') },
    { month: 'May 2024', value: 0, style: getBarChartItemStyle('YELLOW') },
    { month: 'June 2024', value: 0, style: getBarChartItemStyle('YELLOW') },
    { month: 'July 2024', value: 15, style: getBarChartItemStyle('YELLOW') },
    { month: 'September 2024', value: 45.31, style: getBarChartItemStyle('YELLOW') },
  ]

  const expectedResult = [
    {
      'October 2023': { value: 0, style: getBarChartItemStyle('BLUE') },
      'November 2023': { value: 0, style: getBarChartItemStyle('BLUE') },
      'December 2023': { value: 0, style: getBarChartItemStyle('BLUE') },
      'January 2024': { value: 3933.7803378031317, style: getBarChartItemStyle('BLUE') },
      'February 2024': { value: 1330.0078011676765, style: getBarChartItemStyle('BLUE') },
      'March 2024': { value: 0, style: getBarChartItemStyle('BLUE') },
      'April 2024': { value: 0, style: getBarChartItemStyle('BLUE') },
      'May 2024': { value: 0, style: getBarChartItemStyle('BLUE') },
      'June 2024': { value: 0, style: getBarChartItemStyle('BLUE') },
      'July 2024': { value: 0, style: getBarChartItemStyle('BLUE') },
      'August 2024': { value: 0, style: getBarChartItemStyle('BLUE') },
      'September 2024': { value: 32.0507716194111, style: getBarChartItemStyle('BLUE') },
    },
    {
      'October 2023': { value: 0, style: getBarChartItemStyle('YELLOW') },
      'November 2023': { value: 0, style: getBarChartItemStyle('YELLOW') },
      'December 2023': { value: 0, style: getBarChartItemStyle('YELLOW') },
      'January 2024': { value: 3507.6208012077927, style: getBarChartItemStyle('YELLOW') },
      'February 2024': { value: 931.0054608173734, style: getBarChartItemStyle('YELLOW') },
      'March 2024': { value: 0, style: getBarChartItemStyle('YELLOW') },
      'April 2024': { value: 0, style: getBarChartItemStyle('YELLOW') },
      'May 2024': { value: 0, style: getBarChartItemStyle('YELLOW') },
      'June 2024': { value: 0, style: getBarChartItemStyle('YELLOW') },
      'July 2024': { value: 512.2107832952418, style: getBarChartItemStyle('YELLOW') },
      'August 2024': { value: 0, style: getBarChartItemStyle('YELLOW') },
      'September 2024': { value: 40.38432875627133, style: getBarChartItemStyle('YELLOW') },
    },
  ]

  it('should return the correct dataset for cost per BTC', () => {
    const result = getCostPerBtc(yearlyData, totalCostsByMont, energyCostsByMonth)
    expect(result).toEqual(expectedResult)
  })
})

describe('getTotalCostsByMonth', () => {
  it('should return empty dataset for empty input', () => {
    expect(getTotalCostsByMonth([])).toEqual([])
  })

  it('should return correct dataset for filled input', () => {
    const style = getBarChartItemStyle('BLUE')

    expect(
      getTotalCostsByMonth([
        { month: 'a', value: 0, style },
        { month: 'b', value: 2, style },
        { month: 'c', value: 2, style },
        { month: 'd', value: 5, style },
        { month: 'e', value: 1, style },
        { month: 'f', value: 0, style },
      ]),
    ).toEqual([
      {
        month: 'a',
        value: 0,
        style,
      },
      {
        month: 'b',
        value: 2,
        style,
      },
      {
        month: 'c',
        value: 4,
        style,
      },
      {
        month: 'd',
        value: 9,
        style,
      },
      {
        month: 'e',
        value: 10,
        style,
      },
      {
        month: 'f',
        value: 10,
        style,
      },
    ])
  })
})

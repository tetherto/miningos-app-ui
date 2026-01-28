import {
  getCombinedPowerModeTimelineByMiner,
  getPowerModeTimelineDatasetObject,
} from './PowerModeTimlineChart.helper'

import { PowerModeColors } from '@/Theme/GlobalColors'

describe('getCombinedPowerModeTimelineByMiner', () => {
  it('should return an empty object when no data is provided', () => {
    const result = getCombinedPowerModeTimelineByMiner([])
    expect(result).toEqual({})
  })

  it('should correctly combine consecutive entries with the same power mode for the same miner', () => {
    const data = [
      {
        ts: 1724299140000,
        power_mode_group_aggr: { 'm221-gabbani-1-miner1': 'normal' },
        status_group_aggr: { 'm221-gabbani-1-miner1': 'mining' },
      },
      {
        ts: 1724299240000,
        power_mode_group_aggr: { 'm221-gabbani-1-miner1': 'normal' },
        status_group_aggr: { 'm221-gabbani-1-miner1': 'mining' },
      },
    ]

    const expected = {
      'm221-gabbani-1-miner1': [
        {
          ts: 1724299140000,
          miner: 'm221-gabbani-1-miner1',
          powerMode: 'normal',
          data: { from: 1724299140000, to: 1724299240000 },
        },
      ],
    }

    const result = getCombinedPowerModeTimelineByMiner(data)
    expect(result).toEqual(expected)
  })

  it('should handle different power modes for the same miner', () => {
    const data = [
      {
        ts: 1724299140000,
        power_mode_group_aggr: { 'm221-gabbani-1-miner1': 'normal' },
        status_group_aggr: { 'm221-gabbani-1-miner1': 'mining' },
      },
      {
        ts: 1724299240000,
        power_mode_group_aggr: { 'm221-gabbani-1-miner1': 'low' },
        status_group_aggr: { 'm221-gabbani-1-miner1': 'mining' },
      },
    ]

    const expected = {
      'm221-gabbani-1-miner1': [
        {
          ts: 1724299140000,
          miner: 'm221-gabbani-1-miner1',
          powerMode: 'normal',
          data: { from: 1724299140000, to: 1724299140000 },
        },
        {
          ts: 1724299240000,
          miner: 'm221-gabbani-1-miner1',
          powerMode: 'low',
          data: { from: 1724299240000, to: 1724299240000 },
        },
      ],
    }

    const result = getCombinedPowerModeTimelineByMiner(data)
    expect(result).toEqual(expected)
  })

  it('should correctly handle multiple miners', () => {
    const data = [
      {
        ts: 1724299140000,
        power_mode_group_aggr: { miner1: 'normal', miner2: 'low' },
        status_group_aggr: { miner1: 'mining', miner2: 'idle' },
      },
      {
        ts: 1724299240000,
        power_mode_group_aggr: { miner1: 'normal', miner2: 'low' },
        status_group_aggr: { miner1: 'mining', miner2: 'idle' },
      },
    ]

    const expected = {
      miner1: [
        {
          ts: 1724299140000,
          miner: 'miner1',
          powerMode: 'normal',
          data: { from: 1724299140000, to: 1724299240000 },
        },
      ],
      miner2: [
        {
          ts: 1724299140000,
          miner: 'miner2',
          powerMode: 'low',
          data: { from: 1724299140000, to: 1724299240000 },
        },
      ],
    }

    const result = getCombinedPowerModeTimelineByMiner(data)
    expect(result).toEqual(expected)
  })
})

describe('getPowerModeTimelineDatasetObject', () => {
  it('should return an empty object when no combined power mode timeline is provided', () => {
    const result = getPowerModeTimelineDatasetObject({}, 'Africa/Algiers')
    expect(result).toEqual({})
  })

  it('should correctly create a dataset object with power mode information', () => {
    const combinedPowerModeTimelineByMiner = {
      'm221-gabbani-1-miner1': [
        {
          ts: 1724299140000,
          miner: 'm221-gabbani-1-miner1',
          powerMode: 'normal',
          data: { from: 1724299140000, to: 1724299140000 },
        },
      ],
    }

    const timezone = 'Africa/Algiers'
    const offset = 3600000

    const expected = {
      normal: {
        label: 'normal',
        data: [
          {
            x: [1724299140000 + offset, 1724299140000 + offset],
            y: 'm221-gabbani-1-miner1',
          },
        ],
        borderColor: [PowerModeColors['normal']],
        backgroundColor: [PowerModeColors['normal']],
      },
    }

    const result = getPowerModeTimelineDatasetObject(combinedPowerModeTimelineByMiner, timezone)
    expect(result).toEqual(expected)
  })

  it('should apply timezone offset correctly', () => {
    const combinedPowerModeTimelineByMiner = {
      'm221-gabbani-1-miner1': [
        {
          ts: 1724299140000,
          miner: 'm221-gabbani-1-miner1',
          powerMode: 'normal',
          data: { from: 1724299140000, to: 1724299140000 },
        },
      ],
    }

    const timezone = 'Africa/Algiers'
    const offset = 3600000

    const expected = {
      normal: {
        label: 'normal',
        data: [
          {
            x: [1724299140000 + offset, 1724299140000 + offset], // Applying the offset
            y: 'm221-gabbani-1-miner1',
          },
        ],
        borderColor: [PowerModeColors['normal']],
        backgroundColor: [PowerModeColors['normal']],
      },
    }

    const result = getPowerModeTimelineDatasetObject(combinedPowerModeTimelineByMiner, timezone)
    expect(result).toEqual(expected)
  })

  it('should handle multiple power modes correctly', () => {
    const combinedPowerModeTimelineByMiner = {
      'm221-gabbani-1-miner1': [
        {
          ts: 1724299140000,
          miner: 'm221-gabbani-1-miner1',
          powerMode: 'normal',
          data: { from: 1724299140000, to: 1724299140000 },
        },
      ],
      'm221-gabbani-1-miner2': [
        {
          ts: 1724299240000,
          miner: 'm221-gabbani-1-miner2',
          powerMode: 'low',
          data: { from: 1724299240000, to: 1724299240000 },
        },
      ],
    }

    const timezone = 'Africa/Algiers'
    const offset = 3600000

    const expected = {
      normal: {
        label: 'normal',
        data: [
          {
            x: [1724299140000 + offset, 1724299140000 + offset],
            y: 'm221-gabbani-1-miner1',
          },
        ],
        borderColor: [PowerModeColors['normal']],
        backgroundColor: [PowerModeColors['normal']],
      },
      low: {
        label: 'low',
        data: [
          {
            x: [1724299240000 + offset, 1724299240000 + offset],
            y: 'm221-gabbani-1-miner2',
          },
        ],
        borderColor: [PowerModeColors['low']],
        backgroundColor: [PowerModeColors['low']],
      },
    }

    const result = getPowerModeTimelineDatasetObject(combinedPowerModeTimelineByMiner, timezone)
    expect(result).toEqual(expected)
  })
})

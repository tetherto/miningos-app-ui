import { getDeviceBarDataSet, getMinerTypeDoughnutDataSet } from '../deviceStatusReportUtils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { COMPLETE_MINER_TYPES, MINER_TYPES_COLOR_MAP } from '@/constants/deviceConstants'

describe('getDeviceBarDataSet', () => {
  it('returns an empty object if tailLogData is empty or attribute is not present', () => {
    const tailLogData: UnknownRecord[] = []
    const attribute = 'someAttribute'
    const result = getDeviceBarDataSet(tailLogData, attribute)
    expect(result).toEqual({})
  })

  it('correctly formats miner bar dataset for a valid attribute', () => {
    const tailLogData = [{ someAttribute: { miner1: 123, miner2: 456 } }]
    const attribute = 'someAttribute'
    const expectedResult = {
      miner1: { color: '#F7931A', styleKey: 'YELLOW', value: 123 },
      miner2: { color: '#F7931A', styleKey: 'YELLOW', value: 456 },
    }

    const result = getDeviceBarDataSet(tailLogData, attribute)

    expect(result).toEqual(expectedResult)
  })

  it('should not include the extra data not matched the passed labels array', () => {
    const tailLogData = [{ someAttribute: { miner1: 123, miner2: 456 } }]
    const attribute = 'someAttribute'
    const labels = ['miner1']
    const expectedResult = {
      miner1: { color: '#F7931A', styleKey: 'YELLOW', value: 123 },
    }

    const result = getDeviceBarDataSet(tailLogData, attribute, labels)

    expect(result).toEqual(expectedResult)
  })
})

describe('getMinerTypeDoughnutDataSet', () => {
  it('returns an empty object if tailLogData is empty or attribute is not present', () => {
    const tailLogData: UnknownRecord[] = []
    const attribute = 'someAttribute'

    const result = getMinerTypeDoughnutDataSet(tailLogData, attribute)

    expect(result).toEqual({})
  })

  it('correctly formats miner type doughnut dataset for a valid attribute', () => {
    const tailLogData = [
      {
        someAttribute: {
          [COMPLETE_MINER_TYPES.ANTMINER_AM_S19XP]: 123,
          [COMPLETE_MINER_TYPES.WHATSMINER_WM_30]: 456,
        },
      },
    ]
    const attribute = 'someAttribute'

    const expectedResult = {
      [COMPLETE_MINER_TYPES.ANTMINER_AM_S19XP]: {
        color: MINER_TYPES_COLOR_MAP[COMPLETE_MINER_TYPES.ANTMINER_AM_S19XP],
        value: 123,
      },
      [COMPLETE_MINER_TYPES.WHATSMINER_WM_30]: {
        color: MINER_TYPES_COLOR_MAP[COMPLETE_MINER_TYPES.WHATSMINER_WM_30],
        value: 456,
      },
    }

    const result = getMinerTypeDoughnutDataSet(tailLogData, attribute)
    expect(result).toEqual(expectedResult)
  })
})

import {
  getBitdeerContainerControlsBoxData,
  getBitdeerTemperaturePressureHumidityBoxData,
  getElectricPowerBoxData,
  groupMinersByActivity,
} from './HomeTab.util'

import { MinerStatuses, MINER_POWER_MODE } from '@/app/utils/statusUtils'

test('getBitdeerContainerControlsBoxData', () => {
  expect(getBitdeerContainerControlsBoxData()).toMatchObject({})
  expect(getBitdeerContainerControlsBoxData({ id: 1, last: null })).toMatchObject({})
  expect(getBitdeerContainerControlsBoxData({ id: 2, last: { snap: null } })).toMatchObject({})
})

test('getBitdeerTemperaturePressureHumidityBoxData', () => {
  expect(getBitdeerTemperaturePressureHumidityBoxData()).toMatchObject({})
  expect(getBitdeerTemperaturePressureHumidityBoxData({ id: 1, last: null })).toMatchObject({})
  expect(
    getBitdeerTemperaturePressureHumidityBoxData({ id: 2, last: { snap: null } }),
  ).toMatchObject({})
})

test('getElectricPowerBoxData', () => {
  expect(getElectricPowerBoxData()).toHaveLength(10)
  expect(getElectricPowerBoxData({ id: 1, last: null })).toHaveLength(10)
  expect(getElectricPowerBoxData({ id: 2, last: { snap: null } })).toHaveLength(10)
})

test('groupMinersByActivity', () => {
  const getMinimalMinerSnap = (status, powerMode) => ({
    last: {
      snap: {
        stats: {
          status: status,
        },
        config: {
          power_mode: powerMode,
        },
      },
    },
  })

  const connectedMiners = [
    getMinimalMinerSnap(MinerStatuses.MINING, MINER_POWER_MODE.SLEEP),
    getMinimalMinerSnap(MinerStatuses.OFFLINE, MINER_POWER_MODE.NORMAL),
    getMinimalMinerSnap(MinerStatuses.MINING, MINER_POWER_MODE.LOW),
    getMinimalMinerSnap(MinerStatuses.MINING, MINER_POWER_MODE.NORMAL),
    getMinimalMinerSnap(MinerStatuses.SLEEPING, MINER_POWER_MODE.HIGH),
    getMinimalMinerSnap(MinerStatuses.OFFLINE, MINER_POWER_MODE.HIGH),
    getMinimalMinerSnap(MinerStatuses.SLEEPING, MINER_POWER_MODE.SLEEP),
  ]

  expect(groupMinersByActivity(connectedMiners)).toEqual({
    [MINER_POWER_MODE.HIGH]: 1,
    [MINER_POWER_MODE.NORMAL]: 1,
    [MINER_POWER_MODE.LOW]: 1,
    [MINER_POWER_MODE.SLEEP]: 2,
    [MinerStatuses.OFFLINE]: 2,
    total: 7,
  })
})

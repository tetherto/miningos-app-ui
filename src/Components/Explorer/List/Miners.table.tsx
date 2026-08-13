import Tooltip from 'antd/es/tooltip'
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict'
import _isUndefined from 'lodash/isUndefined'

import { ERROR_MESSAGES } from './ListView.const'
import {
  ColWidth,
  CommonColWidth,
  DangerDeviceCardColText,
  DeviceCardColText,
  EfficiencyColWidth,
  FWWidth,
  HashrateColWidth,
  LedColWidth,
  MaxHashrateColWidth,
  StatusColWidth,
  WarningDeviceCardColText,
  Wrapper,
} from './ListView.styles'
import Power from './MinerCard/Icons/Power'
import {
  ColoredPowerIconContainer,
  HashrateWrapper,
  LEDStatusIndicator,
} from './MinerCard/MinerCard.styles'
import MinerStatusIndicator from './MinerStatusIndicator/MinerStatusIndicator'

import type { Alert } from '@/app/utils/alertUtils'
import {
  formatPowerConsumption,
  getHashrateString,
  getMinerName,
  getOnOffText,
  getPowerModeColor,
  isMinerOffline,
  megaToTera,
  type Device,
} from '@/app/utils/deviceUtils'
import { formatMacAddress, formatNumber, formatValueUnit } from '@/app/utils/format'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'
import { UNITS } from '@/constants/units'

const CELL_MIN_WIDTH = 120

interface HashrateMhs {
  t_5m?: number
}

interface Stats {
  status?: string
  uptime_ms?: number
  power_w?: number
  hashrate_mhs?: HashrateMhs
  poolHashrate?: string
  temperature_c?: { max?: number }
}

interface Config {
  firmware_ver?: string
  power_mode?: string
  led_status?: boolean
}

interface Info {
  container?: string
  pos?: string
  macAddress?: string
  serialNum?: string
}

interface DeviceSnapshot {
  last?: { snap?: { config?: Config } }
}

export interface MinerRecord {
  id?: string
  shortCode?: string
  info?: Info
  address?: string
  type?: string
  alerts?: unknown[]
  stats?: Stats
  config?: Config
  device?: DeviceSnapshot
  error?: string
  err?: string
  isPoolStatsEnabled?: boolean
}

export const getMinersTableColumns = () => [
  {
    title: 'Code',
    key: 'shortCode',
    dataIndex: 'shortCode',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${getMinerName(a?.type || '')}`.localeCompare(`${getMinerName(b?.type || '')}`),
    render: (text: string) => (
      <ColWidth>
        <DeviceCardColText>{text}</DeviceCardColText>
      </ColWidth>
    ),
  },
  {
    title: 'Container',
    key: 'container',
    dataIndex: 'container',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.info?.container}`.localeCompare(`${b?.info?.container}`),
    render: (containerName: string, deviceRecord: MinerRecord) => {
      const { err, error } = deviceRecord

      return (
        <EfficiencyColWidth>
          {containerName === MAINTENANCE_CONTAINER ? (
            <WarningDeviceCardColText>Maintenance</WarningDeviceCardColText>
          ) : (
            <DeviceCardColText>{containerName}</DeviceCardColText>
          )}
          {(error || err) && (
            <DangerDeviceCardColText>
              {err ? ERROR_MESSAGES[err as keyof typeof ERROR_MESSAGES] || err : error || err}
            </DangerDeviceCardColText>
          )}
        </EfficiencyColWidth>
      )
    },
  },
  {
    title: 'POS',
    key: 'position',
    dataIndex: 'position',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) => `${a?.info?.pos}`.localeCompare(`${b?.info?.pos}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { info } = deviceRecord
      return <CommonColWidth>{info?.pos}</CommonColWidth>
    },
  },
  {
    title: 'SN',
    key: 'serialNum',
    dataIndex: 'serialNum',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.info?.serialNum}`.localeCompare(`${b?.info?.serialNum}`),
    render: (serialNum: string) => <ColWidth>{serialNum}</ColWidth>,
  },
  {
    title: 'MAC',
    key: 'macAddress',
    dataIndex: 'macAddress',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.info?.macAddress}`.localeCompare(`${b?.info?.macAddress}`),
    render: (macAddress: string | undefined) => (
      <ColWidth>{macAddress ? formatMacAddress(macAddress) : '-'}</ColWidth>
    ),
  },
  {
    title: 'IP',
    key: 'ip',
    dataIndex: 'ip',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) => `${a?.address}`.localeCompare(`${b?.address}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { address } = deviceRecord

      return <CommonColWidth>{address}</CommonColWidth>
    },
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.stats?.status}`.localeCompare(`${b?.stats?.status}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { stats, alerts } = deviceRecord
      const alertsArray: Alert[] = Array.isArray(alerts) ? (alerts as Alert[]) : []
      const statsForIndicator = stats as
        | import('@/app/utils/deviceUtils/types').UnknownRecord
        | undefined

      return (
        <Wrapper>
          <MinerStatusIndicator stats={statsForIndicator} alerts={alertsArray} />
          <StatusColWidth>{String(stats?.status || '')}</StatusColWidth>
        </Wrapper>
      )
    },
  },
  {
    title: 'Power Mode',
    key: 'powerMode',
    dataIndex: 'powerMode',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.config?.power_mode?.localeCompare(b?.config?.power_mode || '')}`,
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, err, device } = deviceRecord
      const power_mode = device?.last?.snap?.config?.power_mode

      return error || err || (device && isMinerOffline(device as unknown as Device)) ? (
        <CommonColWidth>-</CommonColWidth>
      ) : (
        <Wrapper>
          <ColoredPowerIconContainer
            color={getPowerModeColor(
              (power_mode || '') as keyof typeof import('@/Theme/GlobalColors').PowerModeColors,
            )}
          >
            <Power />
          </ColoredPowerIconContainer>
          <CommonColWidth>{power_mode}</CommonColWidth>
        </Wrapper>
      )
    },
  },
  {
    title: 'Elapsed',
    key: 'elapsedTime',
    dataIndex: 'elapsedTime',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.stats?.uptime_ms}`.localeCompare(`${b?.stats?.uptime_ms}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, stats, err, device } = deviceRecord

      return error || err || (device && isMinerOffline(device as unknown as Device)) ? (
        <ColWidth>-</ColWidth>
      ) : (
        <ColWidth>
          {stats?.uptime_ms
            ? formatDistanceStrict(new Date(Date.now() - (stats.uptime_ms ?? 0)), new Date(), {
                addSuffix: true,
              })
            : '-'}
        </ColWidth>
      )
    },
  },
  {
    title: 'Consumption',
    key: 'consumption',
    dataIndex: 'consumption',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.stats?.power_w}`.localeCompare(`${b?.stats?.power_w}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, stats, err, device } = deviceRecord
      const power_w = stats?.power_w ?? 0
      const { value, unit } = formatPowerConsumption(power_w)

      const displayValue =
        unit === UNITS.POWER_KW
          ? formatNumber(value ?? 0, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : (value ?? 0)

      return error || err || (device && isMinerOffline(device as unknown as Device)) ? (
        <ColWidth>-</ColWidth>
      ) : (
        <ColWidth>{power_w > 0 ? `${displayValue} ${unit}` : '-'}</ColWidth>
      )
    },
  },
  {
    title: 'Hashrate',
    key: 'hashrate',
    dataIndex: 'hashrate',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.stats?.hashrate_mhs?.t_5m}`.localeCompare(`${b?.stats?.hashrate_mhs?.t_5m}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, stats, err, device } = deviceRecord
      const hashRate = stats?.hashrate_mhs?.t_5m ?? 0
      const formattedHashRate = getHashrateString(hashRate)

      return error || err || (device && isMinerOffline(device as unknown as Device)) ? (
        <CommonColWidth>-</CommonColWidth>
      ) : (
        <CommonColWidth>
          <HashrateWrapper>{stats?.hashrate_mhs ? formattedHashRate : '-'}</HashrateWrapper>
        </CommonColWidth>
      )
    },
  },
  {
    title: 'Efficiency',
    key: 'efficiency',
    dataIndex: 'efficiency',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) => {
      const aPower = a?.stats?.power_w ?? 0
      const aHash = megaToTera(a?.stats?.hashrate_mhs?.t_5m ?? 0)
      const bPower = b?.stats?.power_w ?? 0
      const bHash = megaToTera(b?.stats?.hashrate_mhs?.t_5m ?? 0)
      const aEfficiency = aHash > 0 ? aPower / aHash : 0
      const bEfficiency = bHash > 0 ? bPower / bHash : 0
      return `${aEfficiency}`.localeCompare(`${bEfficiency}`)
    },
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, stats, err, device } = deviceRecord
      const hashRate = stats?.hashrate_mhs?.t_5m

      return error || err || (device && isMinerOffline(device as unknown as Device)) ? (
        <EfficiencyColWidth>-</EfficiencyColWidth>
      ) : (
        <EfficiencyColWidth>
          {!stats?.power_w || !hashRate || hashRate <= 0
            ? '-'
            : formatValueUnit(stats?.power_w / megaToTera(hashRate), UNITS.EFFICIENCY_W_PER_TH_S)}
        </EfficiencyColWidth>
      )
    },
  },
  {
    title: 'Pool Hashrate',
    key: 'poolHashrate',
    dataIndex: 'poolHashrate',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.stats?.poolHashrate}`.localeCompare(`${b?.stats?.poolHashrate}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, stats, err, isPoolStatsEnabled, device } = deviceRecord

      const isEmpty =
        !isPoolStatsEnabled ||
        !stats?.poolHashrate ||
        error ||
        err ||
        (device && isMinerOffline(device as unknown as Device))

      const content = isEmpty ? (
        '-'
      ) : (
        <HashrateWrapper>
          <Tooltip title="Pool Hashrate">{stats?.poolHashrate}</Tooltip>
        </HashrateWrapper>
      )

      return <HashrateColWidth>{content}</HashrateColWidth>
    },
  },
  {
    title: 'FW Version',
    key: 'fwVersion',
    dataIndex: 'fwVersion',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.config?.firmware_ver}`.localeCompare(`${b?.config?.firmware_ver}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, config, err, device } = deviceRecord

      return error || err || (device && isMinerOffline(device as unknown as Device)) ? (
        <FWWidth>-</FWWidth>
      ) : (
        <FWWidth>{config?.firmware_ver || '-'}</FWWidth>
      )
    },
  },
  {
    title: 'LED',
    key: 'ledStatus',
    dataIndex: 'ledStatus',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.config?.led_status}`.localeCompare(`${b?.config?.led_status}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, config, err, device } = deviceRecord

      const isError =
        error ||
        err ||
        (device && isMinerOffline(device as unknown as Device)) ||
        _isUndefined(config?.led_status)

      return isError ? (
        <LedColWidth>-</LedColWidth>
      ) : (
        <LedColWidth>
          <LEDStatusIndicator $on={config?.led_status}>
            {getOnOffText(config?.led_status)}
          </LEDStatusIndicator>
        </LedColWidth>
      )
    },
  },
  {
    title: 'Max Temp',
    key: 'temperature',
    dataIndex: 'temperature',
    minWidth: CELL_MIN_WIDTH,
    sorter: (a: MinerRecord, b: MinerRecord) =>
      `${a?.stats?.temperature_c?.max}`.localeCompare(`${b?.stats?.temperature_c?.max}`),
    render: (_text: unknown, deviceRecord: MinerRecord) => {
      const { error, stats, err, device } = deviceRecord

      return error || err || (device && isMinerOffline(device as unknown as Device)) ? (
        <MaxHashrateColWidth>-</MaxHashrateColWidth>
      ) : (
        <MaxHashrateColWidth>
          {stats?.temperature_c?.max ? `${stats?.temperature_c?.max} °C` : '-'}
        </MaxHashrateColWidth>
      )
    },
  },
]

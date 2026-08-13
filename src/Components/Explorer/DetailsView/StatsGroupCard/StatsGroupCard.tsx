import { formatDistanceStrict } from 'date-fns/formatDistanceStrict'
import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _isEqual from 'lodash/isEqual'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _replace from 'lodash/replace'
import _size from 'lodash/size'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import MinerMetricCard from '../MinerMetricCard/MinerMetricCard'
import SecondaryStatCard from '../SecondaryStatCard/SecondaryStatCard'
import SingleStatCard from '../SingleStatCard/SingleStatCard'

import { StatsRow, StatsRowWrapper } from './StatsGroupCard.styles'

import { selectSelectedDevices } from '@/app/slices/devicesSlice'
import {
  formatPowerConsumption,
  getDeviceData,
  getHashrateUnit,
  getIsMinerPowerReadingAvailable,
  getOnOffText,
  megaToTera,
  isMiner,
} from '@/app/utils/deviceUtils'
import type { Device, DeviceData } from '@/app/utils/deviceUtils/types'
import { UNITS } from '@/constants/units'

const getMinersStats = (devices: DeviceData[] | Device[] | undefined) => {
  const stats = {
    hashRate: 0,
    temperature: Number.MIN_SAFE_INTEGER,
    frequency: 0,
    consumption: 0,
  }
  let totalAvgFrequency = 0
  _forEach(devices, (device: DeviceData | Device) => {
    const [err, deviceStats] = getDeviceData(device as Device)

    if (!err && deviceStats) {
      const { snap, type } = deviceStats
      const hashrateMhs = snap?.stats?.hashrate_mhs as { t_5m?: number } | undefined
      if (hashrateMhs?.t_5m) {
        stats.hashRate += hashrateMhs.t_5m
      }
      const tempC = snap?.stats?.temperature_c as { max?: number } | undefined
      if (tempC?.max && tempC.max > stats.temperature) {
        stats.temperature = tempC.max
      }
      const freqMhz = snap?.stats?.frequency_mhz as { avg?: number } | undefined
      if (freqMhz?.avg) {
        totalAvgFrequency += freqMhz.avg
      }
      const powerW = snap?.stats?.power_w as number | undefined
      if (powerW) {
        stats.consumption += powerW
      }
      if (type && !getIsMinerPowerReadingAvailable(type)) {
        stats.consumption = 0
      }
    }
  })
  stats.frequency = totalAvgFrequency / (devices?.length ?? 1)
  return stats
}

interface StatItem {
  name: string
  value: string | number | null
  unit: string
  tooltipText?: string
}

interface StatsGroupCardProps {
  miners?: DeviceData[] | Device[]
  isMinerMetrics?: boolean
}

const StatsGroupCard = ({ miners, isMinerMetrics }: StatsGroupCardProps) => {
  const selectedDevices = useSelector(selectSelectedDevices)

  const devicesToUse = miners || (selectedDevices as DeviceData[] | Device[] | undefined)
  const numMinersSelected = _size(
    _filter(selectedDevices, (device: Device) => device && isMiner(device.type)),
  )

  const [stats, setStats] = useState<StatItem[]>([
    { name: 'Hash rate', value: '', unit: 'TH/s' },
    { name: 'Temperature', value: '', unit: 'C' },
    { name: 'Frequency', value: '', unit: 'MHz' },
    { name: 'Consumption', value: '', unit: 'W' },
  ])

  const [secstats, setSecstats] = useState<StatItem[]>([
    { name: 'Power mode', value: '', unit: '' },
    { name: 'Uptime', value: '', unit: '' },
    { name: 'LED', value: '', unit: '' },
    { name: 'Status', value: '', unit: '' },
  ])

  useEffect(() => {
    setSelectedDevicesStats()
  }, [devicesToUse])

  const setSelectedDevicesStats = () => {
    const { hashRate, temperature, frequency, consumption } = getMinersStats(devicesToUse)
    const formattedHashRate = getHashrateUnit(hashRate)
    const formattedConsumption = formatPowerConsumption(consumption)
    const newStats = [
      {
        name: 'Hash rate',
        value: formattedHashRate?.value || '-',
        unit: formattedHashRate?.unit,
      },
      {
        name: 'Temperature',
        value: temperature !== Number.MIN_SAFE_INTEGER ? temperature : '-',
        unit: UNITS.TEMPERATURE_C,
        tooltipText: 'Max Miners Temperature',
      },
      {
        name: 'Frequency',
        value: frequency || '-',
        unit: 'MHz',
      },
    ]
    if (consumption) {
      newStats.push({
        name: 'Consumption',
        value: formattedConsumption?.value || '-',
        unit: formattedConsumption?.unit,
      })
    }
    if (consumption && hashRate && hashRate > 0) {
      newStats.push({
        name: 'Efficiency',
        value: String(consumption / megaToTera(hashRate)),
        unit: UNITS.EFFICIENCY_W_PER_TH_S,
      })
    }
    setStats(newStats)

    const singleDevice: Device | null | undefined =
      devicesToUse && devicesToUse.length > 0
        ? (_head(devicesToUse as Array<Device | DeviceData>) as Device | DeviceData | undefined as
            | Device
            | undefined)
        : undefined
    const [err, deviceStats] = getDeviceData(singleDevice ?? null)

    if (!err && deviceStats) {
      const { snap } = deviceStats
      const config = snap?.config as { power_mode?: string; led_status?: boolean } | undefined
      const stats = snap?.stats as { uptime_ms?: number; status?: string } | undefined
      setSecstats([
        { name: 'Power mode', value: config?.power_mode ?? '-', unit: '' },
        {
          name: 'Uptime',
          value: stats?.uptime_ms
            ? _replace(
                formatDistanceStrict(new Date(Date.now() - stats.uptime_ms), new Date(), {
                  addSuffix: true,
                }),
                'minute',
                'min',
              )
            : '-',
          unit: '',
        },
        {
          name: 'LED',
          value: getOnOffText(config?.led_status),
          unit: '',
        },
        { name: 'Status', value: stats?.status ?? '-', unit: '' },
      ])
    }
  }

  const primaryStatsForMinerMetric = stats.map((s) => ({
    name: s.name,
    value: !_isNil(s.value) ? s.value : undefined,
    unit: s.unit,
  }))
  const secondaryStatsForMinerMetric = secstats.map((s) => ({
    name: s.name,
    value: !_isNil(s.value) ? s.value : undefined,
    unit: s.unit,
  }))

  return isMinerMetrics ? (
    <MinerMetricCard
      primaryStats={primaryStatsForMinerMetric}
      secondaryStats={secondaryStatsForMinerMetric}
      showSecondaryStats={numMinersSelected === 1}
    />
  ) : (
    <StatsRowWrapper>
      <StatsRow>
        {_map(stats, (stat: StatItem) => (
          <SingleStatCard key={stat.name} {...stat} />
        ))}
      </StatsRow>
      {_isEqual(_size(devicesToUse), 1) && (
        <StatsRow>
          {_map(secstats, (stat: StatItem) => {
            // Convert null to undefined for SecondaryStatCard which doesn't accept null
            const statProps = {
              ...stat,
              value: stat.value ?? undefined,
            }
            return <SecondaryStatCard key={stat.name} {...statProps} />
          })}
        </StatsRow>
      )}
    </StatsRowWrapper>
  )
}

export default StatsGroupCard

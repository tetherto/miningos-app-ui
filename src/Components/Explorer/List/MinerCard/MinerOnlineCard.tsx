import Tooltip from 'antd/es/tooltip'
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict'
import { type FC } from 'react'

import Efficiency from '../../../Farms/FarmCard/StatBox/Icons/Efficiency'
import IconRow from '../IconRow/IconRow'
import { DeviceCardColText } from '../ListView.styles'
import MinerStatusIndicator from '../MinerStatusIndicator/MinerStatusIndicator'

import HashRateIcon from './Icons/HashRate'
import Power from './Icons/Power'
import { TemperatureIndicator } from './Icons/TemperatureIndicator'
import {
  ColoredPowerIconContainer,
  HashrateWrapper,
  LEDStatusIndicator,
  MinedCardSecondaryText,
} from './MinerCard.styles'
import { MinerCol } from './MinerCol'

import { useGetFeatureConfigQuery } from '@/app/services/api'
import type { Alert } from '@/app/utils/alertUtils'
import {
  formatPowerConsumption,
  getHashrateString,
  getOnOffText,
  getPowerModeColor,
  megaToTera,
} from '@/app/utils/deviceUtils'
import type { DeviceInfo, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatValueUnit } from '@/app/utils/format'
import { WEBAPP_NAME } from '@/constants/index'
import { UNITS } from '@/constants/units'

interface MinerOnlineCardProps {
  info?: DeviceInfo
  stats?: UnknownRecord
  config?: UnknownRecord
  address?: string
  alerts?: Alert[]
  rack?: string
}

export const MinerOnlineCard: FC<MinerOnlineCardProps> = ({
  info,
  stats,
  config,
  address,
  alerts,
}) => {
  const { data: featureConfig } = useGetFeatureConfigQuery(undefined)
  const isPoolStatsEnabled = (featureConfig as { poolStats?: boolean })?.poolStats
  const hashrateMhs = stats?.hashrate_mhs as { t_5m?: number } | undefined
  const hashRate = hashrateMhs?.t_5m
  const formattedHashRate = getHashrateString(hashRate ?? 0)
  const formattedConsumption = formatPowerConsumption((stats?.power_w as number) ?? 0)
  const getEfficiencyValue = () => {
    const powerW = stats?.power_w as number | undefined
    if (!powerW || !hashRate || hashRate <= 0) return ''
    return formatValueUnit(powerW / megaToTera(hashRate), UNITS.EFFICIENCY_W_PER_TH_S)
  }

  return (
    <>
      <MinerCol
        lg={2}
        sm={3}
        xs={2}
        dataRow1={
          <Tooltip title="Position">
            <DeviceCardColText>{info?.pos}</DeviceCardColText>
          </Tooltip>
        }
      />
      <MinerCol
        lg={6}
        sm={8}
        xs={12}
        dataRow1={
          <Tooltip title="IP Address">
            <DeviceCardColText>{address}</DeviceCardColText>
          </Tooltip>
        }
        dataRow2={<DeviceCardColText>{config?.firmware_ver as string}</DeviceCardColText>}
      />
      <MinerCol
        lg={4}
        sm={12}
        xs={12}
        dataRow1={
          <IconRow
            icon={<HashRateIcon />}
            text={
              <DeviceCardColText>
                <HashrateWrapper>
                  <Tooltip title={`${WEBAPP_NAME} Hashrate`}>
                    {hashRate ? formattedHashRate : null}
                  </Tooltip>
                  {isPoolStatsEnabled && (
                    <>
                      |<Tooltip title="Pool Hashrate">{String(stats?.poolHashrate || '')}</Tooltip>
                    </>
                  )}
                </HashrateWrapper>
              </DeviceCardColText>
            }
          />
        }
        dataRow2={
          <IconRow
            icon={<TemperatureIndicator />}
            text={
              <Tooltip title="Max Temperature">
                <DeviceCardColText>
                  {(stats?.temperature_c as { max?: number })?.max} °C
                </DeviceCardColText>
              </Tooltip>
            }
          />
        }
      />
      <MinerCol
        lg={2}
        sm={8}
        xs={12}
        dataRow1={
          <IconRow
            icon={
              <Tooltip title={`Power mode : ${config?.power_mode ? config?.power_mode : '-'}`}>
                <ColoredPowerIconContainer
                  color={getPowerModeColor(
                    config?.power_mode as keyof typeof import('@/Theme/GlobalColors').PowerModeColors,
                  )}
                >
                  <Power />
                </ColoredPowerIconContainer>
              </Tooltip>
            }
            text={
              <Tooltip title={`Power mode : ${config?.power_mode ? config?.power_mode : '-'}`}>
                <DeviceCardColText>
                  {stats?.power_w
                    ? formattedConsumption?.value + ' ' + formattedConsumption?.unit
                    : '-'}
                </DeviceCardColText>
              </Tooltip>
            }
          />
        }
        dataRow2={
          <IconRow
            icon={<Efficiency />}
            text={
              <Tooltip title="Efficiency">
                <DeviceCardColText>{getEfficiencyValue()}</DeviceCardColText>
              </Tooltip>
            }
          />
        }
      />
      <MinerCol
        lg={3}
        sm={7}
        dataRow1={
          <IconRow
            icon={<MinerStatusIndicator alerts={alerts || []} stats={stats} />}
            text={
              <MinedCardSecondaryText>
                {stats?.uptime_ms
                  ? formatDistanceStrict(
                      new Date(Date.now() - (stats?.uptime_ms as number)),
                      new Date(),
                      {
                        addSuffix: true,
                      },
                    )
                  : null}
              </MinedCardSecondaryText>
            }
          />
        }
        dataRow2={<DeviceCardColText>{String(stats?.status || '')}</DeviceCardColText>}
      />
      <MinerCol
        lg={1}
        md={4}
        dataRow1={
          <IconRow
            icon={
              <LEDStatusIndicator $on={config?.led_status as boolean}>
                {getOnOffText(config?.led_status as boolean)}
              </LEDStatusIndicator>
            }
            text=""
          />
        }
        dataRow2={<DeviceCardColText>LED</DeviceCardColText>}
      />
    </>
  )
}

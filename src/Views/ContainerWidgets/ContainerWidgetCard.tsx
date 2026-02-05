import _get from 'lodash/get'
import { MouseEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { BitmainImmersionSummaryBox } from './BitmainImmersion/BitmainImmersionSummaryBox'
import {
  getContainerMinersChartData,
  getMinersSummaryBoxData,
  getSupplyLiquidBoxItems,
  getTanksBoxData,
  isCirculatingPumpActive,
  MinerTailLogItem,
  getWidgetAlarmState,
  ContainerSettings,
} from './ContainerWidget.util'
import { ContainerWidgetCardRoot } from './ContainerWidgetCard.styles'
import { ErrorMessage, OfflineMessage } from './ContainerWidgets.styles'
import { Offline } from './Icons/Offline'
import { MicroBtSummaryBox } from './MicroBT/MicroBtSummaryBox'
import { MicroBTWidgetBox } from './MicroBT/MicroBTWidgetBox'
import { MinersSummaryBox } from './MinersSummaryBox/MinersSummaryBox'
import { SupplyLiquidBox } from './SupplyLiquidBox/SupplyLiquidBox'
import { TanksBox, TanksBoxProps } from './TanksBox/TanksBox'

import { getProcessedAlarms } from '@/app/utils/alertUtils'
import {
  getContainerName,
  isAntspaceHydro,
  isBitdeer,
  isBitmainImmersion,
  isMicroBT,
} from '@/app/utils/containerUtils'
import { appendContainerToTag, Device } from '@/app/utils/deviceUtils'
import { CONTAINER_STATUS, DEVICE_STATUS } from '@/app/utils/statusUtils'
import { ErrorWithTimestamp } from '@/app/utils/utils.types'
import { DeviceStatus } from '@/Components/DeviceStatus/DeviceStatus'
import {
  MinerActivityChartErrorProp,
  MinersActivityChart,
  MinersActivityData,
} from '@/Components/Explorer/DetailsView/MinersActivityChart/MinersActivityChart'
import { WidgetTopRow } from '@/Components/Widgets/WidgetTopRow'
import { ROUTE } from '@/constants/routes'
import { UNITS } from '@/constants/units'
import type { Alert } from '@/hooks/hooks.types'
import useTimezone from '@/hooks/useTimezone'

interface ContainerInfo {
  container: string
  nominalMinerCapacity?: string | number
}

interface ContainerLastStats {
  status?: string
  power_w?: number
  error_msg?: string
}

interface ContainerLast {
  err?: string
  snap?: {
    stats?: ContainerLastStats
  }
  alerts?: {
    name?: string
    description?: string
    severity?: string
  }[]
}

export interface Container {
  type: string
  info: ContainerInfo
  last?: ContainerLast
}

interface ContainerWidgetCardProps {
  container: Device
  containerSettings?: ContainerSettings | null
  minerTailLogItem?: MinerTailLogItem
  isMinerTailLogLoading?: boolean
  isMinerTailLogError?: boolean
  minerTailLogError?: { data?: { message?: string }; [key: string]: unknown } | null
}

export const ContainerWidgetCard = ({
  container,
  containerSettings: matchedSettings,
  minerTailLogItem,
  isMinerTailLogLoading,
  isMinerTailLogError,
  minerTailLogError,
}: ContainerWidgetCardProps) => {
  const navigate = useNavigate()
  const { getFormattedDate } = useTimezone()
  const [minersStatusData, setMinersStatusData] = useState<MinersActivityData>({})

  const containerModel = container.info?.container as string

  const isBitDeerContainer = isBitdeer(containerModel)
  const isAntspaceHydroContainer = isAntspaceHydro(containerModel)
  const isMicroBTContainer = isMicroBT(containerModel)
  const isBitmainImmersionContainer = isBitmainImmersion(containerModel)

  const error = _get(container, ['last', 'err'])
  const isOffline =
    _get(container, ['last', 'snap', 'stats', 'status']) === CONTAINER_STATUS.OFFLINE
  const alarms = _get(container, ['last', 'alerts']) as Alert[] | undefined
  const processedAlarms = getProcessedAlarms(alarms, getFormattedDate)

  const statsErrorMessage = _get(container, ['last', 'snap', 'stats', 'error_msg']) as
    | string
    | ErrorWithTimestamp[]
    | null
  const powerW = _get(container, ['last', 'snap', 'stats', 'power_w']) as number | undefined

  const containerData = getMinersSummaryBoxData(containerModel, minerTailLogItem ?? {})

  const onCardClicked = (event: MouseEvent<HTMLDivElement>, container: Container) => {
    event.stopPropagation()
    const prefixPath = `${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/`
    const tagPath = appendContainerToTag(container?.info?.container)
    const suffixPath = `/home?backUrl=${ROUTE.OPERATIONS_MINING_SITE_OVERVIEW}/container-widgets`

    navigate(`${prefixPath}${tagPath}${suffixPath}`)
  }

  useEffect(() => {
    if (!container?.info || !minerTailLogItem) return
    const data = getContainerMinersChartData(
      container.info?.container as string,
      minerTailLogItem,
      container?.info?.nominalMinerCapacity as number,
    )
    setMinersStatusData(data)
  }, [container, minerTailLogItem])

  return (
    <ContainerWidgetCardRoot
      onClick={(event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) =>
        onCardClicked(event, container as Container)
      }
      $flash={getWidgetAlarmState(container, matchedSettings).shouldFlash}
    >
      <WidgetTopRow
        alarms={processedAlarms}
        title={getContainerName(containerModel, container.type)}
        power={powerW}
        statsErrorMessage={statsErrorMessage}
        unit={UNITS.POWER_KW}
      />
      {isOffline && (
        <OfflineMessage>
          <Offline /> Offline
        </OfflineMessage>
      )}
      {!!error && <ErrorMessage>{error}</ErrorMessage>}
      {!isOffline && !error && (
        <>
          {isBitDeerContainer && (
            <TanksBox
              data={getTanksBoxData(container, matchedSettings) as unknown as TanksBoxProps['data']}
            />
          )}
          {isAntspaceHydroContainer && (
            <>
              <SupplyLiquidBox items={getSupplyLiquidBoxItems(container, matchedSettings)} />
              <DeviceStatus
                title="Circulating Pump"
                status={
                  isCirculatingPumpActive(container) ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF
                }
                isRow
                secondary
              />
            </>
          )}
          {isMicroBTContainer && (
            <>
              <MicroBTWidgetBox data={container} />
              <MicroBtSummaryBox data={container} containerSettings={matchedSettings} />
            </>
          )}
          {isBitmainImmersionContainer && (
            <BitmainImmersionSummaryBox data={container} containerSettings={matchedSettings} />
          )}
          <MinersSummaryBox data={{ ...containerData, powerW }} />
          <MinersActivityChart
            data={minersStatusData}
            isLoading={isMinerTailLogLoading}
            isError={isMinerTailLogError}
            error={minerTailLogError as MinerActivityChartErrorProp}
          />
        </>
      )}
    </ContainerWidgetCardRoot>
  )
}

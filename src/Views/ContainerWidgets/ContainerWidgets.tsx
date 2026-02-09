import _head from 'lodash/head'
import _map from 'lodash/map'
import _some from 'lodash/some'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useGetListThingsQuery, useGetTailLogQuery } from '../../app/services/api'
import { devicesSlice } from '../../app/slices/devicesSlice'
import { CONTAINER_LIST_THINGS_LIMIT, getByTagsQuery } from '../../app/utils/queryUtils'
import { Title } from '../../Components/Shared'
import { Spinner } from '../../Components/Spinner/Spinner'
import { POLLING_5s } from '../../constants/pollingIntervalConstants'
import { STAT_REALTIME } from '../../constants/tailLogStatKeys.constants'
import { useBeepSound } from '../../hooks/useBeep'
import { useSmartPolling } from '../../hooks/useSmartPolling'

import type { Container, ContainerSettings, MinerTailLogItem } from './ContainerWidget.util'
import { getWidgetAlarmState } from './ContainerWidget.util'
import { ContainerWidgetCard } from './ContainerWidgetCard'
import ContainerWidgetConfirmationModal from './ContainerWidgetConfirmationModal'
import { ContainerWidgetsRoot, ContainersWrapper } from './ContainerWidgets.styles'

import { isDemoMode } from '@/app/services/api.utils'
import { findMatchingContainer } from '@/app/utils/containerThresholdsHelpers'
import type { Device } from '@/app/utils/deviceUtils'
import { useAllContainerSettings } from '@/hooks/useContainerSettings'

const { setResetSelections } = devicesSlice.actions

const ESCAPE_KEY = 'Escape'
const KEYDOWN_EVENT = 'keydown'

interface TailLogItem {
  offline_cnt?: number
  error_cnt?: number
  power_mode_sleep_cnt?: number
  power_mode_low_cnt?: number
  power_mode_normal_cnt?: number
  power_mode_high_cnt?: number
  hashrate_mhs_1m_group_sum?: number
  temperature_c_group_max?: number
  temperature_c_group_avg?: number
}

const ALERT_CONFIRMATION_KEY = 'containerWidgetAlertConfirmed'

const ContainerWidgets = () => {
  const smartPolling5s = useSmartPolling(POLLING_5s)
  const dispatch = useDispatch()
  const [confirmed, setConfirmed] = useState(
    () =>
      // Check sessionStorage to see if user already confirmed
      sessionStorage.getItem(ALERT_CONFIRMATION_KEY) === 'true',
  )

  // Get all container settings to match with containers
  const { containerSettings: allContainerSettings, isLoading: isContainerSettingsLoading } =
    useAllContainerSettings()

  const { data: containers, isLoading: isContainersLoading } = useGetListThingsQuery(
    {
      query: getByTagsQuery(['t-container']),
      status: 1,
      limit: CONTAINER_LIST_THINGS_LIMIT,
      sort: JSON.stringify({ 'info.container': 1 }),
      fields: JSON.stringify({
        info: 1,
        'last.err': 1,
        'last.snap.stats.status': 1,
        'last.alerts': 1,
        'last.snap.stats.error_msg': 1,
        'last.snap.stats.power_w': 1,
        'last.snap.stats.container_specific': 1,
        'last.snap.config': 1,
        id: 1,
        type: 1,
      }),
    },
    {
      pollingInterval: smartPolling5s,
    },
  )

  const {
    data: minerTailLogData,
    isLoading: isMinerTailLogLoading,
    isError: isMinerTailLogError,
    error: minerTailLogError,
  } = useGetTailLogQuery(
    {
      key: STAT_REALTIME,
      type: 'miner',
      tag: 't-miner',
      limit: 1,
      aggrFields: JSON.stringify({
        offline_cnt: 1,
        not_mining_cnt: 1,
        power_mode_normal_include_error_cnt: 1,
        power_mode_low_cnt: 1,
        power_mode_normal_cnt: 1,
        power_mode_high_cnt: 1,
        hashrate_mhs_1m_group_sum_aggr: 1,
        temperature_c_group_max_aggr: 1,
        temperature_c_group_avg_aggr: 1,
      }),
      fields: JSON.stringify({
        offline_cnt: 1,
        not_mining_cnt: 1,
        power_mode_normal_include_error_cnt: 1,
        power_mode_low_cnt: 1,
        power_mode_normal_cnt: 1,
        power_mode_high_cnt: 1,
        hashrate_mhs_1m_group_sum: 1,
        temperature_c_group_max: 1,
        temperature_c_group_avg: 1,
      }),
    },
    {
      pollingInterval: smartPolling5s,
    },
  )

  useEffect(() => {
    dispatch(setResetSelections())
  }, [dispatch])

  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === ESCAPE_KEY) {
        dispatch(setResetSelections())
      }
    }

    window.addEventListener(KEYDOWN_EVENT, handleWindowKeyDown)
    return () => window.removeEventListener(KEYDOWN_EVENT, handleWindowKeyDown)
  }, [dispatch])

  // minerTailLogData is an array of arrays from multiple ORKs: [ [obj1], [obj2], [obj3] ]
  // First _head gets the first ORK's array [obj], second _head extracts the actual data object
  const minerTailLogItem = _head(_head(minerTailLogData as unknown[][])) as TailLogItem | undefined

  // Check if any container has critically high values (for sound notifications)
  // useGetListThingsQuery returns Device[][] (array of arrays), so we need _head to get the first array
  const containersArray = (_head(containers as Device[][]) as Device[] | undefined) || []
  const hasAnyCriticallyHigh = useMemo(() => {
    // Wait for both containers and settings to load before checking
    if (
      !containersArray ||
      containersArray.length === 0 ||
      isContainersLoading ||
      isContainerSettingsLoading
    ) {
      return false
    }

    return _some(containersArray, (container: Device) => {
      // Match container settings for this container
      const containerType = container.type || (container.info?.container as string)
      const matchedSettingsRaw = containerType
        ? findMatchingContainer(allContainerSettings, containerType)
        : null

      // Cast to ContainerSettings type (they have compatible structure)
      const matchedSettings = matchedSettingsRaw as ContainerSettings | null

      // Only trigger sound if:
      // 1. Widget is flashing red (shouldFlash is true)
      // 2. AND it's because of critical HIGH values (isCriticallyHigh is true)
      // This ensures we only play sound when containers are actually red due to high values
      const alarmState = getWidgetAlarmState(container as Container, matchedSettings)
      return alarmState.shouldFlash && alarmState.isCriticallyHigh
    })
  }, [containersArray, isContainersLoading, isContainerSettingsLoading, allContainerSettings])

  // Trigger sound only if user has confirmed (browser requires user gesture)
  useBeepSound({ isAllowed: hasAnyCriticallyHigh && confirmed && !isDemoMode })

  return (
    <ContainerWidgetsRoot $column>
      <Title>Containers</Title>
      <ContainerWidgetConfirmationModal
        isOpen={hasAnyCriticallyHigh && !confirmed}
        onOk={() => {
          setConfirmed(true)
          sessionStorage.setItem(ALERT_CONFIRMATION_KEY, 'true')
        }}
      />
      {isContainersLoading && <Spinner />}
      <ContainersWrapper>
        {_map(_head(containers as Device[]), (container: Device, index: number) => {
          // Match container settings for this container (reuse logic from hasAnyCriticallyHigh)
          const containerType = container.type || (container.info?.container as string)
          const matchedSettingsRaw = containerType
            ? findMatchingContainer(allContainerSettings, containerType)
            : null
          const matchedSettings = matchedSettingsRaw as ContainerSettings | null

          return (
            <ContainerWidgetCard
              key={`container-widget-${index}`}
              container={container}
              containerSettings={matchedSettings}
              minerTailLogItem={minerTailLogItem as MinerTailLogItem}
              isMinerTailLogLoading={isMinerTailLogLoading}
              isMinerTailLogError={isMinerTailLogError}
              minerTailLogError={
                minerTailLogError as { data?: { message?: string }; [key: string]: unknown } | null
              }
            />
          )
        })}
      </ContainersWrapper>
    </ContainerWidgetsRoot>
  )
}

export default ContainerWidgets

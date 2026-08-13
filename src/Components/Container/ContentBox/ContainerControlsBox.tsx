import { QuestionCircleOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import Switch from 'antd/es/switch'
import Tooltip from 'antd/es/tooltip'
import _compact from 'lodash/compact'
import _flatMap from 'lodash/flatMap'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _values from 'lodash/values'
import { useEffect, useState, FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { TIME } from '../../../constants'
import useSubtractedTime from '../../../hooks/useSubtractedTime'
import useTimezone from '../../../hooks/useTimezone'
import { DangerButton, PrimaryButton } from '../../ActionsSidebar/ActionCard/ActionCard.styles'
import { DangerActionButton } from '../../DangerActionButton/DangerActionButton'
import { getButtonsStates } from '../../Explorer/DetailsView/DetailsView.util'
import { groupTailLogByMinersByType } from '../../Explorer/DetailsView/MinerControlsCard/MinerControlsCard.util'
import MinerPowerModeSelectionButtons from '../../Explorer/DetailsView/MinerPowerModeSelectionButtons/MinerPowerModeSelectionButtons'

import { ContentBox } from './ContentBox'
import {
  Toggle,
  StyledCol,
  TogglesRow,
  ButtonsRow,
  StyledBulkControlsRow,
} from './ContentBox.styles'
import EnabledDisableToggle, { EnabledDisableToggleProps } from './EnabledDisableToggle'
import { getAllSelectedContainerInfo, getContainerActionPayload, getContainerState } from './helper'

import { useGetListThingsQuery, useGetTailLogQuery } from '@/app/services/api'
import { actionsSlice, selectPendingSubmissions } from '@/app/slices/actionsSlice'
import { devicesSlice, selectSelectedContainers } from '@/app/slices/devicesSlice'
import { getSwitchAllSocketsParams } from '@/app/utils/actionUtils'
import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isBitdeer,
  isMicroBT,
} from '@/app/utils/containerUtils'
import { appendContainerToTag, getOnOffText } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getByTagsQuery } from '@/app/utils/queryUtils'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { SystemStatusControlBox } from '@/Components/Explorer/Containers/BitMainImmersion/SystemStatusControlBox/SystemStatusControlBox'
import { LogData } from '@/Components/LogsCard/LogComponent'
import { ACTION_TYPES } from '@/constants/actions'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { POLLING_20s, POLLING_5s } from '@/constants/pollingIntervalConstants'
import { ROUTE } from '@/constants/routes'
import type { Alert, Device } from '@/hooks/hooks.types'
import { useNotification } from '@/hooks/useNotification'
import { useSmartPolling } from '@/hooks/useSmartPolling'
import { useUpdateExistedActions } from '@/hooks/useUpdateExistedActions'
import { AlarmContents } from '@/Views/Container/Tabs/HomeTab/AlarmContents'
import {
  getAlarms,
  getAlertTimelineItems,
  getAntspaceContainerControlsBoxData,
  getBitdeerContainerControlsBoxData,
  getContainerFormatedAlerts,
} from '@/Views/Container/Tabs/HomeTab/HomeTab.util'

interface ContainerControlsData {
  pidModeEnabled?: boolean
  runningModeEnabled?: boolean
  [key: string]: unknown
}

interface ContainerData {
  last?: {
    snap?: {
      stats?: {
        status?: string
      }
    }
  }
  container?: string
  type?: string
  info?: {
    container?: string
    [key: string]: unknown
  }
  connectedMiners?: unknown
  [key: string]: unknown
}

interface DeviceWithInfo {
  info?: {
    container?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

type PendingSubmissionForHook = Array<{
  id: string | number
  action: string
  tags: string[]
  [key: string]: unknown
}>

interface ContainerControlsBoxProps {
  data?: ContainerData
  isBatch?: boolean
  isCompact?: boolean
  shouldResetDevices?: () => void
}

const ContainerControlsBox: FC<ContainerControlsBoxProps> = ({
  data,
  isBatch = false,
  shouldResetDevices,
}) => {
  const { notifyInfo } = useNotification()

  const smartPolling20s = useSmartPolling(POLLING_20s)
  const smartPolling5s = useSmartPolling(POLLING_5s)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [powerModesLog, setPowerModesLog] = useState<unknown>()
  const { getFormattedDate } = useTimezone()
  const { updateExistedActions } = useUpdateExistedActions()
  const location = useLocation()
  const isOffline = _get(data, ['last', 'snap', 'stats', 'status']) === CONTAINER_STATUS.OFFLINE

  const [containerControlsData, setContainerControlsData] = useState<ContainerControlsData>({})
  const [pidModeValue, setPidModeValue] = useState(containerControlsData?.pidModeEnabled)
  const [runningModeValue, setRunningModeValue] = useState(
    containerControlsData?.runningModeEnabled,
  )

  const selectedContainers = useSelector(selectSelectedContainers)
  const selectedDevices = (() => {
    const containers = _values(selectedContainers) as DeviceWithInfo[]
    return containers.filter(
      (container): container is Device => _isNil(container) && _isObject(container),
    ) as Device[]
  })()

  const time = useSubtractedTime(TIME.TEN_MINS, TIME.ONE_MIN)
  const { setAddPendingSubmissionAction } = actionsSlice.actions
  const { setResetSelections } = devicesSlice.actions

  const containerState = getContainerState({
    ...data?.last?.snap?.stats,
    type: data?.type,
  })

  const { data: tailLogData } = useGetTailLogQuery(
    {
      key: 'stat-5m',
      type: 'miner',
      tag: 't-miner',
      limit: 1,
      start: time,
    },
    {
      pollingInterval: smartPolling5s,
    },
  )

  const containerIDs: string[] = (() => {
    if (isBatch) {
      return (
        _map(_values(selectedContainers) as DeviceWithInfo[], (device: DeviceWithInfo) => {
          const container = device?.info?.container
          return container ? `container-${container}` : ''
        }) as string[]
      ).filter((id): id is string => id !== '')
    }
    return data?.info?.container ? [`container-${data.info.container}`] : []
  })()

  const { data: alarmsRawData } = useGetListThingsQuery(
    {
      query: getByTagsQuery(containerIDs),
      status: 1,
      fields: JSON.stringify({
        'last.alerts': 1,
      }),
    },
    {
      pollingInterval: smartPolling20s,
      skip: !!data?.info || _includes(location.pathname, ROUTE.CONTAINERS_PAGE),
    },
  )

  const connectedMiners = data?.connectedMiners || alarmsRawData
  const minersArray = (() => {
    if (_isArray(connectedMiners)) {
      return connectedMiners
    }
    return connectedMiners ? [connectedMiners] : []
  })()
  const allAlarms = _compact(
    _flatMap(minersArray, (device: unknown) =>
      getAlarms(device as Device, undefined, getFormattedDate),
    ),
  )
  const formattedAlerts = getContainerFormatedAlerts(
    allAlarms as unknown as Alert[],
    data as Device,
    getFormattedDate,
  )
  const alarmsDataItems = getAlertTimelineItems(formattedAlerts as LogData[], navigate)

  const pendingSubmissions = useSelector(selectPendingSubmissions)

  const buttonsStates = getButtonsStates({
    selectedDevices,
    pendingSubmissions,
  })

  useEffect(() => {
    if (
      isBatch &&
      !_isEmpty(selectedDevices) &&
      tailLogData &&
      _isArray(tailLogData) &&
      tailLogData.length > 0
    ) {
      const headData = _head(tailLogData)
      if (headData) {
        setPowerModesLog(groupTailLogByMinersByType(selectedDevices, headData as UnknownRecord[]))
      }
    }
  }, [tailLogData, selectedDevices, isBatch])

  const getContainerPowerModeActionTags = (devices: Device[]): string[] => {
    if (isBatch) {
      return getAllSelectedContainerInfo(devices, true) as string[]
    }
    const container = data?.info?.container
    return container ? [appendContainerToTag(container)] : []
  }

  useEffect(() => {
    setPidModeValue(containerControlsData?.pidModeEnabled)
    setRunningModeValue(containerControlsData?.runningModeEnabled)
  }, [containerControlsData?.pidModeEnabled, containerControlsData?.runningModeEnabled])

  useEffect(() => {
    if (data?.type && isBitdeer(data.type)) {
      const controlsData = getBitdeerContainerControlsBoxData(data)
      setContainerControlsData(controlsData as ContainerControlsData)
    }
    if (data?.type && isAntspaceHydro(data.type)) {
      const controlsData = getAntspaceContainerControlsBoxData(data)
      setContainerControlsData(controlsData as ContainerControlsData)
    }
  }, [data])

  const switchContainer = (isOn: boolean) => {
    updateExistedActions({
      actionType: ACTION_TYPES.SWITCH_CONTAINER,
      pendingSubmissions: pendingSubmissions as unknown as PendingSubmissionForHook,
      selectedDevices,
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SWITCH_CONTAINER,
        tags: getContainerActionPayload(isBatch, selectedDevices, data as Device).idTags,
        params: [isOn as boolean],
      }),
    )
    if (shouldResetDevices) {
      dispatch(setResetSelections())
    }
    notifyInfo('Action added', `Switch Container ${getOnOffText(isOn)}`)
  }

  const switchCoolingSystem = (isOn: boolean) => {
    updateExistedActions({
      actionType: ACTION_TYPES.SWITCH_COOLING_SYSTEM,
      pendingSubmissions: pendingSubmissions as unknown as PendingSubmissionForHook,
      selectedDevices,
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SWITCH_COOLING_SYSTEM,
        tags: getContainerActionPayload(isBatch, selectedDevices, data as Device).idTags,
        params: [isOn as boolean],
        crossThing: {
          type: CROSS_THING_TYPES.MINER,
          params: {
            containers: getContainerActionPayload(isBatch, selectedDevices, data as Device)
              .containerInfo,
          },
        },
      }),
    )
    dispatch(setResetSelections())
    notifyInfo('Action added', `Switch Cooling System ${getOnOffText(isOn)} `)
  }

  const setTankEnabled: Required<EnabledDisableToggleProps>['onToggle'] = ({
    tankNumber,
    isOn,
  }) => {
    updateExistedActions({
      actionType: ACTION_TYPES.SET_TANK_ENABLED,
      pendingSubmissions: pendingSubmissions as unknown as PendingSubmissionForHook,
      selectedDevices,
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SET_TANK_ENABLED,
        tags: getContainerActionPayload(isBatch, selectedDevices, data as Device).idTags,
        params: [tankNumber, isOn],
      }),
    )

    dispatch(setResetSelections())

    notifyInfo('Action added', `Set tank ${tankNumber} circulation ${getOnOffText(isOn)} `)
  }

  const setAirExhaustEnabled: Required<EnabledDisableToggleProps>['onToggle'] = ({ isOn }) => {
    updateExistedActions({
      actionType: ACTION_TYPES.SET_AIR_EXHAUST_ENABLED,
      pendingSubmissions: pendingSubmissions as unknown as PendingSubmissionForHook,
      selectedDevices,
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SET_AIR_EXHAUST_ENABLED,
        tags: getContainerActionPayload(isBatch, selectedDevices, data as Device).idTags,
        params: [isOn],
      }),
    )
    dispatch(setResetSelections())
    notifyInfo('Action added', `Set air exhaust ${getOnOffText(isOn)} `)
  }

  const resetAlarm = () => {
    updateExistedActions({
      actionType: ACTION_TYPES.RESET_ALARM,
      pendingSubmissions: pendingSubmissions as unknown as PendingSubmissionForHook,
      selectedDevices,
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.RESET_ALARM,
        tags: getContainerActionPayload(isBatch, selectedDevices, data as Device).idTags,
        params: [],
      }),
    )
    dispatch(setResetSelections())
    notifyInfo('Action added', 'Reset Alarm')
  }

  const setPowerMode = (devices: Device[], powerMode: string) => {
    updateExistedActions({
      actionType: ACTION_TYPES.SET_POWER_MODE,
      pendingSubmissions: pendingSubmissions as unknown as PendingSubmissionForHook,
      selectedDevices,
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SET_POWER_MODE,
        tags: getContainerPowerModeActionTags(devices),
        params: [powerMode],
        isBulkContainerAction: true,
        crossThing: {
          type: CROSS_THING_TYPES.CONTAINER,
          params: {
            containers: getContainerActionPayload(isBatch, selectedDevices, data as Device)
              .containerInfo,
          },
        },
      }),
    )
    if (shouldResetDevices) {
      dispatch(setResetSelections())
    }
    notifyInfo('Action added', `Set Power Mode ${powerMode} for all devices`)
  }

  const switchAllSockets = (isOn: boolean) => {
    updateExistedActions({
      actionType: ACTION_TYPES.SWITCH_SOCKET,
      pendingSubmissions: pendingSubmissions as unknown as PendingSubmissionForHook,
      selectedDevices,
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SWITCH_SOCKET,
        tags: getContainerActionPayload(isBatch, selectedDevices, data as Device).idTags,
        params: getSwitchAllSocketsParams(isOn),
      }),
    )
    dispatch(setResetSelections())
    notifyInfo('Action added', `Switch All Sockets ${getOnOffText(isOn)} `)
  }

  return (
    <>
      <ButtonsRow>
        {data?.type && isBitdeer(data.type) && (
          <Row gutter={[10, 30]}>
            <Col flex="auto">
              <Tooltip title={isOffline ? 'Container is offline' : undefined}>
                <PrimaryButton
                  block
                  disabled={
                    isOffline ||
                    (!isBatch &&
                      (buttonsStates.isSwitchContainerButtonDisabled || containerState.isStarted))
                  }
                  size="middle"
                  title={!isOffline ? 'Container is offline' : undefined}
                  onClick={() => {
                    switchContainer(true)
                  }}
                >
                  Start
                </PrimaryButton>
              </Tooltip>
            </Col>
            <Col flex="auto">
              <Tooltip title={isOffline ? 'Container is offline' : undefined}>
                <DangerButton
                  block
                  $noBackground
                  disabled={
                    isOffline ||
                    (!isBatch &&
                      (buttonsStates.isSwitchContainerButtonDisabled || !containerState.isStarted))
                  }
                  size="middle"
                  onClick={() => {
                    switchContainer(false)
                  }}
                >
                  Stop
                </DangerButton>
              </Tooltip>
            </Col>
            <Col flex="auto">
              <Tooltip title={isOffline ? 'Container is offline' : undefined}>
                <Button
                  block
                  disabled={isOffline || (!isBatch && buttonsStates.isResetAlarmButtonDisabled)}
                  size="middle"
                  onClick={() => resetAlarm()}
                >
                  Reset Alarm
                </Button>
              </Tooltip>
            </Col>
          </Row>
        )}
        {data?.type &&
          (isAntspaceHydro(data.type) ||
            isMicroBT(data.type) ||
            isAntspaceImmersion(data.type)) && (
            <Row gutter={[10, 30]}>
              <Col flex="auto">
                <PrimaryButton
                  block
                  disabled={
                    !isBatch &&
                    (buttonsStates.isSwitchCoolingSystemButtonDisabled || containerState.isStarted)
                  }
                  onClick={() => {
                    switchCoolingSystem(true)
                  }}
                >
                  Start Cooling
                </PrimaryButton>
              </Col>
              <Col flex="auto">
                <DangerButton
                  block
                  $noBackground
                  disabled={
                    !isBatch &&
                    (buttonsStates.isSwitchCoolingSystemButtonDisabled || !containerState.isStarted)
                  }
                  onClick={() => {
                    switchCoolingSystem(false)
                  }}
                >
                  Stop Cooling
                </DangerButton>
              </Col>
            </Row>
          )}
      </ButtonsRow>
      <TogglesRow>
        {data?.type && isBitdeer(data.type) && (
          <>
            <EnabledDisableToggle
              isOffline={isOffline}
              isButtonDisabled={buttonsStates.isSetTank1EnabledButtonDisabled}
              value={containerControlsData?.tank1Enabled}
              tankNumber={1}
              onToggle={setTankEnabled}
            />
            <EnabledDisableToggle
              isOffline={isOffline}
              isButtonDisabled={buttonsStates.isSetTank2EnabledButtonDisabled}
              value={containerControlsData?.tank2Enabled}
              tankNumber={2}
              onToggle={setTankEnabled}
            />
            <EnabledDisableToggle
              isOffline={isOffline}
              isButtonDisabled={buttonsStates.isSetAirExhaustEnabledButtonDisabled}
              value={containerControlsData?.exhaustFanEnabled}
              onToggle={setAirExhaustEnabled}
            />
          </>
        )}
        {data?.type && isAntspaceImmersion(data.type) && <SystemStatusControlBox data={data} />}
        {data?.type &&
          (isAntspaceHydro(data.type) || isAntspaceImmersion(data.type)) &&
          !isBatch && (
            <Toggle>
              PID Mode Enabled:
              <Switch disabled checked={pidModeValue} />
            </Toggle>
          )}
        {data?.type && isAntspaceImmersion(data.type) && !isBatch && (
          <Toggle>
            Running Mode Enabled:
            <Switch disabled checked={runningModeValue} />
          </Toggle>
        )}
      </TogglesRow>
      <StyledBulkControlsRow gutter={[10, 10]}>
        {data?.type && (isBitdeer(data.type) || isMicroBT(data.type)) && (
          <>
            <StyledCol xs={24}>
              <DangerActionButton
                block
                confirmation={{
                  title: 'Power All Sockets On',
                  description:
                    'Please ensure cooling system is ON before turning ON sockets and miners',
                  onConfirm: () => switchAllSockets(true),
                  icon: <QuestionCircleOutlined style={{ color: 'red' }} />,
                }}
                disabled={
                  isOffline ||
                  (!isBatch &&
                    (buttonsStates.isSwitchSocketButtonDisabled || containerState.isAllSocketsOn))
                }
                label="Power All Sockets On"
                tooltip={isOffline ? 'Container is offline' : undefined}
              />
            </StyledCol>
            <StyledCol xs={24}>
              <Tooltip title={isOffline ? 'Container is offline' : undefined}>
                <Button
                  block
                  disabled={
                    isOffline ||
                    (!isBatch &&
                      (buttonsStates.isSwitchSocketButtonDisabled ||
                        !containerState.isAllSocketsOn))
                  }
                  onClick={() => switchAllSockets(false)}
                >
                  Power All Sockets Off
                </Button>
              </Tooltip>
            </StyledCol>
          </>
        )}
        <StyledCol span={24}>
          <MinerPowerModeSelectionButtons
            disabled={!isBatch && !containerState.isStarted}
            selectedDevices={selectedDevices}
            setPowerMode={setPowerMode}
            connectedMiners={data?.connectedMiners as Device[] | undefined}
            powerModesLog={powerModesLog as UnknownRecord | undefined}
          />
        </StyledCol>
      </StyledBulkControlsRow>
      <ContentBox title="Active Alarms">
        <AlarmContents alarmsData={alarmsDataItems} />
      </ContentBox>
    </>
  )
}

export { ContainerControlsBox }

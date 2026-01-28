import { formatDistance } from 'date-fns/formatDistance'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _size from 'lodash/size'
import { FC } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { selectPendingSubmissions } from '../../../app/slices/actionsSlice'
import { selectSelectedContainers, selectSelectedSockets } from '../../../app/slices/devicesSlice'
import {
  getAlertsForDevices,
  getDeviceErrorsString,
  convertDevicesDataForAlerts,
} from '../../../app/utils/alertUtils'
import { getContainerName } from '../../../app/utils/containerUtils'
import {
  appendContainerToTag,
  getDeviceData,
  getMinerShortCode,
  isMiner,
  isTempSensor,
} from '../../../app/utils/deviceUtils'
import { formatMacAddress } from '../../../app/utils/format'
import { MinerStatuses } from '../../../app/utils/statusUtils'
import { CONTAINER_TAB, MAINTENANCE_CONTAINER } from '../../../constants/containerConstants'
import { CROSS_THING_TYPES } from '../../../constants/devices'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../../constants/permissions.constants'
import { useCheckPerm } from '../../../hooks/usePermissions'
import useTimezone from '../../../hooks/useTimezone'
import { onLogClicked } from '../../../Views/Alerts/Alerts.util'
import { CommentsPopover } from '../../CommentsPopover/CommentsPopover'
import { LOG_TYPES } from '../../LogsCard/constants'
import LogsCard from '../../LogsCard/LogsCard'
import { Spinner } from '../../Spinner/Spinner'
import { TAB } from '../List/ListView.const'

import BatchContainerControlsCard from './BatchContainerControlsCard/BatchContainerControlsCard'
import Comments from './Comments/Comments'
import ContainerControlsCard from './ContainerControlsCard/ContainerControlsCard'
import {
  ContainerLabelText,
  DetailsViewContainer,
  DeviceLabelText,
  ItemTitleRow,
  MaintenanceContainerLabeltext,
  NoMinersSelectedContainer,
  ScrollableDetailsContent,
} from './DetailsView.styles'
import { getButtonsStates } from './DetailsView.util'
import ErrorCard from './ErrorCard/ErrorCard'
import MinerChipsCard from './MinerChipsCard/MinerChipsCard'
import MinerControlsCard from './MinerControlsCard/MinerControlsCard'
import MinerInfoCard from './MinerInfoCard/MinerInfoCard'
import NoDataSelected from './NoDataSelected/NoDataSelected'
import SelectedMinersList from './SelectedMinersList/SelectedMinersList'
import SelectedSocketsList from './SelectedSocketsList/SelectedSocketsList'
import StatsGroupCard from './StatsGroupCard/StatsGroupCard'

import type { DeviceDataResult } from '@/app/utils/deviceUtils/types'
import { ROUTE } from '@/constants/routes'
import type { Device } from '@/hooks/hooks.types'
import type { SocketData } from '@/types/redux'

const actionsWritePermission = `${AUTH_PERMISSIONS.ACTIONS}:${AUTH_LEVELS.WRITE}`

interface SelectedContainerData {
  rack?: string
  info?: {
    container?: string
    [key: string]: unknown
  }
  type?: string
  [key: string]: unknown
}

interface DetailsViewContentProps {
  selectedDevices?: Device[]
  isDetailsLoading?: boolean
  selectedMinerContainers?: Device[][]
  detailsTitle?: string
  onRemoveDeviceFromSelection?: (deviceid: string) => void
  onRemoveAllSelections?: () => void
  minersType?: string
  allowContainerControl?: boolean
  connectedMiners?: Device[]
}

const DetailsViewContent: FC<DetailsViewContentProps> = ({
  selectedDevices = [],
  isDetailsLoading,
  selectedMinerContainers = [],
  detailsTitle,
  onRemoveDeviceFromSelection,
  onRemoveAllSelections,
  minersType,
  allowContainerControl = true,
  connectedMiners,
}) => {
  const navigate = useNavigate()

  const containerTab = useParams().tab
  const isTabPdu = containerTab === CONTAINER_TAB.PDU
  const isTabHeatmap = containerTab === CONTAINER_TAB.HEATMAP

  const { getFormattedDate } = useTimezone()

  const selectedSockets = useSelector(selectSelectedSockets)

  const selectedContainers = useSelector(selectSelectedContainers)

  const pendingSubmissions = useSelector(selectPendingSubmissions)

  const isSocketSelectionEmpty = _isEmpty(selectedSockets)

  const isContainerSelectionEmpty = _isEmpty(selectedContainers)

  const deviceSelectionSize = _size(selectedDevices)

  const isDeviceSelectionEmpty = !deviceSelectionSize

  const isSingleDeviceSelected = !isDeviceSelectionEmpty && deviceSelectionSize === 1

  const minersSelected = _size(
    _filter(selectedDevices, (device: Device) => device && isMiner(device.type)),
  )

  const device = _head(selectedDevices)

  const containerId = _head(_keys(selectedContainers)) as string | undefined
  const containerRack = containerId
    ? (selectedContainers[containerId] as SelectedContainerData | undefined)?.rack
    : undefined

  const buttonsStates = getButtonsStates({
    selectedDevices: selectedDevices as Device[],
    selectedSockets: selectedSockets as unknown as Record<
      string,
      { sockets: { pduIndex: number; socket: number }[] }
    >,
    pendingSubmissions,
  })

  const getDeviceStats = (item: Device | undefined): DeviceDataResult[1] => {
    if (!item) return undefined
    const [, deviceStats] = getDeviceData(item)
    return deviceStats
  }

  const doesDevicesHaveErrorOrOffline = (): boolean =>
    !!_find(selectedDevices, (item: Device) => {
      const deviceStats = getDeviceStats(item)
      const deviceSnapStatus = deviceStats?.snap?.stats?.status
      const isOffline = deviceSnapStatus === MinerStatuses.OFFLINE

      return deviceStats?.err || isOffline
    })

  const getMinerInfoCardData = (): Array<{ title: string; value: unknown }> | undefined => {
    if (!device) return undefined
    const [err, deviceStats] = getDeviceData(device)

    if (!err && deviceStats) {
      const { snap, id, rack, type, address, info, tags } = deviceStats
      const code = device.code as string | undefined
      const shortCode = getMinerShortCode(code, tags || [])
      const deviceInfo = [
        { title: 'Short Code:', value: shortCode },
        { title: 'Rack:', value: rack },
        { title: 'Model:', value: type },
        { title: 'IP Address:', value: address },
        { title: 'Serial num:', value: info?.serialNum },
        { title: 'MAC Address:', value: formatMacAddress(info?.macAddress as string | undefined) },
        { title: 'Subnet:', value: info?.subnet },
        { title: 'Firmware:', value: snap?.config?.firmware_ver },
        {
          title: 'Pos. History',
          value: _map(
            (info?.posHistory as
              | Array<{ removedAt: string; container: string; pos: string }>
              | undefined) || [],
            (history: { removedAt: string; container: string; pos: string }) =>
              `${formatDistance(new Date(history.removedAt), new Date(), {
                addSuffix: true,
              })} Container: ${history.container}, Pos: ${history.pos}`,
          ),
        },
        {
          title: 'Pools:',
          value: _map(
            (snap?.config?.pool_config as Array<{ username?: string; url?: string }> | undefined) ||
              [],
            (pool: { username?: string; url?: string }) =>
              `${pool?.username || ''}, ${pool?.url || ''}`,
          ),
        },
        { title: 'Id:', value: id },
      ]
      return deviceInfo
    }
    return undefined
  }

  const devicesWithAlerts = convertDevicesDataForAlerts(
    selectedDevices as import('@/types/api').DeviceData[],
  )
  const alertsForSelectedDevices = getAlertsForDevices(devicesWithAlerts, getFormattedDate)

  const getDeviceName = (): string => {
    if (!device) return ''
    if (device.type && isTempSensor(device.type)) {
      return device.id || ''
    }
    if (device?.info?.container === MAINTENANCE_CONTAINER) {
      return `${MAINTENANCE_CONTAINER}`
    }

    const position = device?.info?.pos ? ` - ${device.info.pos}` : ''

    const selectedContainer = _head(selectedMinerContainers)?.[0] as Device | undefined

    const selectedContainerName = getContainerName(
      selectedContainer?.info?.container as string | undefined,
      (selectedContainer?.type as string | undefined) || '',
    )

    return `${selectedContainerName}${position}`
  }

  const getContainerTag = (): string => {
    const firstContainer = _head(selectedMinerContainers)?.[0] as Device | undefined
    const container = firstContainer?.info?.container || device?.info?.container
    return container ? appendContainerToTag(container) : ''
  }

  const errors = getDeviceErrorsString(
    ((device?.last?.alerts as
      | Array<{ severity: string; createdAt: number | string; name: string; description: string }>
      | undefined) || []) as Array<{
      severity: string
      createdAt: number | string
      name: string
      description: string
    }>,
    getFormattedDate,
  )

  const allowMinerControl = useCheckPerm({ perm: actionsWritePermission })
  const showMinerControls =
    !isDeviceSelectionEmpty &&
    (isTabPdu || isTabHeatmap || isContainerSelectionEmpty) &&
    minersSelected > 0 &&
    allowMinerControl

  if (!isDetailsLoading && isDeviceSelectionEmpty && isSocketSelectionEmpty) {
    return (
      <NoMinersSelectedContainer>
        <NoDataSelected
          text={`No ${detailsTitle} Selected`}
          subtext={`Please select ${detailsTitle} to view details`}
        />
      </NoMinersSelectedContainer>
    )
  }

  return (
    <DetailsViewContainer>
      {!isTabPdu && !isTabHeatmap && !isContainerSelectionEmpty && (
        <BatchContainerControlsCard
          isBatch={allowContainerControl}
          connectedMiners={connectedMiners}
        />
      )}
      {isDetailsLoading && <Spinner isFullScreen={false} />}
      {minersSelected === 1 && (
        <ItemTitleRow>
          <div>
            <DeviceLabelText>
              {getMinerShortCode(device?.code as string | undefined, device?.tags || [])}
            </DeviceLabelText>
            {device?.info?.container === MAINTENANCE_CONTAINER && (
              <MaintenanceContainerLabeltext>{getDeviceName()}</MaintenanceContainerLabeltext>
            )}
            {device?.info?.container !== MAINTENANCE_CONTAINER && getContainerTag() && (
              <Link
                to={`${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${getContainerTag()}/home?backUrl=${ROUTE.OPERATIONS_MINING_EXPLORER}?${TAB}=${
                  CROSS_THING_TYPES.MINER
                }`}
              >
                <ContainerLabelText>{getDeviceName()}</ContainerLabelText>
              </Link>
            )}
            {device?.info?.container !== MAINTENANCE_CONTAINER && !getContainerTag() && (
              <ContainerLabelText>{getDeviceName()}</ContainerLabelText>
            )}
          </div>
          <CommentsPopover device={device} />
        </ItemTitleRow>
      )}
      <ScrollableDetailsContent>
        {isSingleDeviceSelected && errors && <ErrorCard error={errors} />}
        {showMinerControls && (
          <MinerControlsCard isLoading={!!isDetailsLoading} buttonsStates={buttonsStates} />
        )}
        {allowContainerControl && (
          <ContainerControlsCard isLoading={!!isDetailsLoading} buttonsStates={buttonsStates} />
        )}
        {minersSelected > 0 && !doesDevicesHaveErrorOrOffline() && (
          <StatsGroupCard miners={selectedDevices} isMinerMetrics={true} />
        )}
        <SelectedSocketsList minersType={minersType || ''} />
        {!_isEmpty(alertsForSelectedDevices) && (
          <LogsCard
            label="Alerts"
            logsData={alertsForSelectedDevices}
            type={LOG_TYPES.INCIDENTS}
            onLogClicked={(id: string) => onLogClicked(navigate, id)}
          />
        )}
        {minersSelected === 1 && (
          <>
            <MinerInfoCard data={getMinerInfoCardData()} isDark={false} />
            <MinerChipsCard data={getDeviceStats(device)?.snap?.stats || {}} />
          </>
        )}
        {minersSelected > 0 && (
          <SelectedMinersList
            onRemoveAllSelections={onRemoveAllSelections}
            onRemoveDeviceFromSelection={onRemoveDeviceFromSelection}
          />
        )}

        {device?.info?.container &&
          selectedSockets?.[device.info.container]?.sockets?.length === 1 && (
            <Comments
              rack={(
                selectedSockets[device.info.container]?.sockets?.[0] as SocketData | undefined
              )?.pduIndex?.toString()}
              minerRackId={minersSelected === 1 ? device?.rack : undefined}
              socketRackId={containerRack}
              socket={(
                selectedSockets[device.info.container]?.sockets?.[0] as SocketData | undefined
              )?.socketIndex?.toString()}
              thingId={containerId}
              minerId={minersSelected === 1 ? device?.id : undefined}
              hasMiner={minersSelected === 1}
            />
          )}
      </ScrollableDetailsContent>
    </DetailsViewContainer>
  )
}

export default DetailsViewContent

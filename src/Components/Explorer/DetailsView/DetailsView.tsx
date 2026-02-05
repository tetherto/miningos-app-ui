import _capitalize from 'lodash/capitalize'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _replace from 'lodash/replace'
import _size from 'lodash/size'
import _startsWith from 'lodash/startsWith'
import _values from 'lodash/values'
import { useEffect, useState, FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router'

import { useGetListThingsQuery } from '../../../app/services/api'
import {
  NO_CONTAINER_KEY,
  devicesSlice,
  selectSelectedDeviceTags,
  selectSelectedDevices,
  selectSelectedContainers,
} from '../../../app/slices/devicesSlice'
import {
  getAntspaceHydroIndexes,
  getBitdeerIndexes,
  getPduData,
  isAntspaceHydro,
  isAntspaceImmersion,
  getAntspaceImmersionIndexes,
} from '../../../app/utils/containerUtils'
import { appendContainerToTag, isMiner } from '../../../app/utils/deviceUtils'
import { getContainerByContainerTagsQuery } from '../../../app/utils/queryUtils'
import { POLLING_20s } from '../../../constants/pollingIntervalConstants'
import useDeviceResolution from '../../../hooks/useDeviceResolution'
import { useSmartPolling } from '../../../hooks/useSmartPolling'
import { DetailsExplorerCol } from '../../../Views/Explorer/Explorer.styles'
import { TAB } from '../List/ListView.const'

import DetailsViewContent from './DetailsViewContent'
import DetailsViewMobileModal from './DetailsViewMobileModal'

import { Spinner } from '@/Components/Spinner/Spinner'
import { CONTAINER_TAB, MAINTENANCE_CONTAINER } from '@/constants/containerConstants'
import { ROUTE } from '@/constants/routes'
import type { Device } from '@/hooks/hooks.types'
import type { DeviceTag } from '@/types/redux'

const { setSelectedDevices, setSelectedSockets, resetSelectedDevicesTags } = devicesSlice.actions

interface SelectedDeviceTags {
  [container: string]: Record<string, DeviceTag>
}

const getAllDeviceTagsFromSelectedQuery = (selectedDeviceTags: SelectedDeviceTags): string =>
  JSON.stringify({
    $or: _map(
      _filter(_keys(selectedDeviceTags), (key: string) => key !== NO_CONTAINER_KEY),
      (container: string) => {
        if (container === MAINTENANCE_CONTAINER) {
          return {
            tags: { $in: _keys(selectedDeviceTags[container]) },
          }
        }
        return {
          $and: [
            {
              tags: { $in: [appendContainerToTag(container)] },
            },
            {
              tags: { $in: _keys(selectedDeviceTags[container]) },
            },
          ],
        }
      },
    ),
  })

const getDevicesLength = (selectedDeviceTags: SelectedDeviceTags): number =>
  _size(
    _flatMap(_keys(selectedDeviceTags), (deviceTags: string) =>
      _keys(selectedDeviceTags[deviceTags]),
    ),
  )

interface ContainerData {
  type?: string
  last?: {
    snap?: {
      stats?: {
        container_specific?: {
          pdu_data?: Array<{
            pdu: string
            sockets?: Array<{
              socket: string
              enabled?: boolean
              cooling?: boolean
              [key: string]: unknown
            }>
            power_w?: number | string
            current_a?: number | string
            offline?: boolean
            [key: string]: unknown
          }>
        }
      }
    }
  }
  info?: {
    container?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

const getPduByIndex = (containerData: ContainerData | undefined, pduIndex: string | number) => {
  if (!containerData?.last) return undefined
  const pduData = getPduData(containerData.last as unknown as Parameters<typeof getPduData>[0])
  if (!pduData) return undefined
  return _find(
    pduData as unknown[],
    (pdu: unknown) => String((pdu as { pdu?: unknown })?.pdu) === String(pduIndex),
  ) as
    | {
        pdu: string
        sockets?: Array<{
          socket: string
          enabled?: boolean
          cooling?: boolean
          [key: string]: unknown
        }>
        power_w?: number | string
        current_a?: number | string
        offline?: boolean
        [key: string]: unknown
      }
    | undefined
}

const getConnectedMinerForSocket = (
  devices: Device[] | undefined,
  pos: string,
): Device | undefined =>
  _find(devices, (device: Device) => {
    if (!isMiner(device.type)) {
      return false
    }
    return device?.info?.pos === pos
  })

interface DetailsViewProps {
  onLoadingChange?: (isLoading: boolean) => void
  onRemoveDeviceFromSelection?: (deviceid: string) => void
  onRemoveAllSelections?: () => void
  minersType?: string
  connectedMiners?: Device[]
}

const DetailsView: FC<DetailsViewProps> = ({
  onLoadingChange,
  onRemoveDeviceFromSelection,
  onRemoveAllSelections,
  minersType,
  connectedMiners,
}) => {
  const containerTab = useParams().tab
  const isTabPdu = containerTab === CONTAINER_TAB.PDU
  const isTabHeatmap = containerTab === CONTAINER_TAB.HEATMAP
  const { search, pathname } = useLocation()
  const currentTab = _capitalize(new URLSearchParams(search).get(TAB) || '')

  const selectedMiners = useSelector(selectSelectedDevices)
  const selectedContainers = useSelector(selectSelectedContainers)
  const selectedDeviceTags = useSelector(selectSelectedDeviceTags)
  // On PDU/Heatmap tabs, only count selected miners (not the parent container)
  const selectedDevices: Device[] =
    isTabPdu || isTabHeatmap
      ? (selectedMiners as Device[])
      : ([...selectedMiners, ..._values(selectedContainers)] as Device[])
  const numberOfSelectedDevices = selectedDevices?.length

  const detailsTitle = numberOfSelectedDevices > 1 ? `${currentTab}s` : currentTab

  const { isTablet } = useDeviceResolution()
  const dispatch = useDispatch()
  const smartPolling20s = useSmartPolling(POLLING_20s)

  const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = useState(false)

  const { data, isLoading, isFetching } = useGetListThingsQuery(
    {
      query: getAllDeviceTagsFromSelectedQuery(selectedDeviceTags as SelectedDeviceTags),
      status: 1,
      limit: getDevicesLength(selectedDeviceTags as SelectedDeviceTags),
    },
    {
      pollingInterval: smartPolling20s,
      skip: _isEmpty(selectedDeviceTags),
    },
  )

  const allDevices = _head(data as Device[][] | undefined) as Device[] | undefined

  const {
    data: selectedMinerContainersRaw,
    isLoading: isMinerContainersLoading,
    isFetching: isMinerContainersFetching,
  } = useGetListThingsQuery(
    {
      query: getContainerByContainerTagsQuery(
        _map(_keys(selectedDeviceTags), appendContainerToTag),
      ),
      status: 1,
      limit: _keys(selectedDeviceTags)?.length,
    },
    {
      pollingInterval: smartPolling20s,
      skip: _isEmpty(selectedDeviceTags),
    },
  )

  const selectedMinerContainers: Device[][] | undefined = selectedMinerContainersRaw as
    | Device[][]
    | undefined

  const getSocketInfo = (containerData: ContainerData, pos: string) => {
    const miner = getConnectedMinerForSocket(allDevices, pos)

    const containerTag = containerData?.info?.container
    if (!containerTag) {
      return {
        pduIndex: '',
        socketIndex: pos,
        miner,
      }
    }
    if (isAntspaceHydro(containerTag)) {
      const [rack, pdu, socketIndex] = getAntspaceHydroIndexes(pos)
      return {
        pduIndex: rack + '_' + pdu,
        socketIndex,
        miner,
        enabled: true,
      }
    }

    if (isAntspaceImmersion(containerTag)) {
      const [pduIndex, socketIndex] = getAntspaceImmersionIndexes(pos)
      return {
        pduIndex,
        socketIndex,
        miner,
        enabled: true,
      }
    }

    const [pduIndex, socketIndex] = getBitdeerIndexes(pos) as [string, string]
    const row = getPduByIndex(containerData, pduIndex as string | number)
    if (!row || !row?.sockets) {
      return {
        pduIndex,
        socketIndex,
        miner,
      }
    }
    const socket = _find(row.sockets, (s) => {
      const socketItem = s as unknown as {
        socket: string
        enabled?: boolean
        cooling?: boolean
        [key: string]: unknown
      }
      return String(socketItem?.socket) === String(socketIndex)
    }) as
      | { socket: string; enabled?: boolean; cooling?: boolean; [key: string]: unknown }
      | undefined
    return {
      ...socket,
      pduIndex,
      socketIndex,
      miner,
    }
  }

  const findAndSetSelectedSockets = () => {
    const containersData = _head(selectedMinerContainers as Device[][] | undefined) as
      | Device[]
      | undefined
    if (!containersData) return
    const selectedSockets: Record<
      string,
      {
        sockets: Array<{
          pduIndex?: string | number
          socketIndex?: string | number
          miner?: Device
          enabled?: boolean
          coolingEnabled?: boolean
          [key: string]: unknown
        }>
      }
    > = {}
    _forEach(containersData, (container: Device) => {
      const containerTag = container?.info?.container as string | undefined
      if (!containerTag) return
      if (!selectedSockets[containerTag]) {
        selectedSockets[containerTag] = { sockets: [] }
      }
      if (!selectedSockets[containerTag]?.sockets) {
        selectedSockets[containerTag].sockets = []
      }
      const containerTags = selectedDeviceTags[containerTag]
      if (containerTags) {
        selectedSockets[containerTag].sockets = _map(_keys(containerTags), (socketPos: string) =>
          getSocketInfo(container as unknown as ContainerData, _replace(socketPos, 'pos-', '')),
        ) as Array<{
          [key: string]: unknown
          pduIndex?: string | number
          socketIndex?: string | number
          miner?: Device
          enabled?: boolean
          coolingEnabled?: boolean
        }>
      }
    })
    dispatch(
      setSelectedSockets(
        selectedSockets as unknown as Record<
          string,
          {
            sockets: Array<{
              containerId: string
              minerId: string
              pduIndex: number
              socketIndex: number
              miner: { id: string; [key: string]: unknown }
            }>
          }
        >,
      ),
    )
  }

  useEffect(() => {
    if (_isEmpty(selectedDeviceTags)) {
      dispatch(resetSelectedDevicesTags())
      return
    }

    if (isTabPdu || isTabHeatmap) {
      dispatch(setSelectedDevices((allDevices || []) as Device[]))
    }

    findAndSetSelectedSockets()
  }, [allDevices, selectedMinerContainers, selectedDeviceTags, isTabPdu, isTabHeatmap, dispatch])

  const getIsDetailsLoading = () =>
    isLoading || isFetching || isMinerContainersLoading || isMinerContainersFetching

  const handleDetailsSidebarClose = () => {
    setIsDetailsSidebarOpen(false)
  }

  const openDetailsSidebar = () => {
    setIsDetailsSidebarOpen(true)
  }

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(getIsDetailsLoading())
    }
  }, [getIsDetailsLoading, onLoadingChange])

  const isContainersPage = _startsWith(pathname, ROUTE.CONTAINERS_PAGE)

  if (isTablet) {
    return (
      <>
        <DetailsExplorerCol onClick={openDetailsSidebar}>
          {getIsDetailsLoading() ? (
            <Spinner />
          ) : (
            <div>
              {' '}
              {numberOfSelectedDevices} {detailsTitle}
            </div>
          )}
          <div>Selected</div>
        </DetailsExplorerCol>
        <DetailsViewMobileModal
          detailsTitle={detailsTitle}
          handleCancel={handleDetailsSidebarClose}
          isDetailsSidebarOpen={isDetailsSidebarOpen}
          isDetailsLoading={getIsDetailsLoading()}
          selectedDevices={selectedDevices as Device[]}
          selectedMinerContainers={selectedMinerContainers as Device[][] | undefined}
          minersType={minersType}
          allowContainerControl={!isContainersPage}
          connectedMiners={(connectedMiners || []) as Device[]}
        />
      </>
    )
  }
  return (
    <DetailsViewContent
      detailsTitle={detailsTitle}
      isDetailsLoading={getIsDetailsLoading()}
      selectedDevices={selectedDevices as Device[]}
      selectedMinerContainers={selectedMinerContainers as Device[][] | undefined}
      onRemoveDeviceFromSelection={onRemoveDeviceFromSelection}
      onRemoveAllSelections={onRemoveAllSelections}
      minersType={minersType}
      allowContainerControl={!isContainersPage}
      connectedMiners={connectedMiners}
    />
  )
}

export default DetailsView

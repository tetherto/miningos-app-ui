import _head from 'lodash/head'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AddReplaceMinerDialog from './AddReplaceMinerDialog/AddReplaceMinerDialog'
import EditFlowHeader from './EditFlowHeader'
import { PduGrid } from './PduGrid'
import { DetailsTab, PduTabContainer } from './PduTab.styles'
import { getPduIndex, getSelectableName, getSocketIndex } from './pduUtils'
import PositionChangeDialog from './PositionChangeDialog/PositionChangeDialog'
import SocketsLegendsList from './SocketsLegendsList'

import { getContainerName, getContainerPduData } from '@/app/utils/containerUtils'
import { appendContainerToTag } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { SocketSelectionContainer } from '@/Components/Container/Socket/Socket.styles'
import DetailsView from '@/Components/Explorer/DetailsView/DetailsView'
import { Spinner } from '@/Components/Spinner/Spinner'
import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'
import { ROUTE } from '@/constants/routes'
import { HEATMAP_MODE } from '@/constants/temperatureConstants'
import { Device } from '@/types'
import { HeatmapFullLegend } from '@/Views/Container/Tabs/HeatmapTab/HeatmapFullLegend'

interface PduTabProps {
  data?: {
    last?: UnknownRecord
    connectedMiners?: UnknownRecord[]
    isConnectedMinersLoading?: boolean
    type?: string
    info?: UnknownRecord
  }
  isHeatmapMode?: boolean
}

const PduTab = ({ data, isHeatmapMode = false }: PduTabProps) => {
  const { flow } = useParams()
  const { search } = useLocation()
  const navigate = useNavigate()

  const printLayoutRef = useRef<HTMLDivElement | null>(null)
  const [mobileSelectionEnabled, setMobileSelectionEnabled] = useState<boolean>(false)

  const { last, connectedMiners, isConnectedMinersLoading, type, info } = data || {}

  const [isEditFlow, setIsEditFlow] = useState<boolean>(false)
  const [isPositionChangeFlow, setIsPositionChangeFlow] = useState<boolean>(false)
  const [isAddReplaceMinerFlow, setIsAddReplaceMinerFlow] = useState<boolean>(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [headerText, setHeaderText] = useState<string>('')

  const [selectedEditSocket, setSelectedEditSocket] = useState<UnknownRecord | undefined>()
  const [selectedSocketToReplace, setSelectedSocketToReplace] = useState<
    UnknownRecord | undefined
  >()
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)

  const setEditFlowHeaderText = () => {
    if (!isEditFlow) return

    const minerRecord = selectedEditSocket?.miner as UnknownRecord | undefined
    const containerInfo = selectedEditSocket?.containerInfo as UnknownRecord | undefined
    if (!selectedEditSocket || minerRecord?.error || !minerRecord) {
      return setHeaderText('Select miner to change position or empty sockets to add new miners')
    }

    return setHeaderText(`Select miner or empty sockets to replace position with ${getContainerName(
      containerInfo?.container as string,
    )}
    ${selectedEditSocket?.pdu}_${selectedEditSocket?.socket}`)
  }

  useEffect(() => {
    setIsEditFlow(flow === 'edit')
  }, [flow])

  useEffect(() => {
    setEditFlowHeaderText()
  }, [isEditFlow, selectedEditSocket, selectedSocketToReplace])

  useEffect(() => {
    const query = new URLSearchParams(search)
    const selectedSocketToReplaceStr = query.get('selectedSocketToReplace')
    if (selectedSocketToReplaceStr) {
      setSelectedSocketToReplace(JSON.parse(selectedSocketToReplaceStr) as UnknownRecord)
    }
  }, [search])
  const [heatmapMode, setHeatmapMode] = useState<string>(HEATMAP_MODE.INLET)
  const [heatmapRanges, setHeatmapRanges] = useState<
    Record<string, { min?: number; max?: number }>
  >({
    pcb: { min: 0, max: 0 },
    inlet: { min: 0, max: 0 },
    chip: { min: 0, max: 0 },
    hashrate: { min: 0, max: 0 },
  })

  const onEditClicked = () => {
    onResetSelections()
    setSelectedEditSocket(undefined)
    setSelectedSocketToReplace(undefined)
    navigate(
      `${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${appendContainerToTag((info as UnknownRecord)?.container as string)}/pdu/edit`,
    )
  }

  const onCancelClicked = () => {
    onResetSelections()
    navigate(
      `${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${appendContainerToTag((info as UnknownRecord)?.container as string)}/pdu`,
    )
  }

  const onSocketClicked = (
    containerInfo: UnknownRecord,
    pdu: string | number,
    socket: string | number,
    miner: UnknownRecord,
  ) => {
    if (!isEditFlow) return

    const minerRecord = miner as UnknownRecord | undefined
    if ((!minerRecord || minerRecord.error) && !selectedSocketToReplace) {
      setSelectedEditSocket({ containerInfo, pdu, socket, miner: minerRecord })
      setIsAddReplaceMinerFlow(true)
      return
    }

    if (minerRecord && minerRecord.error === 'Device Not Found') {
      setSelectedEditSocket({ containerInfo, pdu, socket, miner: minerRecord })
      setIsPositionChangeFlow(true)
    }
  }

  const onChangePositionClicked = () => {
    if (selectedEditSocket) {
      setSelectedSocketToReplace(selectedEditSocket)
    }
    setSelectedEditSocket(undefined)
  }

  const onPositionChangeDialogClosed = (currentDialogFlow?: string, isDontReset?: boolean) => {
    setIsPositionChangeFlow(false)
    onResetSelections(currentDialogFlow, isDontReset)
  }

  const onPositionChangeSuccess = () => {
    setIsPositionChangeFlow(false)
    setSelectedItems(new Set())
    setSelectedSocketToReplace(undefined)
    setSelectedEditSocket(undefined)
    navigate(
      `/operations/mining/explorer/containers/${appendContainerToTag((info as UnknownRecord)?.container as string)}/pdu`,
    )
  }

  const onAddReplaceMinerDialogClosed = () => {
    setIsAddReplaceMinerFlow(false)
    onResetSelections()
  }

  const onResetSelections = (currentDialogFlow?: string, isDontReset?: boolean) => {
    setSelectedItems(new Set())
    if (
      (selectedEditSocket && selectedSocketToReplace) ||
      (currentDialogFlow === POSITION_CHANGE_DIALOG_FLOWS.CONTAINER_SELECTION &&
        isDontReset !== true) ||
      !currentDialogFlow
    ) {
      setSelectedEditSocket(undefined)
      setSelectedSocketToReplace(undefined)
      navigate(
        `${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${appendContainerToTag((info as UnknownRecord)?.container as string)}/pdu/edit`,
      )
    }
  }

  const isContainerEmpty = (connectedMiners?.length || 0) < 1

  const handleRemoveDeviceFromSelection = (deviceId: string) => {
    const device = connectedMiners?.find((miner) => (miner as Device).id === deviceId) as
      | Device
      | undefined
    if (!device) return

    const selection = new Set([...selectedItems])
    const name = getSelectableName(getPduIndex(device), getSocketIndex(device))
    selection.delete(name)

    setSelectedItems(selection)
  }

  const handleRemoveAllSelections = () => {
    setSelectedItems(new Set())
  }

  return (
    <PduTabContainer>
      <SocketSelectionContainer ref={printLayoutRef}>
        {!isHeatmapMode && (
          <EditFlowHeader
            isEditFlow={isEditFlow}
            onCancelClicked={onCancelClicked}
            onEditClicked={onEditClicked}
            headerText={headerText}
            connectedMiners={connectedMiners}
            onMobileSelectionToggle={() => setMobileSelectionEnabled((state) => !state)}
          />
        )}
        {isConnectedMinersLoading ? (
          <Spinner />
        ) : (
          <PduGrid
            containerInfo={info ? { ...info, type } : { type }}
            connectedMiners={connectedMiners}
            isHeatmapMode={isHeatmapMode}
            heatmapMode={heatmapMode}
            setHeatmapMode={setHeatmapMode}
            type={type}
            isEditFlow={isEditFlow}
            onSocketClick={onSocketClicked}
            disableMinerSelect={!!selectedSocketToReplace}
            pdus={
              getContainerPduData(type || '', last ?? {}) as
                | import('@/app/utils/containerUtils/containerPdu').PduData[]
                | undefined
            }
            setSelectedItems={setSelectedItems}
            selectedItems={selectedItems}
            mobileSelectionEnabled={mobileSelectionEnabled}
            detailsLoading={detailsLoading}
            onRangesChange={setHeatmapRanges}
          />
        )}
        {isHeatmapMode ? (
          <HeatmapFullLegend mode={heatmapMode} ranges={heatmapRanges} />
        ) : (
          <SocketsLegendsList />
        )}
      </SocketSelectionContainer>
      <DetailsTab>
        <DetailsView
          onLoadingChange={setDetailsLoading}
          onRemoveDeviceFromSelection={handleRemoveDeviceFromSelection}
          onRemoveAllSelections={handleRemoveAllSelections}
          minersType={
            (_head(connectedMiners) as UnknownRecord | undefined)?.rack as string | undefined
          }
          connectedMiners={connectedMiners as Device[]}
        />
      </DetailsTab>
      <PositionChangeDialog
        isContainerEmpty={isContainerEmpty}
        selectedSocketToReplace={selectedSocketToReplace}
        selectedEditSocket={selectedEditSocket}
        onClose={onPositionChangeDialogClosed}
        open={isPositionChangeFlow}
        onChangePositionClicked={onChangePositionClicked}
        onPositionChangedSuccess={onPositionChangeSuccess}
      />
      <AddReplaceMinerDialog
        selectedSocketToReplace={selectedSocketToReplace}
        selectedEditSocket={selectedEditSocket}
        onClose={onAddReplaceMinerDialogClosed}
        open={isAddReplaceMinerFlow}
      />
    </PduTabContainer>
  )
}

export { PduTab }

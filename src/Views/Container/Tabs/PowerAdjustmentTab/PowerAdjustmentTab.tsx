import Button from 'antd/es/button'
import _compact from 'lodash/compact'
import _forEach from 'lodash/forEach'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _uniq from 'lodash/uniq'
import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PduGrid } from '../PduTab/PduGrid'
import { getSelectableName } from '../PduTab/pduUtils'
import SocketsLegendsList from '../PduTab/SocketsLegendsList'

import { ControlsSection, PowerAdjustmentTabContainer } from './PowerAdjustmentTab.styles'
import { PowerControlsPanel, type SelectedSocket } from './PowerControlsPanel'

import { actionsSlice, selectPendingSubmissions } from '@/app/slices/actionsSlice'
import { getConnectedMinerForSocket, getContainerPduData } from '@/app/utils/containerUtils'
import type { PduData } from '@/app/utils/containerUtils/containerPdu'
import { appendIdToTag, isWhatsminer } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { notifyInfo } from '@/app/utils/NotificationService'
import { SocketSelectionContainer } from '@/Components/Container/Socket/Socket.styles'
import { ACTION_TYPES } from '@/constants/actions'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { useUpdateExistedActions } from '@/hooks/useUpdateExistedActions'
import type { Device } from '@/types'

interface ContainerInfo {
  container?: string
  [key: string]: unknown
}

interface PowerAdjustmentTabProps {
  data?: {
    last?: Record<string, unknown>
    connectedMiners?: Device[]
    type?: string
    info?: ContainerInfo
  }
}

const { setAddPendingSubmissionAction } = actionsSlice.actions

const isWhatsminerSocket = (miner: UnknownRecord | undefined): boolean =>
  !!miner && isWhatsminer(miner.type as string)

const PowerAdjustmentTab = ({ data }: PowerAdjustmentTabProps) => {
  const dispatch = useDispatch()
  const pendingSubmissions = useSelector(selectPendingSubmissions)
  const printLayoutRef = useRef<HTMLDivElement | null>(null)

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const { last, connectedMiners, type, info } = data || {}
  const { updateExistedActions } = useUpdateExistedActions()

  const pdus = getContainerPduData(type || '', last ?? {}, info) as PduData[] | undefined

  const handleSelectAll = () => {
    const allSockets = new Set<string>()
    _forEach(pdus, (pdu) => {
      _forEach(pdu.sockets, (socket) => {
        const miner = getConnectedMinerForSocket(
          connectedMiners || [],
          String(pdu.pdu),
          String(socket.socket),
        ) as Device | undefined
        if (!miner || !isWhatsminer(miner.type)) return
        allSockets.add(getSelectableName(String(pdu.pdu), String(socket.socket)))
      })
    })
    setSelectedItems(allSockets)
  }

  const handleDeselectAll = () => {
    setSelectedItems(new Set())
  }

  const handleApply = (percentage: number, selectedSockets: SelectedSocket[]) => {
    const miners = _compact(
      _map(selectedSockets, (socket) =>
        getConnectedMinerForSocket(connectedMiners || [], socket.pduIndex, socket.socketIndex),
      ),
    ) as Device[]

    if (_isEmpty(miners)) {
      notifyInfo('No actions added', 'No miners found for selected sockets')
      return
    }

    const minerTags = _map(miners, (miner) => appendIdToTag(miner.id))
    const containerNames = _uniq(_compact(_map(miners, (miner) => miner.info?.container)))

    updateExistedActions({
      actionType: ACTION_TYPES.SET_POWER_PCT,
      pendingSubmissions: pendingSubmissions as [],
      selectedDevices: miners,
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SET_POWER_PCT,
        tags: minerTags,
        params: [String(percentage)],
        crossThing: {
          type: CROSS_THING_TYPES.CONTAINER,
          params: {
            containers: containerNames,
          },
        },
      }),
    )

    notifyInfo('Action added', `Set Power ${percentage}% for ${_size(miners)} miner(s)`)
  }

  if (!data) return null

  const additionalToolbarControls = (
    <>
      <Button onClick={handleDeselectAll}>Deselect All</Button>
      <Button onClick={handleSelectAll}>Select All</Button>
    </>
  )

  return (
    <PowerAdjustmentTabContainer>
      <SocketSelectionContainer ref={printLayoutRef}>
        <PduGrid
          containerInfo={info ? { ...info, type } : { type }}
          connectedMiners={connectedMiners}
          isHeatmapMode={false}
          type={type}
          isEditFlow={false}
          disableMinerSelect={false}
          pdus={pdus}
          setSelectedItems={setSelectedItems}
          selectedItems={selectedItems}
          mobileSelectionEnabled={false}
          detailsLoading={false}
          additionalToolbarControls={additionalToolbarControls}
          isSocketSelectable={isWhatsminerSocket}
          showPowerPercentage
        />
        <SocketsLegendsList />
      </SocketSelectionContainer>
      <ControlsSection>
        <PowerControlsPanel
          selectedItems={selectedItems}
          connectedMiners={connectedMiners}
          containerInfo={info}
          onApply={handleApply}
        />
      </ControlsSection>
    </PowerAdjustmentTabContainer>
  )
}

export { PowerAdjustmentTab }

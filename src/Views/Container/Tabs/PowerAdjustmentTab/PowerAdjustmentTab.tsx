import Button from 'antd/es/button'
import message from 'antd/es/message'
import _forEach from 'lodash/forEach'
import _size from 'lodash/size'
import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { PduGrid } from '../PduTab/PduGrid'
import { getSelectableName } from '../PduTab/pduUtils'
import SocketsLegendsList from '../PduTab/SocketsLegendsList'

import {
  ControlsSection,
  PowerAdjustmentTabContainer,
} from './PowerAdjustmentTab.styles'
import { PowerControlsPanel, type SelectedSocket } from './PowerControlsPanel'

import type { RootState } from '@/app/store'
import { getContainerPduData } from '@/app/utils/containerUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { SocketSelectionContainer } from '@/Components/Container/Socket/Socket.styles'

interface PowerAdjustmentTabProps {
  data?: {
    last?: UnknownRecord
    connectedMiners?: UnknownRecord[]
    type?: string
    info?: UnknownRecord
  }
}

const PowerAdjustmentTab = ({ data }: PowerAdjustmentTabProps) => {
  const isPduLayout = useSelector((state: RootState) => state.pdu.isPduLayout)
  const printLayoutRef = useRef<HTMLDivElement | null>(null)

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const { last, connectedMiners, type, info } = data || {}

  const pdus = getContainerPduData(type || '', last ?? {}, isPduLayout) as
    | import('@/app/utils/containerUtils/containerPdu').PduData[]
    | undefined

  const handleSelectAll = () => {
    const allSockets = new Set<string>()
    _forEach(pdus, (pdu) => {
      _forEach(pdu.sockets, (socket) => {
        const name = getSelectableName(
          String(pdu.pdu),
          String((socket as { socket: string }).socket),
        )
        allSockets.add(name)
      })
    })
    setSelectedItems(allSockets)
  }

  const handleDeselectAll = () => {
    setSelectedItems(new Set())
  }

  const handleApply = (percentage: number, selectedSockets: SelectedSocket[]) => {
    // TODO: Integrate with API when backend is ready
    // For now, just show success toast
    const socketCount = _size(selectedSockets)
    message.success(
      `Power set to ${percentage}% for ${socketCount} socket${socketCount !== 1 ? 's' : ''}`,
    )
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

import { FC } from 'react'

import { SidebarModal } from '../../ActionsSidebar/ActionsSidebar.styles'

import DetailsViewContent from './DetailsViewContent'

import type { Device } from '@/hooks/hooks.types'

interface DetailsViewMobileModalProps {
  isDetailsSidebarOpen: boolean
  handleCancel: () => void
  detailsTitle: string
  isDetailsLoading: boolean
  selectedDevices: Device[]
  selectedMinerContainers?: Device[][]
  minersType?: string
  allowContainerControl?: boolean
  connectedMiners: Device[]
}

const DetailsViewMobileModal: FC<DetailsViewMobileModalProps> = ({
  isDetailsSidebarOpen,
  handleCancel,
  detailsTitle,
  isDetailsLoading,
  selectedDevices,
  selectedMinerContainers = [],
  allowContainerControl = true,
  connectedMiners,
}) => (
  <SidebarModal
    title="Selected Devices"
    open={isDetailsSidebarOpen}
    onCancel={handleCancel}
    footer={false}
  >
    <DetailsViewContent
      detailsTitle={detailsTitle}
      isDetailsLoading={isDetailsLoading}
      selectedDevices={selectedDevices}
      selectedMinerContainers={selectedMinerContainers}
      allowContainerControl={allowContainerControl}
      connectedMiners={connectedMiners}
    />
  </SidebarModal>
)

export default DetailsViewMobileModal

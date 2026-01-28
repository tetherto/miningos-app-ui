import type { FC } from 'react'

import { SetPoolConfiguration } from './SetPoolConfiguration'

import { SidebarModal } from '@/Components/ActionsSidebar/ActionsSidebar.styles'

interface SetPoolConfigurationModalProps {
  isSidebarOpen: boolean
  handleCancel: () => void
}

const SetPoolConfigurationModal: FC<SetPoolConfigurationModalProps> = ({
  isSidebarOpen,
  handleCancel,
}) => (
  <SidebarModal title="Selected Units" open={isSidebarOpen} onCancel={handleCancel} footer={false}>
    <SetPoolConfiguration />
  </SidebarModal>
)

export default SetPoolConfigurationModal

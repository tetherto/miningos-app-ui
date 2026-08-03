import type { FC } from 'react'

import { SetPoolConfiguration } from './SetPoolConfiguration'

import { SidebarModal } from '@/Components/ActionsSidebar/ActionsSidebar.styles'
import { PoolSummary } from '@/Views/PoolManager/types'

interface SetPoolConfigurationModalProps {
  isSidebarOpen: boolean
  handleCancel: () => void
  onSubmit: (values: { pool: PoolSummary }) => Promise<void> | void
}

const SetPoolConfigurationModal: FC<SetPoolConfigurationModalProps> = ({
  isSidebarOpen,
  handleCancel,
  onSubmit,
}) => (
  <SidebarModal title="Selected Units" open={isSidebarOpen} onCancel={handleCancel} footer={false}>
    <SetPoolConfiguration onSubmit={onSubmit} />
  </SidebarModal>
)

export default SetPoolConfigurationModal

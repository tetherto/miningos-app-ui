import Button from 'antd/es/button'
import { FC, useState } from 'react'

import PoolDetailsCard from '../PoolDetailsCard/PoolDetailsCard'

import { StyledPoolModal } from './PoolDetailsPopover.styles'

import { isDemoMode } from '@/app/services/api.utils'
import { MinerPoolDashboardData } from '@/Views/Dashboard/hooks/useMinePoolDashboardData'

interface PoolDetailsPopoverProps {
  data?: MinerPoolDashboardData
}

const PoolDetailsPopover: FC<PoolDetailsPopoverProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button disabled={isDemoMode} onClick={showModal}>
        Show details
      </Button>
      <StyledPoolModal
        title="Pool details"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
      >
        <PoolDetailsCard data={data} />
      </StyledPoolModal>
    </>
  )
}

export default PoolDetailsPopover

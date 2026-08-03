import { ArrowLeftOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Tooltip from 'antd/es/tooltip'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import {
  Header,
  HeaderSubtitle,
  HeaderSubtitleLink,
  PoolManagerDashboardRoot,
} from '../PoolManagerDashboard.styles'
import { MinerRecord, PoolSummary } from '../types'

import { actionsSlice } from '@/app/slices/actionsSlice'
import { notifyInfo } from '@/app/utils/NotificationService'
import { AssignPoolModal } from '@/Components/PoolManager/MinerExplorer/AssignPoolModal/AssignPoolModal'
import { MinerExplorer } from '@/Components/PoolManager/MinerExplorer/MinerExplorer'
import { ASSIGN_POOL_POPUP_ENABLED } from '@/Components/PoolManager/PoolManager.constants'
import { ACTION_TYPES } from '@/constants/actions'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import { ROUTE } from '@/constants/routes'
import { useContextualModal } from '@/hooks/useContextualModal'
import { useCheckPerm } from '@/hooks/usePermissions'

const { setAddPendingSubmissionAction } = actionsSlice.actions

const actionsWritePermission = `${AUTH_PERMISSIONS.ACTIONS}:${AUTH_LEVELS.WRITE}`

export const PoolManagerMinerExplorer = () => {
  const dispatch = useDispatch()
  const canSubmitActions = useCheckPerm({ perm: actionsWritePermission })

  const [selectedDevices, setSelectedDevices] = useState<MinerRecord[]>([])

  const {
    modalOpen: assignPoolModalOpen,
    handleOpen: openAssignPoolModal,
    handleClose: closeAssignPoolModal,
  } = useContextualModal()

  const getAssignPoolsTooltip = () => {
    if (!canSubmitActions) {
      return 'You do not have permission to submit actions'
    }
    if (_isEmpty(selectedDevices)) {
      return 'Please select miners to assign pools'
    }
    return undefined
  }

  const handleAssignPoolSubmit = ({ pool }: { pool: PoolSummary }) => {
    const codesList = _map(selectedDevices, 'code')
    const selectedDeviceIds = _map(selectedDevices, 'id')
    dispatch(
      setAddPendingSubmissionAction({
        query: { id: { $in: selectedDeviceIds } },
        action: ACTION_TYPES.SETUP_POOLS,
        params: [
          {
            poolConfigId: pool.id,
            configType: 'pool',
          },
        ],
        overrideQuery: false,
        codesList,
        poolName: pool.name,
      }),
    )

    notifyInfo('Action added', 'Assign Pools')
    setSelectedDevices([])
    closeAssignPoolModal()
  }

  return (
    <PoolManagerDashboardRoot>
      <Header>
        <div>
          <div>Miner Explorer</div>
          <HeaderSubtitle>
            <HeaderSubtitleLink to={ROUTE.POOL_MANAGER}>
              <ArrowLeftOutlined /> Pool Manager
            </HeaderSubtitleLink>
          </HeaderSubtitle>
        </div>
        {ASSIGN_POOL_POPUP_ENABLED && (
          <Tooltip title={getAssignPoolsTooltip()}>
            <Button
              type="primary"
              onClick={() => openAssignPoolModal(undefined)}
              disabled={_isEmpty(selectedDevices)}
            >
              Assign Pool
            </Button>
          </Tooltip>
        )}
      </Header>
      <MinerExplorer selectedDevices={selectedDevices} onSelectionChange={setSelectedDevices} />
      {assignPoolModalOpen && (
        <AssignPoolModal
          isOpen={assignPoolModalOpen}
          onClose={closeAssignPoolModal}
          selectedDeviceIds={_map(selectedDevices, 'id')}
          onSubmit={handleAssignPoolSubmit}
        />
      )}
    </PoolManagerDashboardRoot>
  )
}

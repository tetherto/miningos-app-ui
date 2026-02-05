import { ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Tooltip from 'antd/es/tooltip'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'

import { Header, HeaderSubtitle, PoolManagerDashboardRoot } from '../PoolManagerDashboard.styles'

import { actionsSlice, selectPendingSubmissions } from '@/app/slices/actionsSlice'
import { appendIdToTag } from '@/app/utils/deviceUtils'
import { notifyInfo } from '@/app/utils/NotificationService'
import { DangerActionButton } from '@/Components/DangerActionButton/DangerActionButton'
import { AssignPoolModal } from '@/Components/PoolManager/MinerExplorer/AssignPoolModal/AssignPoolModal'
import { MinerExplorer } from '@/Components/PoolManager/MinerExplorer/MinerExplorer'
import {
  ASSIGN_POOL_POPUP_ENABLED,
  SETUP_POOLS_WARNING_MESSAGE,
} from '@/Components/PoolManager/PoolManager.constants'
import { ACTION_TYPES } from '@/constants/actions'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import { ROUTE } from '@/constants/routes'
import type { Device } from '@/hooks/hooks.types'
import { useContextualModal } from '@/hooks/useContextualModal'
import { useCheckPerm } from '@/hooks/usePermissions'
import { useUpdateExistedActions } from '@/hooks/useUpdateExistedActions'

const { setAddPendingSubmissionAction } = actionsSlice.actions

const actionsWritePermission = `${AUTH_PERMISSIONS.ACTIONS}:${AUTH_LEVELS.WRITE}`

export const PoolManagerMinerExplorer = () => {
  const dispatch = useDispatch()
  const { updateExistedActions } = useUpdateExistedActions()
  const pendingSubmissions = useSelector(selectPendingSubmissions)
  const canSubmitActions = useCheckPerm({ perm: actionsWritePermission })

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])

  const {
    modalOpen: assignPoolModalOpen,
    handleOpen: openAssignPoolModal,
    handleClose: closeAssignPoolModal,
  } = useContextualModal()

  const handleSetupPools = () => {
    const selectedDevicesTags = _map(selectedDeviceIds, (id) => appendIdToTag(id))
    updateExistedActions({
      actionType: ACTION_TYPES.SETUP_POOLS,
      pendingSubmissions: pendingSubmissions as unknown as Array<{
        id: number | string
        action: string
        tags: string[]
      }>,
      selectedDevices: selectedDeviceIds.map((id) => ({ id, type: '' }) as Device),
    })

    if (!_isEmpty(selectedDevicesTags)) {
      dispatch(
        setAddPendingSubmissionAction({
          type: 'voting',
          action: ACTION_TYPES.SETUP_POOLS,
          tags: selectedDevicesTags,
          params: [],
        }),
      )

      notifyInfo('Action added', 'Setup Pools')
    }
  }

  const getSetupPoolsTooltip = () => {
    if (!canSubmitActions) {
      return 'You do not have permission to submit actions'
    }
    if (_isEmpty(selectedDeviceIds)) {
      return 'Please select miners to setup pools'
    }
    return undefined
  }

  return (
    <PoolManagerDashboardRoot>
      <Header>
        <div>
          <div>Miner Explorer</div>
          <HeaderSubtitle>
            <Link to={ROUTE.POOL_MANAGER}>
              <ArrowLeftOutlined /> Pool Manager
            </Link>
          </HeaderSubtitle>
        </div>
        <Tooltip title={getSetupPoolsTooltip()}>
          <span>
            <DangerActionButton
              confirmation={{
                title: 'Setup Pools',
                description: SETUP_POOLS_WARNING_MESSAGE,
                onConfirm: () => handleSetupPools(),
                icon: <QuestionCircleOutlined style={{ color: 'red' }} />,
              }}
              label="Setup Pools"
              disabled={_isEmpty(selectedDeviceIds) || !canSubmitActions}
            />
          </span>
        </Tooltip>
        {ASSIGN_POOL_POPUP_ENABLED && (
          <Button type="primary" onClick={() => openAssignPoolModal(undefined)}>
            Assign Pool
          </Button>
        )}
      </Header>
      <MinerExplorer
        selectedDeviceIds={selectedDeviceIds}
        setSelectedDeviceIds={setSelectedDeviceIds}
      />
      {assignPoolModalOpen && (
        // @TODO: Remove this comment moment after AssignPoolModal TS migration is complete
        // @ts-expect-error - AssignPoolModal migration to TS complete for AssignPoolModal
        <AssignPoolModal isOpen={assignPoolModalOpen} onClose={closeAssignPoolModal} />
      )}
    </PoolManagerDashboardRoot>
  )
}

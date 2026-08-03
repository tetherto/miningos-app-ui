import Tooltip from 'antd/es/tooltip'
import { useState } from 'react'

import { useDeleteUserMutation } from '../../../app/services/api'
import { notifyError, notifySuccess } from '../../../app/utils/NotificationService'
import ChangeConfirmationModal from '../UserManagement/ChangeConfirmationModal'
import { usersWritePermission } from '../UserManagement/constants'

import ManageUserModal from './ManageUserModal'
import {
  DeleteButton,
  ManageButton,
  RoleBadge,
  TableCell,
  TableRow,
} from './RBACControlSettings.styles'
import { getRoleBadgeColors } from './roleColors'

import { useCheckPerm } from '@/hooks/usePermissions'

interface User {
  id: string
  name: string
  email: string
  role: string
  last_login?: string
  lastActive?: string
}

interface Role {
  value: string
  label: string
}

interface UserTableRowProps {
  user: User
  roles: Role[]
}

const UserTableRow = ({ user, roles }: UserTableRowProps) => {
  const [manageModalOpen, setManageModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [deleteUser] = useDeleteUserMutation()
  const showActions = useCheckPerm({ perm: usersWritePermission })

  const { color, bgColor } = getRoleBadgeColors(user.role || '')

  // Format role label for display
  const formatRoleLabel = (role?: string) => {
    if (!role) return 'Unknown'
    const roleMap: Record<string, string> = {
      admin: 'Admin',
      site_admin: 'Site Admin',
      site_operator: 'Site Operator',
      read_only_user: 'Read-Only User',
      developer: 'Developer',
    }
    return roleMap[role] || role
  }

  const handleDelete = async () => {
    try {
      const result = await deleteUser({
        data: {
          id: user.id,
        },
      })
      if ('error' in result) {
        notifyError('Failed to delete user', '')
      } else {
        notifySuccess('User deleted successfully', '')
        setDeleteModalOpen(false)
      }
    } catch {
      notifyError('Failed to delete user', '')
    }
  }

  const formatLastActive = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date
      .toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(',', ' ·')
  }

  return (
    <>
      <TableRow>
        <Tooltip title={user.name || 'N/A'} placement="topLeft">
          <TableCell>{user.name || 'N/A'}</TableCell>
        </Tooltip>
        <Tooltip title={user.email} placement="topLeft">
          <TableCell>{user.email}</TableCell>
        </Tooltip>
        <TableCell>
          <RoleBadge $color={color} $bgColor={bgColor}>
            {formatRoleLabel(user.role)}
          </RoleBadge>
        </TableCell>
        <TableCell>{formatLastActive(user.lastActive || user.last_login || undefined)}</TableCell>
        <TableCell $align="center" $noOverflow>
          {showActions && (
            <ManageButton onClick={() => setManageModalOpen(true)}>Manage User</ManageButton>
          )}
        </TableCell>
        <TableCell $align="right" $noOverflow>
          {showActions && (
            <DeleteButton onClick={() => setDeleteModalOpen(true)}>Delete</DeleteButton>
          )}
        </TableCell>
      </TableRow>

      {manageModalOpen && (
        <ManageUserModal
          open={manageModalOpen}
          onClose={() => setManageModalOpen(false)}
          user={user}
          roles={roles}
        />
      )}

      {deleteModalOpen && (
        <ChangeConfirmationModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onOk={handleDelete}
          title={`Delete ${user.email}?`}
          okText="Delete"
        >
          Are you sure you want to delete this user? This action is permanent and cannot be undone.
        </ChangeConfirmationModal>
      )}
    </>
  )
}

export default UserTableRow

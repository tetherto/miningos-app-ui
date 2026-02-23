import Button from 'antd/es/button'
import { useState } from 'react'

import {
  SettingsContainer,
  SettingsTitle,
  UserListActions,
  UserManagementHeader,
} from './Settings.styles'

import AddUserModal from '@/Components/Settings/UserManagement/AddUserModal'
import { usersWritePermission } from '@/Components/Settings/UserManagement/constants'
import UserList from '@/Components/Settings/UserManagement/UserList'
import { useCheckPerm } from '@/hooks/usePermissions'
import { useAppUserRoles } from '@/hooks/useUserRole'

const UserManagement = () => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const { userRoles } = useAppUserRoles()
  const showAdd = useCheckPerm({ perm: usersWritePermission })

  return (
    <SettingsContainer>
      <UserManagementHeader>
        <SettingsTitle>User Management</SettingsTitle>
        {showAdd && (
          <UserListActions>
            <Button type="primary" onClick={() => setAddModalOpen(true)}>
              Add User
            </Button>
          </UserListActions>
        )}
      </UserManagementHeader>
      <UserList />
      {addModalOpen && (
        <AddUserModal open onClose={() => setAddModalOpen(false)} roles={userRoles} />
      )}
    </SettingsContainer>
  )
}

export default UserManagement

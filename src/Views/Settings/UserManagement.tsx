import { useState } from 'react'

import { useGetFeaturesQuery } from '../../app/services/api'
import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import AddUserModal from '../../Components/Settings/UserManagement/AddUserModal'
import {
  usersReadPermission,
  usersWritePermission,
} from '../../Components/Settings/UserManagement/constants'
import UserList from '../../Components/Settings/UserManagement/UserList'
import { ActionButton, Title } from '../../Components/Shared'
import { useCheckPerm } from '../../hooks/usePermissions'
import NotFoundPage from '../NotFoundPage/NotFoundPage'

import { SettingsContainer, UserListActions, UserManagementHeader } from './Settings.styles'

import { Spinner } from '@/Components/Spinner/Spinner'
import { useAppUserRoles } from '@/hooks/useUserRole'
import type { FeatureFlagsData } from '@/types'

interface UserManagementProps {
  noFeatureCheck?: boolean
}

const UserManagement = ({ noFeatureCheck = false }: UserManagementProps) => {
  const { data } = useGetFeaturesQuery<FeatureFlagsData>(undefined)
  const userManagementEnabled = Boolean(data?.userManagement)
  const { userRoles, isLoading } = useAppUserRoles()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const showAdd = useCheckPerm({ perm: usersWritePermission })

  if (!noFeatureCheck && !userManagementEnabled) {
    return <NotFoundPage />
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <GateKeeper config={{ perm: usersReadPermission }}>
      <>
        <SettingsContainer>
          <UserManagementHeader>
            <Title>User Management</Title>
            <UserListActions>
              {showAdd && (
                <ActionButton onClick={() => setAddModalOpen(true)}>Add User</ActionButton>
              )}
            </UserListActions>
          </UserManagementHeader>
          <UserList />
        </SettingsContainer>
        {addModalOpen && (
          <AddUserModal open onClose={() => setAddModalOpen(false)} roles={userRoles} />
        )}
      </>
    </GateKeeper>
  )
}

export default UserManagement

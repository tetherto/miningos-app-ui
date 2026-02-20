import { SearchOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import { useMemo, useState } from 'react'

import { useGetUsersQuery } from '../../../app/services/api'
import AddUserModal from '../UserManagement/AddUserModal'
import { usersWritePermission } from '../UserManagement/constants'

import {
  ActionsRow,
  Description,
  RBACContainer,
  SearchContainer,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from './RBACControlSettings.styles'
import UserTableRow from './UserTableRow'

import { Spinner } from '@/Components/Spinner/Spinner'
import { useCheckPerm } from '@/hooks/usePermissions'
import { useRolesPermissions } from '@/hooks/useRolesPermissions'
import { useAppUserRoles } from '@/hooks/useUserRole'

interface User {
  id: string
  name: string
  email: string
  role: string
  last_login?: string
  lastActive?: string
}

const RBACControlSettings = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)

  const { data, isLoading } = useGetUsersQuery(undefined)
  const users = ((data as { users?: User[] })?.users || []) as User[]
  const { userRoles, isLoading: isLoadingRoles } = useAppUserRoles()
  const { roles: apiRoles, isLoading: isLoadingApiRoles } = useRolesPermissions()
  const showAdd = useCheckPerm({ perm: usersWritePermission })

  const rolesConfig = useMemo(
    () => (apiRoles.length > 0 ? apiRoles : userRoles),
    [apiRoles, userRoles],
  )

  const filteredUsers = users.filter((user: User) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    )
  })

  if (isLoading || isLoadingRoles || isLoadingApiRoles) {
    return <Spinner />
  }

  return (
    <RBACContainer>
      <Description>Manage user access across the organization</Description>

      <ActionsRow>
        <SearchContainer>
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </SearchContainer>
        {showAdd && (
          <Button type="primary" onClick={() => setAddModalOpen(true)}>
            Add User
          </Button>
        )}
      </ActionsRow>

      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Assigned Roles</TableHeaderCell>
            <TableHeaderCell>Last Active</TableHeaderCell>
            <TableHeaderCell $align="center">Manage</TableHeaderCell>
            <TableHeaderCell $align="right">Delete</TableHeaderCell>
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user: User) => (
            <UserTableRow key={user.id} user={user} roles={rolesConfig} />
          ))}
        </TableBody>
      </Table>

      {addModalOpen && (
        <AddUserModal open onClose={() => setAddModalOpen(false)} roles={rolesConfig} />
      )}
    </RBACContainer>
  )
}

export default RBACControlSettings

import Col from 'antd/es/col'
import Input from 'antd/es/input'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import type { ColumnsType } from 'antd/es/table'
import _map from 'lodash/map'
import { useState, ChangeEvent } from 'react'
import type { ComponentProps } from 'react'

import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '../../../app/services/api'
import { notifyError, notifySuccess } from '../../../app/utils/NotificationService'
import { useCheckPerm } from '../../../hooks/usePermissions'

import ChangeConfirmationModal from './ChangeConfirmationModal'
import { ERROR_CODES, usersWritePermission } from './constants'
import { filterUsers } from './filter'
import {
  DeleteUserButton,
  FilterWrapper,
  RoleSelect,
  RoleSelectInput,
  UserListTable,
  UserListTabPane,
} from './UserList.styles'

import AppTable from '@/Components/AppTable/AppTable'
import { withErrorBoundary } from '@/Components/ErrorBoundary'
import { Spinner } from '@/Components/Spinner/Spinner'
import { useAppUserRoles } from '@/hooks/useUserRole'

interface User {
  id: string
  name?: string
  email: string
  role: string
  [key: string]: unknown
}

interface RoleOption {
  value: string
  label: string
}

interface RoleChangeConfirmState {
  role: RoleOption
  user: User
}

interface DeleteConfirmState {
  user: User
}

const UserList = () => {
  const allowUpdate = useCheckPerm({ perm: usersWritePermission })
  const { userRoles, isLoading: isUserRolesLoading } = useAppUserRoles()

  const { data, isLoading: isFetching } = useGetUsersQuery(undefined)
  const users = ((data as { users?: User[] })?.users || []) as User[]
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  const [showRoleChangeConfirmFor, setShowRoleChangeConfirmFor] =
    useState<RoleChangeConfirmState | null>(null)
  const [showDeleteConfirmFor, setShowDeleteConfirmFor] = useState<DeleteConfirmState | null>(null)

  const loading = isUpdating || isFetching || isDeleting || isUserRolesLoading

  const handleRoleChange = (role: RoleOption, user: User) => {
    setShowRoleChangeConfirmFor({
      role,
      user,
    })
  }

  const handleRoleChangeConfirm = async () => {
    if (!showRoleChangeConfirmFor) {
      return
    }
    const role = showRoleChangeConfirmFor.role.value
    const user = showRoleChangeConfirmFor.user

    try {
      await updateUser({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
        },
      }).unwrap()
      notifySuccess('User role updated', '')
    } catch (error: unknown) {
      const errorObj = error as { data?: { message?: string } }
      const errorMessage = errorObj?.data?.message as keyof typeof ERROR_CODES | undefined
      notifyError(
        errorMessage && ERROR_CODES[errorMessage] ? ERROR_CODES[errorMessage] : ERROR_CODES.DEFAULT,
        '',
      )
    }

    setShowRoleChangeConfirmFor(null)
  }

  const handleRoleChangeCancel = () => {
    setShowRoleChangeConfirmFor(null)
  }

  const handleDeleteUser = (user: User) => {
    setShowDeleteConfirmFor({
      user,
    })
  }

  const handleDeleteUserConfirm = async () => {
    if (!showDeleteConfirmFor) {
      return
    }
    try {
      await deleteUser({
        data: {
          id: showDeleteConfirmFor.user.id,
        },
      }).unwrap()
      notifySuccess('User deleted', '')
    } catch (error: unknown) {
      const errorObj = error as { data?: { message?: string } }
      const errorMessage = errorObj?.data?.message as keyof typeof ERROR_CODES | undefined
      notifyError(
        errorMessage && ERROR_CODES[errorMessage] ? ERROR_CODES[errorMessage] : ERROR_CODES.DEFAULT,
        '',
      )
    }
    setShowDeleteConfirmFor(null)
  }

  const handleDeleteUserCancel = () => {
    setShowDeleteConfirmFor(null)
  }

  const [emailFilter, setEmailFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const handleRoleFilterChange = (value: unknown) => setRoleFilter(value as string | null)
  const handleEmailFilterChange = (event: ChangeEvent<HTMLInputElement>) =>
    setEmailFilter(event.target.value)

  const filteredUsers = filterUsers({
    users,
    email: emailFilter,
    role: roleFilter,
  })

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, user: User) => (
        <RoleSelect
          value={role}
          onChange={(value: unknown, option?: unknown) => {
            const stringValue = String(value)
            const optionArray = Array.isArray(option) ? option : [option]
            const singleOption = optionArray[0] as { children?: unknown } | undefined
            const roleOption: RoleOption = {
              value: stringValue,
              label: (singleOption?.children as string) || '',
            }
            handleRoleChange(roleOption, user)
          }}
          disabled={!allowUpdate}
        >
          {_map(userRoles, (item: RoleOption) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </RoleSelect>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, user: User) => (
        <DeleteUserButton danger disabled={!allowUpdate} onClick={() => handleDeleteUser(user)}>
          Delete
        </DeleteUserButton>
      ),
    },
  ]

  return (
    <UserListTabPane>
      {loading && <Spinner />}
      <FilterWrapper>
        <Row gutter={12}>
          <Col md={6}>
            <RoleSelectInput
              placeholder="Filter role"
              allowClear
              onChange={handleRoleFilterChange}
              value={roleFilter}
              options={userRoles}
            />
          </Col>
          <Col md={6}>
            <Input.Search
              placeholder="Search email"
              allowClear
              value={emailFilter}
              onChange={handleEmailFilterChange}
            />
          </Col>
        </Row>
      </FilterWrapper>
      <UserListTable
        rowKey="email"
        dataSource={filteredUsers}
        columns={columns as ComponentProps<typeof AppTable>['columns']}
        pagination={false}
      />
      {!!showRoleChangeConfirmFor && (
        <ChangeConfirmationModal
          open
          title="Confirm Role Change"
          onClose={handleRoleChangeCancel}
          onOk={handleRoleChangeConfirm}
        >
          Are you sure you want to change the role of {showRoleChangeConfirmFor.user.email} to{' '}
          {showRoleChangeConfirmFor.role.label}? This action may affect their access permissions and
          responsibilities within the platform. Please confirm to proceed.
        </ChangeConfirmationModal>
      )}
      {!!showDeleteConfirmFor && (
        <ChangeConfirmationModal
          open
          title={`Are you sure you want to delete ${showDeleteConfirmFor.user.email}`}
          onClose={handleDeleteUserCancel}
          onOk={handleDeleteUserConfirm}
        >
          Are you sure you want to delete this profile? This action is permanent and cannot be
          undone.
        </ChangeConfirmationModal>
      )}
    </UserListTabPane>
  )
}

export default withErrorBoundary(UserList)

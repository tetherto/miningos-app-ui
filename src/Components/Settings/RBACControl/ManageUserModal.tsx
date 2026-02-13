import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _trim from 'lodash/trim'
import { useState, useEffect } from 'react'
import * as yup from 'yup'

import { AddUserForm, AddUserModalBase, FormActions } from '../UserManagement/common.styles'
import { ERROR_CODES } from '../UserManagement/constants'

import {
  CheckIconWrapper,
  CloseIconWrapper,
  ReadOnlyIconWrapper,
  FieldContainer,
  FieldLabel,
  FullWidthSelect,
  HelperText,
  IconWrapper,
  PermissionsTable,
  PermissionsTableCell,
  PermissionsTableHeader,
  PermissionsTableHeaderCell,
  PermissionsTableRow,
  SectionContainer,
  SectionDescription,
  SectionTitle,
} from './ManageUserModal.styles'

import { useUpdateUserMutation } from '@/app/services/api'
import { FormikInput, FormikSelect } from '@/Components/FormInputs'
import { AUTH_PERMISSIONS, USER_ROLE } from '@/constants/permissions.constants'
import { useNotification } from '@/hooks/useNotification'

const validationSchema = yup.object({
  name: yup.string().required('Name is required').trim(),
  email: yup.string().email('This should be a valid email').required('Email is required').trim(),
  role: yup.string().required('Role is required'),
})

interface Role {
  value: string
  label: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface ManageUserModalProps {
  open: boolean
  onClose: () => void
  user: User
  roles: Role[]
}

// All permission categories with human-readable labels
const ALL_PERMISSIONS: { key: string; label: string }[] = [
  { key: AUTH_PERMISSIONS.USERS, label: 'Manage Users' },
  { key: AUTH_PERMISSIONS.SETTINGS, label: 'Manage Settings' },
  { key: AUTH_PERMISSIONS.ACTIONS, label: 'Actions' },
  { key: AUTH_PERMISSIONS.MINER, label: 'Miners' },
  { key: AUTH_PERMISSIONS.CONTAINER, label: 'Containers' },
  { key: AUTH_PERMISSIONS.MINERPOOL, label: 'Miner Pool' },
  { key: AUTH_PERMISSIONS.EXPLORER, label: 'Explorer' },
  { key: AUTH_PERMISSIONS.INVENTORY, label: 'Inventory' },
  { key: AUTH_PERMISSIONS.ALERTS, label: 'Alerts' },
  { key: AUTH_PERMISSIONS.COMMENTS, label: 'Comments' },
  { key: AUTH_PERMISSIONS.REPORTING, label: 'Reporting' },
  { key: AUTH_PERMISSIONS.REVENUE, label: 'Revenue' },
  { key: AUTH_PERMISSIONS.CABINETS, label: 'Cabinets' },
  { key: AUTH_PERMISSIONS.POWERMETER, label: 'Power Meter' },
  { key: AUTH_PERMISSIONS.ELECTRICITY, label: 'Electricity' },
  { key: AUTH_PERMISSIONS.FEATURES, label: 'Features' },
  { key: AUTH_PERMISSIONS.TICKETS, label: 'Tickets' },
]

type PermLevel = 'rw' | 'r' | false

// Map of role to permission levels (read/write, read-only, or no access)
const ROLE_PERMISSIONS: Record<string, Record<string, PermLevel>> = {
  [USER_ROLE.ADMIN]: Object.fromEntries(
    ALL_PERMISSIONS.map(({ key }) => [key, 'rw' as PermLevel]),
  ),
  [USER_ROLE.SITE_MANAGER]: {
    [AUTH_PERMISSIONS.USERS]: 'rw',
    [AUTH_PERMISSIONS.SETTINGS]: 'rw',
    [AUTH_PERMISSIONS.ACTIONS]: 'rw',
    [AUTH_PERMISSIONS.MINER]: 'rw',
    [AUTH_PERMISSIONS.CONTAINER]: 'rw',
    [AUTH_PERMISSIONS.MINERPOOL]: 'rw',
    [AUTH_PERMISSIONS.EXPLORER]: 'rw',
    [AUTH_PERMISSIONS.INVENTORY]: 'rw',
    [AUTH_PERMISSIONS.ALERTS]: 'rw',
    [AUTH_PERMISSIONS.COMMENTS]: 'rw',
    [AUTH_PERMISSIONS.REPORTING]: 'rw',
    [AUTH_PERMISSIONS.REVENUE]: 'r',
    [AUTH_PERMISSIONS.CABINETS]: 'rw',
    [AUTH_PERMISSIONS.POWERMETER]: 'r',
    [AUTH_PERMISSIONS.ELECTRICITY]: 'r',
    [AUTH_PERMISSIONS.FEATURES]: 'r',
    [AUTH_PERMISSIONS.TICKETS]: 'rw',
  },
  [USER_ROLE.REPORTING_TOOL_MANAGER]: {
    [AUTH_PERMISSIONS.USERS]: false,
    [AUTH_PERMISSIONS.SETTINGS]: 'r',
    [AUTH_PERMISSIONS.ACTIONS]: false,
    [AUTH_PERMISSIONS.MINER]: 'r',
    [AUTH_PERMISSIONS.CONTAINER]: 'r',
    [AUTH_PERMISSIONS.MINERPOOL]: 'r',
    [AUTH_PERMISSIONS.EXPLORER]: 'r',
    [AUTH_PERMISSIONS.INVENTORY]: 'r',
    [AUTH_PERMISSIONS.ALERTS]: 'r',
    [AUTH_PERMISSIONS.COMMENTS]: 'r',
    [AUTH_PERMISSIONS.REPORTING]: 'rw',
    [AUTH_PERMISSIONS.REVENUE]: 'rw',
    [AUTH_PERMISSIONS.CABINETS]: 'r',
    [AUTH_PERMISSIONS.POWERMETER]: 'r',
    [AUTH_PERMISSIONS.ELECTRICITY]: 'r',
    [AUTH_PERMISSIONS.FEATURES]: false,
    [AUTH_PERMISSIONS.TICKETS]: false,
  },
  [USER_ROLE.SITE_OPERATOR]: {
    [AUTH_PERMISSIONS.USERS]: false,
    [AUTH_PERMISSIONS.SETTINGS]: 'r',
    [AUTH_PERMISSIONS.ACTIONS]: 'rw',
    [AUTH_PERMISSIONS.MINER]: 'rw',
    [AUTH_PERMISSIONS.CONTAINER]: 'rw',
    [AUTH_PERMISSIONS.MINERPOOL]: 'r',
    [AUTH_PERMISSIONS.EXPLORER]: 'rw',
    [AUTH_PERMISSIONS.INVENTORY]: 'rw',
    [AUTH_PERMISSIONS.ALERTS]: 'rw',
    [AUTH_PERMISSIONS.COMMENTS]: 'rw',
    [AUTH_PERMISSIONS.REPORTING]: 'r',
    [AUTH_PERMISSIONS.REVENUE]: false,
    [AUTH_PERMISSIONS.CABINETS]: 'rw',
    [AUTH_PERMISSIONS.POWERMETER]: 'r',
    [AUTH_PERMISSIONS.ELECTRICITY]: 'r',
    [AUTH_PERMISSIONS.FEATURES]: false,
    [AUTH_PERMISSIONS.TICKETS]: 'rw',
  },
  [USER_ROLE.FIELD_OPERATOR]: {
    [AUTH_PERMISSIONS.USERS]: false,
    [AUTH_PERMISSIONS.SETTINGS]: false,
    [AUTH_PERMISSIONS.ACTIONS]: 'r',
    [AUTH_PERMISSIONS.MINER]: 'r',
    [AUTH_PERMISSIONS.CONTAINER]: 'r',
    [AUTH_PERMISSIONS.MINERPOOL]: 'r',
    [AUTH_PERMISSIONS.EXPLORER]: 'r',
    [AUTH_PERMISSIONS.INVENTORY]: 'r',
    [AUTH_PERMISSIONS.ALERTS]: 'r',
    [AUTH_PERMISSIONS.COMMENTS]: 'rw',
    [AUTH_PERMISSIONS.REPORTING]: 'r',
    [AUTH_PERMISSIONS.REVENUE]: false,
    [AUTH_PERMISSIONS.CABINETS]: 'r',
    [AUTH_PERMISSIONS.POWERMETER]: 'r',
    [AUTH_PERMISSIONS.ELECTRICITY]: 'r',
    [AUTH_PERMISSIONS.FEATURES]: false,
    [AUTH_PERMISSIONS.TICKETS]: 'r',
  },
  [USER_ROLE.REPAIR_TECHNICIAN]: {
    [AUTH_PERMISSIONS.USERS]: false,
    [AUTH_PERMISSIONS.SETTINGS]: false,
    [AUTH_PERMISSIONS.ACTIONS]: false,
    [AUTH_PERMISSIONS.MINER]: 'r',
    [AUTH_PERMISSIONS.CONTAINER]: 'r',
    [AUTH_PERMISSIONS.MINERPOOL]: false,
    [AUTH_PERMISSIONS.EXPLORER]: 'r',
    [AUTH_PERMISSIONS.INVENTORY]: 'rw',
    [AUTH_PERMISSIONS.ALERTS]: 'r',
    [AUTH_PERMISSIONS.COMMENTS]: 'rw',
    [AUTH_PERMISSIONS.REPORTING]: false,
    [AUTH_PERMISSIONS.REVENUE]: false,
    [AUTH_PERMISSIONS.CABINETS]: 'r',
    [AUTH_PERMISSIONS.POWERMETER]: false,
    [AUTH_PERMISSIONS.ELECTRICITY]: false,
    [AUTH_PERMISSIONS.FEATURES]: false,
    [AUTH_PERMISSIONS.TICKETS]: 'rw',
  },
  [USER_ROLE.READ_ONLY]: {
    [AUTH_PERMISSIONS.USERS]: false,
    [AUTH_PERMISSIONS.SETTINGS]: 'r',
    [AUTH_PERMISSIONS.ACTIONS]: false,
    [AUTH_PERMISSIONS.MINER]: 'r',
    [AUTH_PERMISSIONS.CONTAINER]: 'r',
    [AUTH_PERMISSIONS.MINERPOOL]: 'r',
    [AUTH_PERMISSIONS.EXPLORER]: 'r',
    [AUTH_PERMISSIONS.INVENTORY]: 'r',
    [AUTH_PERMISSIONS.ALERTS]: 'r',
    [AUTH_PERMISSIONS.COMMENTS]: 'r',
    [AUTH_PERMISSIONS.REPORTING]: 'r',
    [AUTH_PERMISSIONS.REVENUE]: false,
    [AUTH_PERMISSIONS.CABINETS]: 'r',
    [AUTH_PERMISSIONS.POWERMETER]: 'r',
    [AUTH_PERMISSIONS.ELECTRICITY]: 'r',
    [AUTH_PERMISSIONS.FEATURES]: false,
    [AUTH_PERMISSIONS.TICKETS]: false,
  },
}

const formatPermLevel = (level: PermLevel): string => {
  if (level === 'rw') return 'Read & Write'
  if (level === 'r') return 'Read Only'
  return 'No Access'
}

const ManageUserModal = ({ open, onClose, user, roles }: ManageUserModalProps) => {
  const { notifyError, notifySuccess } = useNotification()
  const [updateUser] = useUpdateUserMutation()
  const [selectedRole, setSelectedRole] = useState(user.role)

  const formik = useFormik({
    initialValues: {
      name: user.name || '',
      email: user.email,
      role: user.role,
    },
    validationSchema,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (rawValues) => {
      const values = validationSchema.cast(rawValues)
      try {
        await updateUser({
          data: {
            id: user.id,
            name: _trim(values.name),
            email: _trim(values.email),
            role: values.role,
          },
        }).unwrap()

        onClose()
        notifySuccess('User updated', 'User has been successfully updated')
      } catch (error) {
        const err = error as { data?: { message?: string } }
        notifyError(
          'Error updating user',
          err?.data?.message
            ? ERROR_CODES[err.data.message as keyof typeof ERROR_CODES] || ERROR_CODES.DEFAULT
            : ERROR_CODES.DEFAULT,
        )
      }
    },
  })

  useEffect(() => {
    setSelectedRole(formik.values.role)
  }, [formik.values.role])

  const rolePerms = ROLE_PERMISSIONS[selectedRole] || {}

  return (
    <AddUserModalBase
      open={open}
      onCancel={onClose}
      title="Manage User"
      footer={false}
      maskClosable={false}
      width={600}
    >
      <FormikProvider value={formik}>
        <AddUserForm onSubmit={formik.handleSubmit}>
          <SectionContainer>
            <SectionTitle>User Information</SectionTitle>
            <SectionDescription>Edit the user&apos;s basic details.</SectionDescription>

            <FieldContainer>
              <FieldLabel>Name</FieldLabel>
              <FormikInput name="name" placeholder="Enter full name" />
            </FieldContainer>

            <FieldContainer>
              <FieldLabel>Email</FieldLabel>
              <FormikInput name="email" placeholder="Enter email address" />
            </FieldContainer>

            <HelperText>
              Changes to name or email are saved along with the selected role.
            </HelperText>
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Assigned Role</SectionTitle>
            <SectionDescription>Select the user&apos;s access level within MOS.</SectionDescription>

            <FieldContainer>
              <FieldLabel>Role</FieldLabel>
              <FullWidthSelect>
                <FormikSelect
                  name="role"
                  placeholder="Select role"
                  options={roles.map((item: Role) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                />
              </FullWidthSelect>
            </FieldContainer>

            <HelperText>
              The permissions summary below updates automatically when changing this selection.
            </HelperText>
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Effective Permissions</SectionTitle>
            <SectionDescription>
              The actions available to this user as a{' '}
              {roles.find((r) => r.value === selectedRole)?.label || selectedRole}.
            </SectionDescription>

            <PermissionsTable>
              <PermissionsTableHeader>
                <PermissionsTableHeaderCell $flex={1}>Permission</PermissionsTableHeaderCell>
                <PermissionsTableHeaderCell $width="120px" $align="center">
                  Access Level
                </PermissionsTableHeaderCell>
              </PermissionsTableHeader>

              {ALL_PERMISSIONS.map(({ key, label }) => {
                const level = rolePerms[key] ?? false
                return (
                  <PermissionsTableRow key={key}>
                    <PermissionsTableCell $flex={1}>{label}</PermissionsTableCell>
                    <IconWrapper $width="120px" $align="center">
                      {level === 'rw' ? (
                        <CheckIconWrapper>
                          <CheckOutlined /> {formatPermLevel(level)}
                        </CheckIconWrapper>
                      ) : level === 'r' ? (
                        <ReadOnlyIconWrapper>
                          <CheckOutlined /> {formatPermLevel(level)}
                        </ReadOnlyIconWrapper>
                      ) : (
                        <CloseIconWrapper>
                          <CloseOutlined /> {formatPermLevel(level)}
                        </CloseIconWrapper>
                      )}
                    </IconWrapper>
                  </PermissionsTableRow>
                )
              })}
            </PermissionsTable>
          </SectionContainer>

          <FormActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
              Save Changes
            </Button>
          </FormActions>
        </AddUserForm>
      </FormikProvider>
    </AddUserModalBase>
  )
}

export default ManageUserModal

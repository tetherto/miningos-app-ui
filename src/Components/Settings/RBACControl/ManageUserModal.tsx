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
import { PERMISSION_LABELS, ROLE_PERMISSIONS, type PermLevel } from './rolePermissions'

import { useUpdateUserMutation } from '@/app/services/api'
import { FormikInput, FormikSelect } from '@/Components/FormInputs'
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

const PermissionIcon = ({ level }: { level: PermLevel }) => {
  if (level === 'rw') {
    return (
      <CheckIconWrapper>
        <CheckOutlined /> Read &amp; Write
      </CheckIconWrapper>
    )
  }
  if (level === 'r') {
    return (
      <ReadOnlyIconWrapper>
        <CheckOutlined /> Read Only
      </ReadOnlyIconWrapper>
    )
  }
  return (
    <CloseIconWrapper>
      <CloseOutlined /> No Access
    </CloseIconWrapper>
  )
}

const permissionKeys = Object.keys(PERMISSION_LABELS)

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

              {permissionKeys.map((key) => {
                const level: PermLevel = rolePerms[key] ?? false
                return (
                  <PermissionsTableRow key={key}>
                    <PermissionsTableCell $flex={1}>
                      {PERMISSION_LABELS[key]}
                    </PermissionsTableCell>
                    <IconWrapper $width="120px" $align="center">
                      <PermissionIcon level={level} />
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

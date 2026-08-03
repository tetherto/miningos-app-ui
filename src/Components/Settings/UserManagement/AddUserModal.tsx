import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _trim from 'lodash/trim'
import * as yup from 'yup'

import { FieldContainer, FieldLabel, FullWidthSelect, HelperText } from './AddUserModal.styles'
import { AddUserForm, AddUserModalBase, FormActions } from './common.styles'
import { ERROR_CODES } from './constants'

import { useCreateUserMutation } from '@/app/services/api'
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

interface AddUserModalProps {
  open: boolean
  onClose: () => void
  roles: Role[]
}

const AddUserModal = ({ open, onClose, roles }: AddUserModalProps) => {
  const { notifyError, notifySuccess } = useNotification()
  const [createUser] = useCreateUserMutation()

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      role: null,
    },
    validationSchema,
    validateOnChange: false,
    onSubmit: async (rawValues) => {
      const values = validationSchema.cast(rawValues)
      try {
        await createUser({
          data: {
            ...values,
            name: _trim(values.name),
            email: _trim(values.email),
          },
        }).unwrap()

        onClose()
        notifySuccess('User created', 'User has been successfully created')
      } catch (error) {
        const err = error as { data?: { message?: string } }
        notifyError(
          'Error creating user',
          err?.data?.message
            ? ERROR_CODES[err.data.message as keyof typeof ERROR_CODES] || ERROR_CODES.DEFAULT
            : ERROR_CODES.DEFAULT,
        )
      }
    },
  })

  return (
    <AddUserModalBase
      open={open}
      onCancel={onClose}
      title="Add New User"
      footer={false}
      maskClosable={false}
    >
      <FormikProvider value={formik}>
        <AddUserForm onSubmit={formik.handleSubmit}>
          <FieldContainer>
            <FieldLabel>Name</FieldLabel>
            <FormikInput name="name" placeholder="Enter full name" />
          </FieldContainer>
          <FieldContainer>
            <FieldLabel>Email</FieldLabel>
            <FormikInput name="email" placeholder="Enter email address" />
          </FieldContainer>
          <FieldContainer>
            <FieldLabel>Assign Role</FieldLabel>
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
            <HelperText>Each new user must have a single role assigned at creation.</HelperText>
          </FieldContainer>
          <FormActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
              Add User
            </Button>
          </FormActions>
        </AddUserForm>
      </FormikProvider>
    </AddUserModalBase>
  )
}

export default AddUserModal

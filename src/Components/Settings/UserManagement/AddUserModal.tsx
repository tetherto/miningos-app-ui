import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _trim from 'lodash/trim'
import * as yup from 'yup'

import { AddUserForm, AddUserModalBase, FormActions } from './common.styles'
import { ERROR_CODES } from './constants'

import { useCreateUserMutation } from '@/app/services/api'
import { FormikInput, FormikSelect } from '@/Components/FormInputs'
import { useNotification } from '@/hooks/useNotification'

const validationSchema = yup.object({
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
      title="Add user"
      footer={false}
      maskClosable={false}
    >
      <FormikProvider value={formik}>
        <AddUserForm onSubmit={formik.handleSubmit}>
          <div>
            <FormikInput name="email" placeholder="Email" />
          </div>
          <div>
            <FormikSelect
              name="role"
              placeholder="Role"
              options={roles.map((item: Role) => ({
                value: item.value,
                label: item.label,
              }))}
              style={{
                width: '100%',
              }}
            />
          </div>
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

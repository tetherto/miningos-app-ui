import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import type { FC } from 'react'
import * as yup from 'yup'

import {
  FieldLabel,
  FormActions,
  FormField,
  ModalBody,
  ModalTitle,
  StyledModal,
} from '../../PoolManager.common.styles'
import {
  POOL_ENDPOINT_REGIONS_OPTIONS,
  POOL_ENDPOINT_ROLES_OPTIONS,
} from '../../PoolManager.constants'

import { FormikInput, FormikSelect } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'

const validationSchema = yup.object({
  role: yup.string().required('Role is required'),
  host: yup.string().required('Host is required'),
  port: yup.string().required('Port is required'),
  region: yup.string().required('Region is required'),
})

interface AddPoolEndpointModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: unknown) => void
}

export const AddPoolEndpointModal: FC<AddPoolEndpointModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const isLoading = false

  const formik = useFormik({
    initialValues: {
      role: null,
      host: '',
      port: '',
      region: null,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values)
      onClose()
    },
  })

  return (
    <StyledModal
      title={<ModalTitle>Add Endpoint</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={400}
      maskClosable={false}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <FormField>
                <FieldLabel>Role</FieldLabel>
                <FormikSelect name="role" options={POOL_ENDPOINT_ROLES_OPTIONS} />
              </FormField>
              <FormField>
                <FieldLabel>Host</FieldLabel>
                <FormikInput name="host" />
              </FormField>
              <FormField>
                <FieldLabel>Port</FieldLabel>
                <FormikInput name="port" />
              </FormField>
              <FormField>
                <FieldLabel>Region</FieldLabel>
                <FormikSelect name="region" options={POOL_ENDPOINT_REGIONS_OPTIONS} />
              </FormField>
              <FormActions>
                <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                  Save
                </Button>
                <Button onClick={onClose} disabled={formik.isSubmitting}>
                  Cancel
                </Button>
              </FormActions>
            </ModalBody>
          </form>
        </FormikProvider>
      )}
    </StyledModal>
  )
}

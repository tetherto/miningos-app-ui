import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _isNil from 'lodash/isNil'
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
import { PoolEndpointFormValues } from '@/Views/PoolManager/types'

const validationSchema = yup.object({
  role: yup.string().nullable(),
  host: yup.string().required('Host is required'),
  port: yup.string().required('Port is required'),
  pool: yup.string().required('Pool is required'),
  region: yup.string().nullable(),
})

interface AddPoolEndpointModalProps {
  endpoint?: PoolEndpointFormValues
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: PoolEndpointFormValues) => void
}

const SHOW_ADDITIONAL_FIELDS = false
const emptyInitialValues = {
  role: null,
  host: '',
  port: '',
  pool: '',
  region: null,
}

export const AddPoolEndpointModal: FC<AddPoolEndpointModalProps> = ({
  endpoint,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const isLoading = false
  const isEditMode = !_isNil(endpoint)
  const formik = useFormik({
    initialValues: !isEditMode
      ? emptyInitialValues
      : {
          role: null,
          region: null,
          host: endpoint.host,
          port: endpoint.port,
          pool: endpoint.pool,
        },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values)
    },
  })

  return (
    <StyledModal
      title={<ModalTitle>{isEditMode ? 'Edit' : 'Add'} Endpoint</ModalTitle>}
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
              {SHOW_ADDITIONAL_FIELDS && (
                <FormField>
                  <FieldLabel>Role</FieldLabel>
                  <FormikSelect name="role" options={POOL_ENDPOINT_ROLES_OPTIONS} />
                </FormField>
              )}
              <FormField>
                <FieldLabel>Host</FieldLabel>
                <FormikInput name="host" />
              </FormField>
              <FormField>
                <FieldLabel>Port</FieldLabel>
                <FormikInput name="port" />
              </FormField>
              <FormField>
                <FieldLabel>Pool</FieldLabel>
                <FormikInput name="pool" />
              </FormField>
              {SHOW_ADDITIONAL_FIELDS && (
                <FormField>
                  <FieldLabel>Region</FieldLabel>
                  <FormikSelect name="region" options={POOL_ENDPOINT_REGIONS_OPTIONS} />
                </FormField>
              )}
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

import { CheckSquareFilled, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _pullAt from 'lodash/pullAt'
import * as yup from 'yup'

import {
  FieldLabel,
  FormActions,
  FormField,
  FormSectionHeader,
  ModalBody,
  ModalTitle,
  StyledModal,
} from '../../PoolManager.common.styles'
import { POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_OPTIONS } from '../../PoolManager.constants'
import { AddPoolEndpointModal } from '../AddPoolEndpointModal/AddPoolEndpointModal'

import {
  EndpointFields,
  EndpointFieldValue,
  EndpointHeader,
  EndpointPointRole,
  EndpointsSection,
  EndpointsSectionHeader,
  EndpointsWrapper,
  EndpointWrapper,
  SectionHeader,
  SectionHeaderTitle,
  ValidationStatus,
  ValidationStatusIcon,
  ValidationStatusIndicator,
  ValidationStatusSection,
  ValidationStatusWrapper,
} from './AddPoolModal.styles'

import { FormikInput, FormikSelect } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { useContextualModal } from '@/hooks/useContextualModal'

const validationSchema = yup.object({
  role: yup.string().required('Role is required'),
  host: yup.string().required('Host is required'),
  port: yup.string().required('Port is required'),
  region: yup.string().required('Region is required'),
})

interface Endpoint {
  role: string
  host: string
  port: string
  region: string
}

interface FormValues {
  groupName: string
  description: string
  workerName: string
  suffixType: string | null
  endpoints: Endpoint[]
}

interface AddPoolModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export const AddPoolModal = ({ isOpen, onClose }: AddPoolModalProps) => {
  const isLoading = false

  const formik = useFormik<FormValues>({
    initialValues: {
      groupName: '',
      description: '',
      workerName: '',
      suffixType: null,
      endpoints: [
        {
          role: 'PRIMARY',
          host: 'abcd',
          port: 'abcd',
          region: 'EUROPE',
        },
      ],
    },
    validationSchema,
    onSubmit: () => {},
  })

  const {
    modalOpen: addEndpointModalOpen,
    handleOpen: openAddEndpointModal,
    handleClose: closeAddEndpointModal,
  } = useContextualModal()

  const handleAddEndpointSubmit = (values: Endpoint) => {
    const { host, port, role, region } = values
    formik.setFieldValue('endpoints', [...formik.values.endpoints, { host, port, role, region }])
  }

  const deleteEndpointAtIndex = (index: number) => {
    _pullAt(formik.values.endpoints, [index])
    formik.setFieldValue('endpoints', [...formik.values.endpoints])
  }

  const isPoolValidated = false
  const poolValidationColor = isPoolValidated ? COLOR.GREEN : COLOR.RED

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
              <FormSectionHeader>GROUP INFO</FormSectionHeader>
              <FormField>
                <FieldLabel>Group Name</FieldLabel>
                <FormikInput name="groupName" />
              </FormField>
              <EndpointsSection>
                <EndpointsSectionHeader>
                  <FormSectionHeader>ENDPOINTS CONFIGURATION</FormSectionHeader>
                  <Button onClick={openAddEndpointModal}>Add Endpoint</Button>
                </EndpointsSectionHeader>
                <EndpointsWrapper>
                  {formik.values.endpoints.map((endpoint, index) => (
                    <EndpointWrapper key={index}>
                      <EndpointHeader>
                        <EndpointPointRole>{endpoint.role}</EndpointPointRole>
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => deleteEndpointAtIndex(index)}
                        />
                      </EndpointHeader>
                      <EndpointFields>
                        <FormField>
                          <FieldLabel>Host</FieldLabel>
                          <EndpointFieldValue>{endpoint.host}</EndpointFieldValue>
                        </FormField>
                        <FormField>
                          <FieldLabel>Port</FieldLabel>
                          <EndpointFieldValue>{endpoint.port}</EndpointFieldValue>
                        </FormField>
                      </EndpointFields>
                    </EndpointWrapper>
                  ))}
                </EndpointsWrapper>
              </EndpointsSection>
              <FormSectionHeader>CREDENTIALS TEMPLATE</FormSectionHeader>
              <FormField>
                <FieldLabel>Worker Name</FieldLabel>
                <FormikInput name="workerName" />
              </FormField>
              <FormField>
                <FieldLabel>Suffix Type</FieldLabel>
                <FormikSelect
                  name="suffixType"
                  options={POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_OPTIONS}
                />
              </FormField>
              <ValidationStatusSection>
                <SectionHeader>
                  <SectionHeaderTitle>Validation Status</SectionHeaderTitle>
                </SectionHeader>
                <ValidationStatusWrapper>
                  <ValidationStatusIndicator>
                    <ValidationStatusIcon $color={poolValidationColor}>
                      {isPoolValidated ? <CheckSquareFilled /> : <CloseCircleOutlined />}
                    </ValidationStatusIcon>
                    <ValidationStatus $color={poolValidationColor}>
                      {isPoolValidated
                        ? 'Configuration validated successfully'
                        : 'Configuration not validated'}
                    </ValidationStatus>
                  </ValidationStatusIndicator>
                  <Button>Test Configuration</Button>
                </ValidationStatusWrapper>
              </ValidationStatusSection>
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
      {addEndpointModalOpen && (
        <AddPoolEndpointModal
          isOpen={addEndpointModalOpen}
          onClose={closeAddEndpointModal}
          onSubmit={handleAddEndpointSubmit as (values: unknown) => void}
        />
      )}
    </StyledModal>
  )
}

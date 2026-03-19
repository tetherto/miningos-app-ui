import { CheckSquareFilled, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _get from 'lodash/get'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _pullAt from 'lodash/pullAt'
import _size from 'lodash/size'
import { useDispatch } from 'react-redux'
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
import {
  MAX_POOL_ENDPOINTS,
  POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_OPTIONS,
  POOL_ENDPOINT_INDEX_ROLES,
  POOL_ENDPOINT_ROLES_LABELS,
  SHOW_CREDENTIAL_TEMPLATE,
  SHOW_POOL_VALIDATION,
} from '../../PoolManager.constants'
import { AddPoolEndpointModal } from '../AddPoolEndpointModal/AddPoolEndpointModal'

import {
  EndpointFields,
  EndpointFieldValue,
  EndpointHeader,
  EndpointPointRole,
  EndpointsSection,
  EndpointsSectionError,
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

import { actionsSlice } from '@/app/slices/actionsSlice'
import { notifyInfo } from '@/app/utils/NotificationService'
import { FormikInput, FormikSelect } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ACTION_TYPES } from '@/constants/actions'
import { COLOR } from '@/constants/colors'
import { useContextualModal } from '@/hooks/useContextualModal'
import { PoolEndpoint } from '@/Views/PoolManager/types'

const validationSchema = yup.object({
  groupName: yup.string().required('Name is required'),
  description: yup.string(),
  workerName: yup.string().required('Port is required'),
  workerPassword: yup.string().required('Region is required'),
  endpoints: yup.array().required().min(1, 'At least one endpoint is needed'),
})

interface FormValues {
  groupName: string
  description: string
  workerName: string
  workerPassword: string
  suffixType: string | null
  endpoints: PoolEndpoint[]
}

interface AddPoolModalProps {
  isOpen?: boolean
  onClose: () => void
}

const { setAddPendingSubmissionAction } = actionsSlice.actions

export const AddPoolModal = ({ isOpen, onClose }: AddPoolModalProps) => {
  const isLoading = false
  const dispatch = useDispatch()

  const formik = useFormik<FormValues>({
    initialValues: {
      groupName: '',
      description: '',
      workerName: '',
      workerPassword: '',
      suffixType: null,
      endpoints: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      const { groupName, description, workerName, workerPassword, endpoints } = values

      dispatch(
        setAddPendingSubmissionAction({
          type: 'voting',
          action: ACTION_TYPES.REGISTER_POOL_CONFIG,
          params: [
            {
              type: 'pool',
              data: {
                poolConfigName: groupName,
                description,
                poolUrls: _map(endpoints, (endpoint) => {
                  const { host, port, pool } = endpoint
                  return {
                    url: `stratum+tcp://${host}:${port}`,
                    workerName,
                    workerPassword,
                    pool,
                  }
                }),
              },
            },
          ],
        }),
      )

      notifyInfo('Action added', 'Pool config registration')
      onClose()
    },
  })

  const {
    modalOpen: addEndpointModalOpen,
    handleOpen: openAddEndpointModal,
    handleClose: closeAddEndpointModal,
  } = useContextualModal()

  const handleAddEndpointSubmit = (values: PoolEndpoint) => {
    const { host, port, role, region, pool } = values
    formik.setFieldValue('endpoints', [
      ...formik.values.endpoints,
      { host, port, role, region, pool },
    ])
    closeAddEndpointModal()
  }

  const deleteEndpointAtIndex = (index: number) => {
    _pullAt(formik.values.endpoints, [index])
    formik.setFieldValue('endpoints', [...formik.values.endpoints])
  }

  const isPoolValidated = false
  const poolValidationColor = isPoolValidated ? COLOR.GREEN : COLOR.RED

  const disableAddEndpointButton = _size(formik.values.endpoints) >= MAX_POOL_ENDPOINTS
  const endpointsError = formik.errors.endpoints
  const showEndpointsError =
    !_isNil(endpointsError) && formik.touched.endpoints && typeof endpointsError === 'string'

  return (
    <StyledModal
      title={<ModalTitle>Add Pool</ModalTitle>}
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
              <FormField>
                <FieldLabel>Description</FieldLabel>
                <FormikInput name="description" />
              </FormField>
              <EndpointsSection>
                <EndpointsSectionHeader>
                  <FormSectionHeader>ENDPOINTS CONFIGURATION</FormSectionHeader>
                  <Button onClick={openAddEndpointModal} disabled={disableAddEndpointButton}>
                    Add Endpoint
                  </Button>
                </EndpointsSectionHeader>
                {showEndpointsError && (
                  <EndpointsSectionError>{endpointsError}</EndpointsSectionError>
                )}
                <EndpointsWrapper>
                  {formik.values.endpoints.map((endpoint, index) => (
                    <EndpointWrapper key={index}>
                      <EndpointHeader>
                        <EndpointPointRole>
                          {_get(
                            POOL_ENDPOINT_ROLES_LABELS,
                            _get(POOL_ENDPOINT_INDEX_ROLES, index, 'FAILOVER'),
                            'FAILOVER',
                          )}
                        </EndpointPointRole>
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
                <FieldLabel>Worker Password</FieldLabel>
                <FormikInput name="workerPassword" />
              </FormField>
              {SHOW_CREDENTIAL_TEMPLATE && (
                <FormField>
                  <FieldLabel>Suffix Type</FieldLabel>
                  <FormikSelect
                    name="suffixType"
                    options={POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_OPTIONS}
                  />
                </FormField>
              )}
              {SHOW_POOL_VALIDATION && (
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

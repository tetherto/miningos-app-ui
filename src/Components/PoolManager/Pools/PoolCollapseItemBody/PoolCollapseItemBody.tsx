import { CheckSquareFilled, CloseCircleOutlined, EditOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _size from 'lodash/size'
import { useDispatch } from 'react-redux'

import { StatusBlock } from '../../PoolManager.common.styles'
import {
  ADD_ENDPOINT_ENABLED,
  EDIT_ENDPOINT_ENABLED,
  MAX_POOL_ENDPOINTS,
  POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_LABELS,
  POOL_ENDPOINT_INDEX_ROLES,
  POOL_ENDPOINT_ROLE_COLORS,
  POOL_ENDPOINT_ROLES_LABELS,
  POOL_STATUS_INDICATOR_ENABLED,
  POOL_VALIDATION_STATUSES,
} from '../../PoolManager.constants'
import { AddPoolEndpointModal } from '../AddPoolEndpointModal/AddPoolEndpointModal'

import {
  BodyWrapper,
  CredentialField,
  CredentialFieldLabel,
  CredentialFieldValue,
  CredentialsSection,
  CredentialsWrapper,
  EndpointAction,
  EndpointField,
  EndpointFieldTitle,
  EndpointFieldValue,
  EndpointRole,
  EndpointRoleName,
  Endpoints,
  EndpointsList,
  EndpointWrapper,
  SectionHeader,
  SectionHeaderTitle,
  ValidationStatus,
  ValidationStatusIcon,
  ValidationStatusIndicator,
  ValidationStatusSection,
  ValidationStatusWrapper,
  ValidationTimestamp,
} from './PoolCollapseItemBody.styles'

import { actionsSlice } from '@/app/slices/actionsSlice'
import { notifyInfo } from '@/app/utils/NotificationService'
import { ACTION_TYPES } from '@/constants/actions'
import { COLOR } from '@/constants/colors'
import { useContextualModal } from '@/hooks/useContextualModal'
import { PoolEndpoint, PoolEndpointFormValues, PoolSummary } from '@/Views/PoolManager/types'

interface PoolCollapseItemBodyProps {
  pool: PoolSummary
}

const { setAddPendingSubmissionAction } = actionsSlice.actions

export const PoolCollapseItemBody = ({ pool }: PoolCollapseItemBodyProps) => {
  const dispatch = useDispatch()

  const isPoolValidated = pool.validation?.status === POOL_VALIDATION_STATUSES.TESTED
  const poolValidationColor = isPoolValidated ? COLOR.GREEN : COLOR.RED

  const {
    modalOpen: addEndpointModalOpen,
    handleOpen: openAddEndpointModal,
    handleClose: closeAddEndpointModal,
    subject: endpointEditData,
  } = useContextualModal<
    | {
        endpoint: PoolEndpoint
        index: number
      }
    | undefined
  >()

  const handleAddEndpoint = (values: PoolEndpointFormValues) => {
    const { workerName, workerPassword } = pool

    const originalPoolUrls = _map(pool.endpoints, (endpoint) => {
      const { host, port, pool: poolName } = endpoint
      return {
        url: `stratum+tcp://${host}:${port}`,
        workerName,
        workerPassword,
        pool: poolName,
      }
    })
    const newPoolUrl = {
      url: `stratum+tcp://${values.host}:${values.port}`,
      workerName,
      workerPassword,
      pool: values.pool,
    }

    let poolUrls

    if (_isNil(endpointEditData)) {
      // New Endpoint
      poolUrls = [...originalPoolUrls, newPoolUrl]
    } else {
      // Edit existing endpoint
      poolUrls = _map(originalPoolUrls, (poolUrlData, index) => {
        if (index !== endpointEditData.index) {
          return poolUrlData
        }
        return newPoolUrl
      })
    }

    dispatch(
      setAddPendingSubmissionAction({
        action: ACTION_TYPES.UPDATE_POOL_CONFIG,
        params: [
          {
            type: 'pool',
            id: pool.id,
            data: {
              poolConfigName: pool.name,
              description: pool.description,
              poolUrls,
            },
          },
        ],
      }),
    )

    notifyInfo('Action added', 'Update Pool config')

    closeAddEndpointModal()
  }

  const showAddEndpointButton = _size(pool.endpoints) < MAX_POOL_ENDPOINTS
  return (
    <>
      <BodyWrapper>
        <Endpoints>
          <SectionHeader>
            <SectionHeaderTitle>Endpoints Configuration</SectionHeaderTitle>
            {ADD_ENDPOINT_ENABLED && showAddEndpointButton && (
              <Button type="link" onClick={() => openAddEndpointModal(undefined)}>
                + Add Endpoint
              </Button>
            )}
          </SectionHeader>
          <EndpointsList>
            {_isEmpty(pool.endpoints) ? (
              <div>No Endpoints configured</div>
            ) : (
              _map(pool.endpoints, (endpoint: PoolEndpoint, index: number) => (
                <EndpointWrapper key={index}>
                  <EndpointRole>
                    <EndpointRoleName>
                      {_get(
                        POOL_ENDPOINT_ROLES_LABELS,
                        _get(POOL_ENDPOINT_INDEX_ROLES, index, 'FAILOVER'),
                        'FAILOVER',
                      )}
                    </EndpointRoleName>
                    {POOL_STATUS_INDICATOR_ENABLED && (
                      <StatusBlock
                        $color={_get(POOL_ENDPOINT_ROLE_COLORS, endpoint.role ?? 'PRIMARY')}
                      ></StatusBlock>
                    )}
                  </EndpointRole>
                  <EndpointField>
                    <EndpointFieldTitle>Host</EndpointFieldTitle>
                    <EndpointFieldValue>{endpoint.host}</EndpointFieldValue>
                  </EndpointField>
                  <EndpointField>
                    <EndpointFieldTitle>Port</EndpointFieldTitle>
                    <EndpointFieldValue>{endpoint.port}</EndpointFieldValue>
                  </EndpointField>
                  {EDIT_ENDPOINT_ENABLED && (
                    <EndpointAction>
                      <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() =>
                          openAddEndpointModal({
                            endpoint,
                            index,
                          })
                        }
                      />
                    </EndpointAction>
                  )}
                </EndpointWrapper>
              ))
            )}
          </EndpointsList>
        </Endpoints>
        {pool.credentialsTemplate && (
          <CredentialsSection>
            <SectionHeader>
              <SectionHeaderTitle>Credentials</SectionHeaderTitle>
            </SectionHeader>
            <CredentialsWrapper>
              <CredentialField>
                <CredentialFieldLabel>Worker Name</CredentialFieldLabel>
                <CredentialFieldValue>{pool.credentialsTemplate.workerName}</CredentialFieldValue>
              </CredentialField>
              <CredentialField>
                <CredentialFieldLabel>Suffix Type</CredentialFieldLabel>
                <CredentialFieldValue>
                  {_get(
                    POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_LABELS,
                    pool.credentialsTemplate.suffixType,
                    pool.credentialsTemplate.suffixType,
                  )}
                </CredentialFieldValue>
              </CredentialField>
            </CredentialsWrapper>
          </CredentialsSection>
        )}
        {pool.validation && (
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
                <ValidationTimestamp>Last tested: 2025-01-15 14:30</ValidationTimestamp>
              </ValidationStatusIndicator>
              <Button>Test Configuration</Button>
            </ValidationStatusWrapper>
          </ValidationStatusSection>
        )}
      </BodyWrapper>
      {addEndpointModalOpen && (
        <AddPoolEndpointModal
          isOpen={addEndpointModalOpen}
          onClose={closeAddEndpointModal}
          onSubmit={handleAddEndpoint}
          endpoint={endpointEditData?.endpoint}
        />
      )}
    </>
  )
}

export default PoolCollapseItemBody

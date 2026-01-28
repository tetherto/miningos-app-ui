import { CheckSquareFilled, CloseCircleOutlined, EditOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'

import { StatusBlock } from '../../PoolManager.common.styles'
import {
  ADD_ENDPOINT_ENABLED,
  EDIT_ENDPOINT_ENABLED,
  POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_LABELS,
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

import { COLOR } from '@/constants/colors'
import { useContextualModal } from '@/hooks/useContextualModal'

interface PoolEndpoint {
  role: string
  host: string
  port: string | number
  [key: string]: unknown
}

interface Pool {
  validation?: {
    status: string
  }
  endpoints: PoolEndpoint[]
  credentialsTemplate?: {
    workerName: string
    suffixType: string
  }
  [key: string]: unknown
}

interface PoolCollapseItemBodyProps {
  pool: Pool
}

export const PoolCollapseItemBody = ({ pool }: PoolCollapseItemBodyProps) => {
  const isPoolValidated = pool.validation?.status === POOL_VALIDATION_STATUSES.TESTED
  const poolValidationColor = isPoolValidated ? COLOR.GREEN : COLOR.RED

  const {
    modalOpen: addEndpointModalOpen,
    handleOpen: openAddEndpointModal,
    handleClose: closeAddEndpointModal,
  } = useContextualModal()

  return (
    <>
      <BodyWrapper>
        <Endpoints>
          <SectionHeader>
            <SectionHeaderTitle>Endpoints Configuration</SectionHeaderTitle>
            {ADD_ENDPOINT_ENABLED && (
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
                      {_get(POOL_ENDPOINT_ROLES_LABELS, endpoint.role)}
                    </EndpointRoleName>
                    {POOL_STATUS_INDICATOR_ENABLED && (
                      <StatusBlock
                        $color={_get(POOL_ENDPOINT_ROLE_COLORS, endpoint.role)}
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
                      <Button icon={<EditOutlined />} size="small" />
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
          onSubmit={() => {}}
        />
      )}
    </>
  )
}

export default PoolCollapseItemBody

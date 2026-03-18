import Alert from 'antd/es/alert'
import Select from 'antd/es/select'
import Typography from 'antd/es/typography'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import { useState } from 'react'

import { POOL_ENDPOINT_ROLES_LABELS, SHOW_CREDENTIAL_TEMPLATE } from '../../PoolManager.constants'
import { usePoolConfigs } from '../../Pools/PoolManager.hooks'

import {
  ButtonContainer,
  Container,
  CredentialLabel,
  Credentials,
  CredentialsRow,
  CredentialUnit,
  Example,
  ExampleValue,
  InfoRow,
  Label,
  RoleTag,
  Section,
  StyledButton,
  StyledTable,
  StyledTitle,
  SubTitle,
  Wrapper,
} from './SetPoolConfiguration.styles'

import { Spinner } from '@/Components/Spinner/Spinner'
import { PoolSummary } from '@/Views/PoolManager/types'

const { Option } = Select
const { Text } = Typography

export const SetPoolConfiguration = ({
  onSubmit,
}: {
  onSubmit: (values: { pool: PoolSummary }) => Promise<void> | void
}) => {
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null)

  const { pools, isLoading, error } = usePoolConfigs()

  const columns = [
    { title: 'Host', dataIndex: 'host', key: 'host' },
    { title: 'Port', dataIndex: 'port', key: 'port' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <RoleTag $primary={role === 'PRIMARY'}>
          {POOL_ENDPOINT_ROLES_LABELS[role as keyof typeof POOL_ENDPOINT_ROLES_LABELS]}
        </RoleTag>
      ),
    },
  ]

  const handleAssign = () => {
    if (_isNil(selectedPoolId)) {
      return
    }

    const selectedPool = pools.find((p) => p.id === selectedPoolId)

    if (_isNil(selectedPool)) {
      return
    }

    onSubmit({
      pool: selectedPool,
    })
  }

  const currentPool = pools.find((p) => p.id === selectedPoolId)

  return (
    <Wrapper>
      <Container>
        <StyledTitle level={4}>Set Pool Configuration</StyledTitle>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {error ? (
              <Alert type="error" message="Error loading data" />
            ) : (
              <>
                <Section>
                  <SubTitle>Choose Pool</SubTitle>
                  <Label>Pool</Label>
                  <Select
                    value={selectedPoolId}
                    onChange={setSelectedPoolId}
                    style={{ width: '100%' }}
                  >
                    {_map(pools, (pool) => (
                      <Option key={pool.id} value={pool.id}>
                        {pool.name}
                      </Option>
                    ))}
                  </Select>
                  {!_isNil(selectedPoolId) && (
                    <InfoRow>
                      <Text type="secondary">#Units: {currentPool?.units ?? 0}</Text>
                      <Text type="secondary">#Miners: {currentPool?.miners ?? 0}</Text>
                    </InfoRow>
                  )}
                </Section>

                {!_isNil(currentPool) && (
                  <>
                    <Section>
                      <SubTitle>Endpoints Preview</SubTitle>
                      <StyledTable
                        columns={columns}
                        dataSource={currentPool.endpoints}
                        pagination={false}
                        size="small"
                      />
                    </Section>

                    {SHOW_CREDENTIAL_TEMPLATE && (
                      <Section>
                        <SubTitle>Credentials Template Preview</SubTitle>
                        <Credentials>
                          <CredentialsRow>
                            <CredentialLabel>Worker Name Pattern:</CredentialLabel>{' '}
                            <CredentialUnit>{'{unit_id}.{miner_id}'}</CredentialUnit>
                          </CredentialsRow>
                          <CredentialsRow $hasBorderBottom>
                            <CredentialLabel>Suffix Type:</CredentialLabel>{' '}
                            <CredentialUnit>Sequential</CredentialUnit>
                          </CredentialsRow>
                          <Example>
                            <CredentialLabel>Example Preview:</CredentialLabel>{' '}
                            <ExampleValue>unit01.miner001</ExampleValue>
                          </Example>
                        </Credentials>
                      </Section>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </Container>
      <ButtonContainer>
        <StyledButton block disabled={isLoading} onClick={handleAssign}>
          Assign Configuration
        </StyledButton>
      </ButtonContainer>
    </Wrapper>
  )
}

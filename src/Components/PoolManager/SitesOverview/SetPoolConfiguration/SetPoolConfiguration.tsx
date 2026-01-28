import Select from 'antd/es/select'
import Typography from 'antd/es/typography'
import _map from 'lodash/map'
import { useState } from 'react'

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
const { Option } = Select
const { Text } = Typography

export const SetPoolConfiguration = () => {
  const [selectedPool, setSelectedPool] = useState('Foundry-EU')

  const pools = [
    { name: 'Foundry-EU', units: 9, miners: 2806 },
    { name: 'Foundry-US', units: 12, miners: 3500 },
  ]

  const endpoints = [
    { key: 1, host: 'stratum.foundry.eu', port: 4444, role: 'PRIMARY' },
    { key: 2, host: 'backup.foundry.eu', port: 4444, role: 'FAILOVER' },
  ]

  const columns = [
    { title: 'Host', dataIndex: 'host', key: 'host' },
    { title: 'Port', dataIndex: 'port', key: 'port' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <RoleTag $primary={role === 'PRIMARY'}>{role}</RoleTag>,
    },
  ]

  const currentPool = pools.find((p) => p.name === selectedPool)

  return (
    <Wrapper>
      <Container>
        <StyledTitle level={4}>Set Pool Configuration</StyledTitle>

        <Section>
          <SubTitle>Choose Pool</SubTitle>
          <Label>Pool</Label>
          <Select value={selectedPool} onChange={setSelectedPool} style={{ width: '100%' }}>
            {_map(pools, (pool) => (
              <Option key={pool.name} value={pool.name}>
                {pool.name}
              </Option>
            ))}
          </Select>
          <InfoRow>
            <Text type="secondary">#Units: {currentPool?.units}</Text>
            <Text type="secondary">#Miners: {currentPool?.miners}</Text>
          </InfoRow>
        </Section>

        <Section>
          <SubTitle>Endpoints Preview</SubTitle>
          <StyledTable columns={columns} dataSource={endpoints} pagination={false} size="small" />
        </Section>

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
      </Container>
      <ButtonContainer>
        <StyledButton block>Assign Configuration</StyledButton>
      </ButtonContainer>
    </Wrapper>
  )
}

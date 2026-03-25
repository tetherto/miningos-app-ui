import Alert from 'antd/es/alert'
import Typography from 'antd/es/typography'
import { FormikProvider, useFormik } from 'formik'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import * as yup from 'yup'

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

import { FormikSelect } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'
import { PoolSummary } from '@/Views/PoolManager/types'

const { Text } = Typography

// TODO: Show error when no pool is selected
const validationSchema = yup.object({
  selectedPoolId: yup.string().required('Pool is required'),
})

export const SetPoolConfiguration = ({
  onSubmit,
}: {
  onSubmit: (values: { pool: PoolSummary }) => Promise<void> | void
}) => {
  const formik = useFormik({
    initialValues: {
      selectedPoolId: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      const { selectedPoolId } = values

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
    },
  })

  const { pools, isLoading, error } = usePoolConfigs()

  const poolOptions = _map(pools, (poolData) => ({
    key: poolData.id,
    value: poolData.id,
    label: poolData.name,
  }))

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

  const currentPool = pools.find((p) => p.id === formik.values.selectedPoolId)

  return (
    <Wrapper>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
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
                      <FormikSelect name="selectedPoolId" options={poolOptions} />
                      {!_isNil(formik.values.selectedPoolId) && (
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
            <StyledButton block disabled={isLoading} htmlType="submit">
              Assign Pool
            </StyledButton>
          </ButtonContainer>
        </form>
      </FormikProvider>
    </Wrapper>
  )
}

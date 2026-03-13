import Alert from 'antd/es/alert'
import Button from 'antd/es/button'
import { intlFormatDistance } from 'date-fns/intlFormatDistance'
import { FormikProvider, useFormik } from 'formik'
import _compact from 'lodash/compact'
import _find from 'lodash/find'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _size from 'lodash/size'
import { type FC } from 'react'
import * as yup from 'yup'

import {
  FormActions,
  Section,
  SectionHeader,
  FormSectionHeader,
  ModalBody,
  ModalTitle,
  StyledModal,
} from '../../PoolManager.common.styles'
import { POOL_ENDPOINT_ROLES_LABELS, SHOW_CREDENTIAL_TEMPLATE } from '../../PoolManager.constants'
import { usePoolConfigs } from '../../Pools/PoolManager.hooks'

import {
  CredentialTemplatePreview,
  EndpointFields,
  EndpointFieldValue,
  EndpointFieldValueSecondary,
  EndpointRole,
  EndpointRoleName,
  EndpointsList,
  EndpointWrapper,
  PoolMeta,
  TemplateFieldName,
  TemplateFieldValue,
} from './AssignPoolModal.styles'

import { useGetListThingsQuery } from '@/app/services/api'
import { getMinerShortCode } from '@/app/utils/deviceUtils'
import AppTable from '@/Components/AppTable/AppTable'
import { FormikSelect } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'
import { PoolSummary } from '@/Views/PoolManager/types'

const validationSchema = yup.object({
  pool: yup.string().required('Pool is required'),
})

interface MinerRow {
  code?: string
  unit?: string
  pool?: string
  [key: string]: unknown
}

type MinerDataRow = {
  code: string
  info?: {
    container: string
    poolConfig: string
  }
  id: string
  tags: string[]
}

const minersTableColumns = [
  {
    dataIndex: 'code',
    key: 'code',
    title: 'Miner Code',
    sorter: (a: MinerRow, b: MinerRow) => (a.code || '').localeCompare(b.code || ''),
  },
  {
    dataIndex: 'unit',
    key: 'unit',
    title: 'Unit',
    sorter: (a: MinerRow, b: MinerRow) => (a.unit || '').localeCompare(b.unit || ''),
  },
  {
    dataIndex: 'pool',
    key: 'pool',
    title: 'Current Pool',
    sorter: (a: MinerRow, b: MinerRow) => (a.pool || '').localeCompare(b.pool || ''),
  },
]

interface AssignPoolModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: { pool: PoolSummary }) => void
  selectedDeviceIds: string[]
}

export const AssignPoolModal: FC<AssignPoolModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDeviceIds,
}) => {
  const {
    pools,
    poolIdMap,
    isLoading: isPoolDataLoading,
    error: poolConfigLoadingError,
  } = usePoolConfigs()

  const {
    data: minersData,
    isLoading: isMinerDataLoading,
    error: minerDataLoadingError,
  } = useGetListThingsQuery({
    status: 1,
    fields: JSON.stringify({
      id: 1,
      info: 1,
      code: 1,
      type: 1,
      containerId: 1,
      tags: 1,
    }),
    query: JSON.stringify({
      id: {
        $in: selectedDeviceIds,
      },
    }),
  })

  const miners = _map(_head(minersData as MinerDataRow[][]), (minerData) => {
    const { code, tags, id, info } = minerData
    const shortCode = getMinerShortCode(code, tags || [])
    return {
      id,
      code: shortCode,
      pool: info?.poolConfig ? (poolIdMap[info?.poolConfig]?.name ?? '-') : '-',
      unit: info?.container ?? '-',
    }
  })

  const poolOptions = _map(pools, (poolData) => ({
    key: poolData.id,
    value: poolData.id,
    label: poolData.name,
  }))

  const formik = useFormik({
    initialValues: {
      pool: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      const { pool } = values

      if (_isNil(pool)) {
        return
      }

      const selectedPool = _find(pools, { id: pool })

      if (_isNil(selectedPool)) {
        return
      }

      onSubmit({
        pool: selectedPool,
      })
    },
  })

  const selectedPool = !_isNil(formik.values.pool)
    ? _find(pools, { id: formik.values.pool })
    : undefined

  const isLoading = isPoolDataLoading || isMinerDataLoading
  const hasError = !_isEmpty(_compact([poolConfigLoadingError, minerDataLoadingError]))

  return (
    <StyledModal
      title={<ModalTitle>Assign Pool</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={400}
      maskClosable={false}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {hasError ? (
            <Alert type="error" message="Error loading data" />
          ) : (
            <FormikProvider value={formik}>
              <form onSubmit={formik.handleSubmit}>
                <ModalBody>
                  <Section>
                    <SectionHeader>
                      <FormSectionHeader>Selected Miners</FormSectionHeader>
                      <div>{_size(selectedDeviceIds)} miners selected</div>
                    </SectionHeader>
                    <AppTable dataSource={miners} columns={minersTableColumns} pagination={false} />
                  </Section>
                  <Section>
                    <SectionHeader>
                      <FormSectionHeader>Choose pool group</FormSectionHeader>
                    </SectionHeader>
                    <FormikSelect name="pool" options={poolOptions} />
                    <PoolMeta>
                      <div>Units: {selectedPool?.units ?? 0}</div>
                      <div>Miners: {selectedPool?.miners ?? 0}</div>
                      {selectedPool && (
                        <div>
                          Last Updated: {intlFormatDistance(selectedPool?.updatedAt, new Date())}
                        </div>
                      )}
                    </PoolMeta>
                  </Section>
                  {!_isNil(selectedPool) && (
                    <Section>
                      <SectionHeader>Endpoints Preview</SectionHeader>
                      <EndpointsList>
                        {selectedPool.endpoints.map((endpoint, index) => (
                          <EndpointWrapper key={index}>
                            <EndpointRole>
                              <EndpointRoleName>
                                {
                                  POOL_ENDPOINT_ROLES_LABELS[
                                    endpoint.role as keyof typeof POOL_ENDPOINT_ROLES_LABELS
                                  ]
                                }
                              </EndpointRoleName>
                            </EndpointRole>

                            <EndpointFields>
                              <EndpointFieldValue>{endpoint.host}</EndpointFieldValue>
                              <EndpointFieldValueSecondary>
                                Port: {endpoint.port}
                              </EndpointFieldValueSecondary>
                            </EndpointFields>
                          </EndpointWrapper>
                        ))}
                      </EndpointsList>
                    </Section>
                  )}
                  {SHOW_CREDENTIAL_TEMPLATE && (
                    <Section>
                      <SectionHeader>
                        <FormSectionHeader>Credential Template Preview</FormSectionHeader>
                      </SectionHeader>
                      <CredentialTemplatePreview>
                        <TemplateFieldName>Worker Name Example</TemplateFieldName>
                        <TemplateFieldValue>site-a.192-168-1-1</TemplateFieldValue>
                      </CredentialTemplatePreview>
                    </Section>
                  )}
                  <FormActions>
                    <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                      Assign
                    </Button>
                    <Button onClick={onClose} disabled={formik.isSubmitting}>
                      Cancel
                    </Button>
                  </FormActions>
                </ModalBody>
              </form>
            </FormikProvider>
          )}
        </>
      )}
    </StyledModal>
  )
}

import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
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

import AppTable from '@/Components/AppTable/AppTable'
import { FormikSelect } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'

const validationSchema = yup.object({
  pool: yup.string().required('Pool is required'),
})

interface MinerRow {
  code?: string
  unit?: string
  pool?: string
  [key: string]: unknown
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
  onSubmit: (values: { pool: string | null }) => void
}

export const AssignPoolModal: FC<AssignPoolModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const isLoading = false

  const formik = useFormik({
    initialValues: {
      pool: null,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values)
      onClose()
    },
  })

  const poolOptions = [
    {
      key: 'POOL_1',
      label: 'Pool 1',
    },
    {
      key: 'POOL_2',
      label: 'Pool 2',
    },
  ]

  const endpoints = [
    {
      role: 'PRIMARY',
      host: 'stratum+tcp://pool.example.com',
      port: 4444,
      region: 'EUROPE',
    },
    {
      role: 'FAILOVER_1',
      host: 'stratum+tcp://pool.example.com',
      port: 4444,
      region: 'EUROPE',
    },
  ]

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
              <Section>
                <SectionHeader>
                  <FormSectionHeader>Selected Miners</FormSectionHeader>
                  <div>4 miners selected</div>
                </SectionHeader>
                <AppTable columns={minersTableColumns} pagination={false} />
              </Section>
              <Section>
                <SectionHeader>
                  <FormSectionHeader>Choose pool group</FormSectionHeader>
                </SectionHeader>
                <FormikSelect name="pool" options={poolOptions} />
                <PoolMeta>
                  <div>Units: 45</div>
                  <div>Miners: 45</div>
                  <div>Last Updated: 45</div>
                </PoolMeta>
              </Section>
              <Section>
                <SectionHeader>Endpoints Preview</SectionHeader>
                <EndpointsList>
                  {endpoints.map((endpoint, index) => (
                    <EndpointWrapper key={index}>
                      <EndpointRole>
                        <EndpointRoleName>{endpoint.role}</EndpointRoleName>
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
              <Section>
                <SectionHeader>
                  <FormSectionHeader>Credential Template Preview</FormSectionHeader>
                </SectionHeader>
                <CredentialTemplatePreview>
                  <TemplateFieldName>Worker Name Example</TemplateFieldName>
                  <TemplateFieldValue>site-a.192-168-1-1</TemplateFieldValue>
                </CredentialTemplatePreview>
              </Section>
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
    </StyledModal>
  )
}

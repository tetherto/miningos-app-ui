import { UploadOutlined } from '@ant-design/icons'
import Alert from 'antd/es/alert'
import Button from 'antd/es/button'
import Upload from 'antd/es/upload'
import { parse as parseCSV } from 'csv-parse/browser/esm'
import { FormikProvider, useFormik } from 'formik'
import _filter from 'lodash/filter'
import _flatten from 'lodash/flatten'
import _fromPairs from 'lodash/fromPairs'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _some from 'lodash/some'
import _startsWith from 'lodash/startsWith'
import { useEffect, useState } from 'react'
import * as yup from 'yup'

const validationSchema = yup.object({
  hasFile: yup.boolean().oneOf([true], 'Please upload a CSV file'),
})

import useCheckInventoryDuplicate from '../../hooks/useCheckInventoryDuplicate'
import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import useLocationOptions from '../../LocationSelectDropdown/useLocationOptions'
import { CSV_PART_TYPES, SPARE_PART_TYPE_TO_CSV_PART_TYPE } from '../SpareParts.constants'

import {
  FormActions,
  ModalBody,
  ModalTitle,
  StyledForm,
  StyledModal,
  UploadSection,
} from './BulkAddSparePartsModal.styles'
import {
  createBulkUploadAction,
  CsvDuplicateRecordError,
  validateCSVRecords,
  type CSVRecord,
} from './BulkAddSparePartsModal.utils'

import { useGetListRacksQuery, useGetSettingsQuery, useGetSiteQuery } from '@/app/services/api'
import { Logger } from '@/app/services/logger'
import { getRackNameFromId } from '@/app/utils/deviceUtils'
import { notifyError, notifySuccess } from '@/app/utils/NotificationService'
import { Spinner } from '@/Components/Spinner/Spinner'

interface BulkAddSparePartsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CsvRecord {
  part: string
  model: string
  'miner model': string
  'serial num': string
  mac: string
  status: string
  location: string
  comment: string
}

interface ParsedRecord {
  partType: string
  model: string
  parentDeviceModel: string
  serialNum: string
  macAddress: string
  status: string
  location: string
  comment: string
}

interface Rack {
  id: string
  type?: string
  [key: string]: unknown
}

const BulkAddSparePartsModal = ({ isOpen, onClose }: BulkAddSparePartsModalProps) => {
  const {
    data: siteData,
    isLoading: isSiteLoading,
    error: siteLoadingError,
  } = useGetSiteQuery(undefined)
  const { checkDuplicate } = useCheckInventoryDuplicate()

  const {
    locationOptions,
    isLoading: isLocationOptionsLoading,
    error: locationsLoadingError,
  } = useLocationOptions()
  const { submitAction } = useDirectSubmitAction()

  const {
    data: inventoryRacksData,
    isLoading: isRackTypesLoading,
    error: rackTypesLoadingError,
  } = useGetListRacksQuery({
    type: 'inventory',
  })

  const rackIds: Record<string, string> | null =
    !inventoryRacksData || !Array.isArray(inventoryRacksData)
      ? null
      : (() => {
          const flattenedRacks = _flatten(inventoryRacksData) as Rack[]
          return _fromPairs(
            _map(
              _filter(flattenedRacks, (rack: Rack) =>
                _startsWith(rack?.type || '', 'inventory-miner_part'),
              ),
              ({ id }: Rack) => [SPARE_PART_TYPE_TO_CSV_PART_TYPE[getRackNameFromId(id)], id],
            ),
          ) as Record<string, string>
        })()

  const {
    currentData: controllerSettingsData,
    isLoading: isControllerSettingsDataLoading,
    error: controllerSettingsLoadingError,
  } = useGetSettingsQuery(
    {
      rackId: rackIds?.[CSV_PART_TYPES.CONTROLLER],
    },
    {
      skip: _isNil(rackIds?.[CSV_PART_TYPES.CONTROLLER]),
    },
  )

  const {
    currentData: hashboardSettingsData,
    isLoading: isHashboardSettingsDataLoading,
    error: hashboardSettingsLoadingError,
  } = useGetSettingsQuery(
    {
      rackId: rackIds?.[CSV_PART_TYPES.HASHBOARD],
    },
    {
      skip: _isNil(rackIds?.[CSV_PART_TYPES.HASHBOARD]),
    },
  )

  const {
    currentData: psuSettingsData,
    isLoading: isPsuSettingsDataLoading,
    error: psuSettingsLoadingError,
  } = useGetSettingsQuery(
    {
      rackId: rackIds?.[CSV_PART_TYPES.PSU],
    },
    {
      skip: _isNil(rackIds?.[CSV_PART_TYPES.PSU]),
    },
  )

  const [records, setRecords] = useState<ParsedRecord[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const currentSite = _get(siteData, ['site'])

  const formik = useFormik({
    initialValues: {
      hasFile: false,
    },
    validationSchema,
    onSubmit: async () => {
      await handleUpload()
    },
  })

  useEffect(() => {
    const isError = _some([
      siteLoadingError,
      locationsLoadingError,
      controllerSettingsLoadingError,
      hashboardSettingsLoadingError,
      psuSettingsLoadingError,
      rackTypesLoadingError,
    ])

    if (isError) {
      notifyError('Unable to load data. Please try again later', '')
      onClose()
    }
  }, [
    onClose,
    siteLoadingError,
    locationsLoadingError,
    controllerSettingsLoadingError,
    hashboardSettingsLoadingError,
    psuSettingsLoadingError,
    rackTypesLoadingError,
  ])

  const handleBeforeUpload = async (file: File) => {
    try {
      setErrorMessage(null)
      const text = await file.text()
      const parsedRecords = await new Promise<CsvRecord[]>((resolve, reject) => {
        parseCSV(text, { columns: true }, (err, records) => {
          if (err) {
            reject(err)
          } else {
            resolve(records as CsvRecord[])
          }
        })
      })
      setRecords(
        _map(parsedRecords, (record: CsvRecord) => ({
          partType: record.part,
          model: record.model,
          parentDeviceModel: record['miner model'],
          serialNum: record['serial num'],
          macAddress: record.mac,
          status: record.status,
          location: record.location,
          comment: record.comment,
        })),
      )
      formik.setFieldValue('hasFile', true)
    } catch (error: unknown) {
      setRecords([])
      setErrorMessage('Unable to parse uploaded CSV')
      const errorObj = error as { code?: string; message?: string }
      if (!_startsWith(errorObj.code || '', 'CSV_')) {
        Logger.error(errorObj.message || String(error))
      }
    }
    return false
  }

  const handleUploadRemove = () => {
    formik.setFieldValue('hasFile', false)
  }

  const handleUpload = async () => {
    try {
      const controllerData = _head(
        controllerSettingsData as Array<{ success?: { subPartTypes?: unknown[] } }>,
      ) as { success?: { subPartTypes?: unknown[] } } | undefined
      const hashboardData = _head(
        hashboardSettingsData as Array<{ success?: { subPartTypes?: unknown[] } }>,
      ) as { success?: { subPartTypes?: unknown[] } } | undefined
      const psuData = _head(
        psuSettingsData as Array<{ success?: { subPartTypes?: unknown[] } }>,
      ) as { success?: { subPartTypes?: unknown[] } } | undefined
      const subPartTypes = {
        [CSV_PART_TYPES.CONTROLLER]: new Set(controllerData?.success?.subPartTypes || []),
        [CSV_PART_TYPES.HASHBOARD]: new Set(hashboardData?.success?.subPartTypes || []),
        [CSV_PART_TYPES.PSU]: new Set(psuData?.success?.subPartTypes || []),
      }

      const validationContext = {
        locations: _map(locationOptions, ({ value }) => value),
        subPartTypes,
      }

      if (!rackIds) {
        throw new Error('Rack IDs not available')
      }

      const validationOpts = {
        checkDuplicateDelegate: async (params: {
          rackId: string
          serialNum: string[]
          macAddress?: string[]
        }) => {
          const result = await checkDuplicate({ ...params, code: undefined }, true)
          if (Array.isArray(result)) {
            return result
          }
          return result ? [result] : []
        },
        rackIds,
      }

      const validatedRecords = await validateCSVRecords(
        records as unknown as CSVRecord[],
        {
          locations: validationContext.locations,
          subPartTypes: Object.fromEntries(
            Object.entries(validationContext.subPartTypes).map(([key, value]) => [
              key,
              value as Set<string>,
            ]),
          ) as Record<string, Set<string>>,
        },
        validationOpts,
      )

      const action = createBulkUploadAction(validatedRecords, currentSite)

      const { error } = await submitAction({
        action,
      })

      if (!_isNil(error)) {
        throw error
      }

      notifySuccess('CSV uploaded successfully', '')
      onClose()
    } catch (error: unknown) {
      if (error instanceof yup.ValidationError || error instanceof CsvDuplicateRecordError) {
        setErrorMessage(error.message)
        return
      }

      notifyError('Unable to bulk register spare parts', '')
      const errorMessage = error instanceof Error ? error.message : String(error)
      Logger.error(errorMessage)
    }
  }

  const isLoading = _some([
    isSiteLoading,
    isLocationOptionsLoading,
    isControllerSettingsDataLoading,
    isHashboardSettingsDataLoading,
    isPsuSettingsDataLoading,
    isRackTypesLoading,
  ])

  const handleTemplateDownload = () => {
    const rows = [
      ['part', 'model', 'miner model', 'serial num', 'mac', 'status', 'location', 'comment'],
    ]

    let csvContent =
      'data:text/csv;charset=utf-8,' +
      _join(
        _map(rows, (e: string[]) => _join(e, ',')),
        '\n',
      )
    var encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'miners.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <StyledModal
      title={<ModalTitle>Bulk add parts</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={850}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <ModalBody>
          <FormikProvider value={formik}>
            <StyledForm onSubmit={formik.handleSubmit}>
              <Alert message="Bulk actions can take a few seconds to complete" type="info" />
              <UploadSection>
                <Upload
                  maxCount={1}
                  beforeUpload={handleBeforeUpload}
                  onRemove={handleUploadRemove}
                  disabled={formik.isSubmitting}
                >
                  <Button icon={<UploadOutlined />}>Click to select CSV</Button>
                </Upload>
                <Button type="link" onClick={handleTemplateDownload}>
                  Download CSV template
                </Button>
              </UploadSection>
              {errorMessage && <Alert message={errorMessage} type="error" />}
              <FormActions>
                <Button disabled={formik.isSubmitting} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!formik.values.hasFile}
                  loading={formik.isSubmitting}
                >
                  Upload
                </Button>
              </FormActions>
            </StyledForm>
          </FormikProvider>
        </ModalBody>
      )}
    </StyledModal>
  )
}

export default BulkAddSparePartsModal

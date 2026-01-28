import Button from 'antd/es/button'
import Tabs from 'antd/es/tabs'
import { FormikProvider, useFormik } from 'formik'
import _filter from 'lodash/filter'
import _flatten from 'lodash/flatten'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _startsWith from 'lodash/startsWith'
import { useEffect, useState } from 'react'
import * as yup from 'yup'

import { SparePartNames } from '../SpareParts.constants'

import {
  AddItemFormActions,
  AddItemFormControl,
  AddItemFormRow,
  ModalBody,
  ModalTitle,
  StyledModal,
} from './SparePartSubTypesModal.styles'

import {
  useGetListRacksQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '@/app/services/api'
import { Logger } from '@/app/services/logger'
import { getRackNameFromId } from '@/app/utils/deviceUtils'
import { notifyError } from '@/app/utils/NotificationService'
import AppTable from '@/Components/AppTable/AppTable'
import { FormikInput } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
})

interface SparePartSubTypesModalProps {
  isOpen: boolean
  onClose: () => void
}

const SparePartSubTypesModal = ({ isOpen, onClose }: SparePartSubTypesModalProps) => {
  const [rackId, setRackId] = useState<unknown | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const {
    data: inventoryRacksData,
    isLoading: isRackTypesLoading,
    error: rackTypesLoadingError,
  } = useGetListRacksQuery({
    type: 'inventory',
  })

  const {
    currentData: settingsData,
    isLoading: isSettingsDataLoading,
    error: settingsLoadingError,
  } = useGetSettingsQuery(
    {
      rackId: rackId,
    },
    {
      skip: _isNil(rackId),
    },
  )

  useEffect(() => {
    if (settingsLoadingError || rackTypesLoadingError) {
      notifyError('Unable to load data. Please try again later', '')
      onClose()
    }
  }, [onClose, rackTypesLoadingError, settingsLoadingError])

  const [updateSettings] = useUpdateSettingsMutation()

  interface RackItem {
    id: string
    type: string
  }

  const inventoryRacks = _filter(_flatten(inventoryRacksData as unknown[]), (rack: unknown) =>
    _startsWith((rack as RackItem)?.type, 'inventory-miner_part'),
  )

  const sparePartOptions = _map(inventoryRacks, (rack: unknown) => ({
    key: (rack as RackItem)?.id,
    label: SparePartNames[getRackNameFromId((rack as RackItem)?.id)],
  }))

  useEffect(() => {
    if (_isNil(rackId) && !_isEmpty(sparePartOptions)) {
      setRackId(_head(sparePartOptions)?.key)
    }
  }, [rackId, sparePartOptions])

  const settingsResponse = _head(
    settingsData as Array<{ success?: { subPartTypes?: string[] } }> | undefined,
  )
  const subTypes = settingsResponse?.success?.subPartTypes
  const subTypesDataSource = _map(subTypes, (name: unknown) => ({ name }))

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema,
    onSubmit: async (values, { setFieldError }) => {
      try {
        const { name } = values
        const isDuplicate = new Set(subTypes).has(name)
        if (isDuplicate) {
          setFieldError('name', 'Subtype already exists')
          return
        }

        await updateSettings({
          rackId,
          entries: { subPartTypes: [...(subTypes ?? []), name] },
        })

        setShowAddForm(false)
      } catch (error) {
        setFieldError('name', 'Error adding subtype')
        Logger.error((error as Error).message)
      }
    },
  })

  const handleAddItem = () => {
    setShowAddForm(true)
  }

  const handleItemAddCancel = () => {
    formik.resetForm()
    setShowAddForm(false)
  }

  const isLoading = isRackTypesLoading || isSettingsDataLoading

  return (
    <StyledModal
      title={<ModalTitle>Spare Part Subtypes</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={600}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <ModalBody>
          <Tabs
            activeKey={rackId as string}
            items={sparePartOptions}
            onChange={(value: unknown) => {
              setRackId(value)
            }}
          />
          <AppTable
            dataSource={subTypesDataSource}
            columns={[{ title: 'Subtype Name', dataIndex: 'name', key: 'name' }]}
            scroll={{ x: 'max-content', y: 600 }}
            pagination={false}
          />
          {showAddForm ? (
            <FormikProvider value={formik}>
              <form onSubmit={formik.handleSubmit}>
                <AddItemFormRow>
                  <AddItemFormControl>
                    <FormikInput
                      name="name"
                      placeholder="Subtype Name"
                      disabled={formik.isSubmitting}
                    />
                  </AddItemFormControl>
                  <AddItemFormActions>
                    <Button onClick={handleItemAddCancel} disabled={formik.isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                      Add
                    </Button>
                  </AddItemFormActions>
                </AddItemFormRow>
              </form>
            </FormikProvider>
          ) : (
            <Button block type="primary" onClick={handleAddItem}>
              Add Item
            </Button>
          )}
        </ModalBody>
      )}
    </StyledModal>
  )
}

export default SparePartSubTypesModal

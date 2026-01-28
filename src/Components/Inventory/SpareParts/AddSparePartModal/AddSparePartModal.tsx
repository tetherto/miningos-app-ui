import Button from 'antd/es/button'
import Tabs from 'antd/es/tabs'
import { FormikProvider, useFormik } from 'formik'
import _compact from 'lodash/compact'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _flatten from 'lodash/flatten'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _isString from 'lodash/isString'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _startsWith from 'lodash/startsWith'
import _toLower from 'lodash/toLower'
import _toPairs from 'lodash/toPairs'
import _values from 'lodash/values'
import { useEffect } from 'react'
import * as yup from 'yup'

import {
  useGetListRacksQuery,
  useGetSettingsQuery,
  useGetSiteQuery,
} from '../../../../app/services/api'
import { getRackNameFromId } from '../../../../app/utils/deviceUtils'
import { INVALID_MAC_ADDRESS_ERROR } from '../../../../constants/errors'
import { isValidMacAddress } from '../../../../Views/Container/Tabs/PduTab/AddReplaceMinerDialog/helper'
import { Spinner } from '../../../Spinner/Spinner'
import useCheckInventoryDuplicate from '../../hooks/useCheckInventoryDuplicate'
import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'
import {
  SPARE_PART_STATUS_NAMES,
  SPARE_PART_STATUSES,
  SparePartNames,
  SparePartTypes,
} from '../SpareParts.constants'
import SparePartSubTypesModal from '../SparePartSubTypesModal/SparePartSubTypesModal'

import {
  FormActions,
  ModalBody,
  ModalFooter,
  ModalTitle,
  StyledModal,
} from './AddSparePartModal.styles'

import { notifyError } from '@/app/utils/NotificationService'
import {
  FormikInput,
  FormikLocationSelect,
  FormikSelect,
  FormikTextArea,
} from '@/Components/FormInputs'
import { ACTION_TYPES } from '@/constants/actions'
import { MINER_BRAND_NAMES } from '@/constants/deviceConstants'
import { useContextualModal } from '@/hooks/useContextualModal'

interface AddSparePartModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPartType?: string
}

interface FormValues {
  part: string | null
  model: string | null
  parentDeviceModel: string | null
  serialNum: string
  macAddress: string
  status: string | null
  location: string | null
  comment: string
  tags: string[]
}

const validationSchema = yup.object({
  part: yup.string().required('Part is required'),
  model: yup.string().required('Part model is required'),
  parentDeviceModel: yup.string().required('Miner model is required'),
  serialNum: yup.string().when('part', {
    is: (part: string) => part && _includes(part, SparePartTypes.CONTROLLER),

    then: (schema) => schema.trim(),

    otherwise: (schema) => schema.required('MAC Address is required').trim(),
  }),

  macAddress: yup.string().when('part', {
    is: (part: string) => part && _includes(part, SparePartTypes.CONTROLLER),
    then: (schema) =>
      schema
        .required('MAC Address is required')
        .trim()
        .test(
          'is-valid-mac',
          INVALID_MAC_ADDRESS_ERROR,
          (value: unknown) => !value || isValidMacAddress(value as string),
        ),

    otherwise: (schema) => schema.trim(),
  }),
  status: yup.string().required('Status is required'),
  location: yup.string().required('Location is required'),
  tags: yup.array().of(yup.string().trim()),
})

const AddSparePartModal = ({ isOpen, onClose, selectedPartType }: AddSparePartModalProps) => {
  const {
    data: siteData,
    isLoading: isSiteLoading,
    error: siteLoadingError,
  } = useGetSiteQuery(undefined)
  const {
    data: inventoryRacksData,
    isLoading: isRackTypesLoading,
    error: rackTypesLoadingError,
  } = useGetListRacksQuery({
    type: 'inventory',
  })
  const { checkDuplicate } = useCheckInventoryDuplicate()
  const { submitAction } = useDirectSubmitAction()

  const {
    modalOpen: subTypesModalOpen,
    handleOpen: openSubTypesModal,
    handleClose: closeSubTypesModal,
  } = useContextualModal()

  useEffect(() => {
    if (siteLoadingError || rackTypesLoadingError) {
      notifyError('Unable to load data. Please try again later', '')
      onClose()
    }
  }, [onClose, rackTypesLoadingError, siteLoadingError])

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  const handleSubmit = async (
    rawValues: FormValues,
    { setFieldError }: { setFieldError: (field: string, message: string) => void },
  ) => {
    const values = validationSchema.cast(rawValues) as FormValues & { comment?: string }
    const {
      part,
      model,
      serialNum,
      location,
      status,
      comment,
      tags,
      macAddress,
      parentDeviceModel,
    } = values

    const isController = part ? _includes(part, SparePartTypes.CONTROLLER) : false

    const duplicateCheckAttributes: { serialNum?: string; macAddress?: string } = {
      serialNum,
    }
    if (isController) {
      duplicateCheckAttributes.macAddress = macAddress
    }

    const duplicates = await checkDuplicate(
      {
        serialNum: duplicateCheckAttributes.serialNum || undefined,
        rackId: part || '',
        macAddress: duplicateCheckAttributes.macAddress || undefined,
        code: undefined,
      },
      true,
    )

    if (!_isEmpty(duplicates)) {
      const duplicatesArray = _isArray(duplicates) ? duplicates : [duplicates]
      const attributeName = _find(_keys(duplicateCheckAttributes), (name: string) => {
        const duplicateValue = _get(_head(duplicatesArray), ['info', name])
        const checkValue = duplicateCheckAttributes[name as keyof typeof duplicateCheckAttributes]
        return (
          duplicateValue &&
          checkValue &&
          _toLower(String(duplicateValue)) === _toLower(String(checkValue))
        )
      })
      if (attributeName && _isString(attributeName)) {
        setFieldError(attributeName, 'Duplicate value! A spare part with this value already exists')
      }
      return
    }

    const currentSite = _get(siteData, ['site'])
    const siteTag = `site-${currentSite}`

    const params = [
      {
        rackId: part,
        info: {
          parentDeviceModel,
          site: currentSite,
          subType: model,
          serialNum,
          ...(isController ? { macAddress } : {}),
          location,
          status,
        },
        comment,
        tags: _compact([...tags, siteTag]),
      },
    ]

    const action = {
      type: 'voting',
      action: ACTION_TYPES.REGISTER_THING,
      params,
    }

    await executeAction({
      executor: submitAction as (params: {
        action: unknown
      }) => Promise<{ error?: unknown; [key: string]: unknown }>,
      action,
      onSuccess: handleSuccess,
    })
  }

  const formik = useFormik({
    initialValues: {
      part: null,
      model: null,
      parentDeviceModel: null,
      serialNum: '',
      macAddress: '',
      status: null,
      location: null,
      comment: '',
      tags: [],
    },
    validationSchema,
    onSubmit: handleSubmit,
  })

  const { currentData: settingsData, isLoading: isSettingsDataLoading } = useGetSettingsQuery(
    {
      rackId: formik.values.part,
    },
    {
      skip: _isNil(formik.values.part),
    },
  )

  const inventoryRacks: Array<{ type: string; id?: string }> = _filter(
    _flatten(_isArray(inventoryRacksData) ? inventoryRacksData : []),
    (rack: { type?: string; id?: string }): rack is { type: string; id?: string } =>
      !!rack?.type && _startsWith(rack.type, 'inventory-miner_part'),
  ) as Array<{ type: string; id?: string }>

  const tabItems: Array<{ key: string; label: string }> = _map(
    inventoryRacks,
    (rack: { id?: string }) => ({
      key: rack?.id || '',
      label: SparePartNames[getRackNameFromId(rack?.id || '')] || '',
    }),
  )

  useEffect(() => {
    if (_isNil(formik.values.part) && !_isEmpty(tabItems)) {
      let tabToSelect: { key: string; label: string } | undefined

      // If selectedPartType is provided, try to find matching tab by label
      if (selectedPartType) {
        const selectedLabel = SparePartNames[selectedPartType as keyof typeof SparePartNames]
        tabToSelect = _find(
          tabItems,
          (item: { key: string; label: string }) => item.label === selectedLabel,
        )
      }

      // Fallback to first tab if no match found
      if (!tabToSelect) {
        tabToSelect = _head(tabItems) as { key: string; label: string } | undefined
      }

      if (tabToSelect) {
        formik.setFieldValue('part', tabToSelect.key)
      }
    }
  }, [formik, tabItems, selectedPartType])

  const settingsDataFirst = _isArray(settingsData) ? _head(settingsData) : settingsData
  const modelOptions = _map(
    (settingsDataFirst as { success?: { subPartTypes?: string[] } })?.success?.subPartTypes || [],
    (value: string) => ({
      value,
      label: value,
    }),
  )

  const minerModelOptions = _map(_toPairs(MINER_BRAND_NAMES), ([modelKey, modelName]) => ({
    value: modelKey,
    label: modelName,
  }))

  const statusOptions = _map(_values(SPARE_PART_STATUSES), (value: string) => ({
    value,
    label: SPARE_PART_STATUS_NAMES[value as keyof typeof SPARE_PART_STATUS_NAMES],
  }))

  const isLoading = isSiteLoading || isRackTypesLoading

  return (
    <>
      <StyledModal
        title={<ModalTitle>Register Part</ModalTitle>}
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
                <Tabs
                  activeKey={formik.values.part || undefined}
                  items={tabItems}
                  onChange={(value: string) => {
                    formik.setFieldValue('part', value)
                    formik.setFieldValue('model', null)
                  }}
                />
                <FormikSelect
                  placeholder="Miner Model"
                  name="parentDeviceModel"
                  options={minerModelOptions}
                />
                <FormikSelect
                  placeholder="Part Model"
                  name="model"
                  options={modelOptions}
                  loading={isSettingsDataLoading}
                />
                <FormikInput placeholder="Serial Number" name="serialNum" />
                {formik.values.part && _includes(formik.values.part, SparePartTypes.CONTROLLER) && (
                  <FormikInput placeholder="MAC Address" name="macAddress" />
                )}
                <FormikSelect placeholder="Status" name="status" options={statusOptions} />
                <FormikLocationSelect
                  name="location"
                  filterLocationOptions={(options) =>
                    _filter?.(
                      options,
                      (opt): opt is { value: string; label: string } =>
                        _isString(opt.value) && _isString(opt.label),
                    )
                  }
                />
                <FormikSelect mode="tags" placeholder="Tags" name="tags" />
                <FormikTextArea placeholder="Comment" name="comment" rows={4} />
                <ModalFooter>
                  <Button onClick={() => openSubTypesModal(undefined)}>View Subtypes</Button>
                  <FormActions>
                    <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                      Save
                    </Button>
                    <Button onClick={onClose} disabled={formik.isSubmitting}>
                      Cancel
                    </Button>
                  </FormActions>
                </ModalFooter>
              </ModalBody>
            </form>
          </FormikProvider>
        )}
      </StyledModal>
      {subTypesModalOpen && (
        <SparePartSubTypesModal isOpen={subTypesModalOpen} onClose={closeSubTypesModal} />
      )}
    </>
  )
}

export default AddSparePartModal

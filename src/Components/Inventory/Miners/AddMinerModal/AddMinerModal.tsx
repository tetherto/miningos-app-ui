import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _compact from 'lodash/compact'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _toLower from 'lodash/toLower'
import { useEffect } from 'react'
import * as yup from 'yup'

import { useGetSiteQuery, useGetThingConfigQuery } from '../../../../app/services/api'
import { Spinner } from '../../../Spinner/Spinner'
import useCheckInventoryDuplicate from '../../hooks/useCheckInventoryDuplicate'
import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'
import { MINER_STATUS_NAMES, MINER_STATUSES } from '../Miners.constants'

import { FormActions, ModalBody, ModalTitle, StyledModal } from './AddMinerModal.styles'

import { notifyError } from '@/app/utils/NotificationService'
import {
  FormikDatePicker,
  FormikInput,
  FormikLocationSelect,
  FormikRackIdSelect,
  FormikSelect,
  FormikTextArea,
} from '@/Components/FormInputs'
import { ACTION_TYPES } from '@/constants/actions'
import { INVALID_MAC_ADDRESS_ERROR } from '@/constants/errors'
import { isValidMacAddress } from '@/Views/Container/Tabs/PduTab/AddReplaceMinerDialog/helper'

const validationSchema = yup.object({
  minerType: yup.string().required('Miner Type is required'),

  serialNum: yup.string().required('Serial Number is required').trim(),
  status: yup.string().required('Status is required'),
  location: yup.string().required('Location is required'),
  date: yup.string().required('Date is required'),

  username: yup.string().required('Username is required').trim(),

  password: yup.string().required('Password is required').trim(),

  tags: yup.array().of(yup.string().trim()),
  code: yup.string(),
  comment: yup.string(),
  macAddress: yup
    .string()
    .test(
      'is-valid-mac',
      INVALID_MAC_ADDRESS_ERROR,
      (value: string | undefined) => !value || isValidMacAddress(value),
    ),
})

interface StatusOption {
  value: string
  label: string
}

const statusOptions = _map(
  [
    MINER_STATUSES.OK_BRAND_NEW,
    MINER_STATUSES.OK_REPAIRED,
    MINER_STATUSES.FAULTY,
    MINER_STATUSES.ON_HOLD,
  ],
  (status: string): StatusOption => ({
    value: status,
    label: MINER_STATUS_NAMES[status as keyof typeof MINER_STATUS_NAMES],
  }),
)

interface AddMinerModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddMinerModal = ({ isOpen, onClose }: AddMinerModalProps) => {
  const {
    data: siteData,
    isLoading: isSiteLoading,
    error: siteLoadingError,
  } = useGetSiteQuery(undefined)

  const { checkDuplicate } = useCheckInventoryDuplicate()
  const { submitAction } = useDirectSubmitAction()

  const {
    data,
    isLoading: isLoadingShortCode,
    error: codeLoadingError,
  } = useGetThingConfigQuery({
    requestType: 'nextAvailableCode',
    type: 'miner',
  })

  useEffect(() => {
    if (siteLoadingError || codeLoadingError) {
      notifyError('Unable to load data. Please try again later', 'Error')
      onClose()
    }
  }, [codeLoadingError, onClose, siteLoadingError])

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  const handleSubmit = async (
    rawValues: unknown,
    { setFieldError }: { setFieldError: (field: string, message: string) => void },
  ) => {
    const values = validationSchema.cast(rawValues) as {
      minerType: string
      serialNum: string
      location: string
      status: string
      comment?: string
      username: string
      password: string
      tags?: string[]
      code?: string
      macAddress?: string
    }
    const {
      minerType,
      serialNum,
      location,
      status,
      comment,
      username,
      password,
      tags,
      code,
      macAddress,
    } = values

    const duplicates = await checkDuplicate(
      {
        serialNum,
        macAddress,
        code,
      },
      true,
    )

    const duplicateFields = _reduce(
      duplicates as Array<{ info?: { macAddress?: string; serialNum?: string }; code?: string }>,
      (
        acc: Record<string, number>,
        curr: { info?: { macAddress?: string; serialNum?: string }; code?: string },
      ) => {
        if (macAddress && _toLower(curr?.info?.macAddress) === _toLower(macAddress)) {
          acc.macAddress = 1
        }
        if (code && _toLower(curr?.code) === _toLower(code)) {
          acc.code = 1
        }
        if (_toLower(curr?.info?.serialNum) === _toLower(serialNum)) {
          acc.serialNum = 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    if (!_isEmpty(duplicateFields)) {
      _forEach(_keys(duplicateFields), (field: string) => {
        setFieldError(field, 'Duplicate Value! A miner with this value already exists')
      })
      return
    }

    const currentSite = _get(siteData, ['site'])
    const siteTag = `site-${currentSite}`

    const params = [
      {
        rackId: minerType,
        info: {
          site: currentSite,
          serialNum,
          location,
          status,
          ...(macAddress ? { macAddress } : {}),
        },
        ...(code ? { code } : {}),
        opts: { username, password },
        comment,
        tags: _compact([...(tags || []), siteTag]),
      },
    ]

    const action = {
      type: 'voting',
      action: ACTION_TYPES.REGISTER_THING,
      params,
    }

    const wrappedSubmitAction = async (params: { action: unknown }) => {
      const result = await submitAction({
        action: params.action as
          | import('@/types/api').SetupPoolsAction
          | import('@/app/utils/deviceUtils/types').UnknownRecord,
      })
      return {
        ...result,
        error: result.error,
      }
    }
    await executeAction({ executor: wrappedSubmitAction, action, onSuccess: handleSuccess })
  }

  const formik = useFormik({
    initialValues: {
      minerType: null,
      serialNum: '',
      status: null,
      location: null,
      date: new Date().valueOf(),
      comment: '',
      username: '',
      password: '',
      tags: [],
      code: '',
      macAddress: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
  })

  useEffect(() => {
    const minerRackId = formik.values.minerType
    if (isLoadingShortCode || !minerRackId) return
    const dataArray = Array.isArray(data) ? data : []
    const firstData = _head(dataArray) as
      | Array<{ rackId?: string; requestValue?: string }>
      | undefined
    const nextAvailableCode = firstData
      ? _find(
          firstData,
          (item: { rackId?: string; requestValue?: string }) => item?.rackId === minerRackId,
        )?.requestValue
      : undefined

    if (nextAvailableCode) {
      formik.setFieldValue('code', nextAvailableCode)
    }
  }, [data, isLoadingShortCode, formik.values.minerType])

  const isLoading = isSiteLoading

  return (
    <StyledModal
      title={<ModalTitle>New Miner</ModalTitle>}
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
              <FormikRackIdSelect name="minerType" placeholder="Miner Type" />
              <FormikInput placeholder="Serial Number" name="serialNum" />
              <FormikInput placeholder="MAC Address" name="macAddress" />
              <FormikInput placeholder="Short Code" name="code" />
              <FormikSelect placeholder="Status" name="status" options={statusOptions} />
              <FormikLocationSelect
                placeholder="Location"
                name="location"
                filterLocationOptions={(options) =>
                  _filter(
                    options,
                    (option) => !_includes(String(option.value || ''), 'container'),
                  ) as typeof options
                }
              />
              <FormikDatePicker placeholder="Date" name="date" disabled />
              <FormikInput placeholder="Username" name="username" />
              <FormikInput placeholder="Password" type="password" name="password" />
              <FormikSelect mode="tags" placeholder="Tags" name="tags" />
              <FormikTextArea placeholder="Comment" name="comment" rows={4} />
              <FormActions>
                <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                  Save
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

export default AddMinerModal

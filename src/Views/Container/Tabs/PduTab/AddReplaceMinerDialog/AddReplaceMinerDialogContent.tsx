import Checkbox from 'antd/es/checkbox'
import type { CheckboxProps } from 'antd/es/checkbox'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import Tooltip from 'antd/es/tooltip'
import { FormikProvider, useFormik } from 'formik'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _replace from 'lodash/replace'
import _toLower from 'lodash/toLower'
import { useState, useEffect, FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as yup from 'yup'

import { RackIdSelectionDropdown } from '../PositionChangeDialog/RackIdSelectionDropdown'
import { StaticMinerIpAssigment } from '../StaticMinerIpAssigment'

import {
  AddReplaceMinerModalFooter,
  DuplicateErrorMsg,
  MinerTypeError,
} from './AddReplaceMinerDialog.styles'
import { buildAddReplaceMinerParams, isActionExists, isValidMacAddress } from './helper'

import { useGetListThingsQuery, useGetThingConfigQuery } from '@/app/services/api'
import { useGetSiteQuery } from '@/app/services/api'
import { actionsSlice, selectPendingSubmissions } from '@/app/slices/actionsSlice'
import { getDeviceContainerPosText } from '@/app/utils/containerUtils'
import { getMinerShortCode } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatMacAddress } from '@/app/utils/format'
import { notifyError, notifyInfo } from '@/app/utils/NotificationService'
import { PrimaryButton } from '@/Components/ActionsSidebar/ActionCard/ActionCard.styles'
import { InputTitle } from '@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.styles'
import { FormikInput, FormikInputWithTransform, FormikSelect } from '@/Components/FormInputs'
import { ACTION_TYPES } from '@/constants/actions'
import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'
import { INVALID_MAC_ADDRESS_ERROR } from '@/constants/errors'
import { useMinerDuplicateValidation } from '@/hooks/useMinerDuplicateValidation'
import { useStaticMinerIpAssignment } from '@/hooks/useStaticMinerIpAssignment'

const getValidationSchema = (isChangeInfo: boolean, isDirectToMaintenanceMode: boolean) => {
  let containerMinerRackIdSchema = yup.string()
  if (isDirectToMaintenanceMode) {
    containerMinerRackIdSchema = yup.string().required('Miner type is required')
  } else if (!isChangeInfo) {
    containerMinerRackIdSchema = yup.string().required('Miner type is required')
  }

  return yup.object({
    serialNumber: yup.string().required('Serial Number is required').trim(),
    macAddress: yup
      .string()
      .required('MAC Address is required')
      .test(
        'is-valid-mac',
        INVALID_MAC_ADDRESS_ERROR,
        (value) => !value || isValidMacAddress(value),
      ),
    username: isChangeInfo ? yup.string() : yup.string().required('Username is required').trim(),
    password: isChangeInfo ? yup.string() : yup.string().required('Password is required').trim(),
    shortCode: yup.string().trim(),
    tags: yup.array().of(yup.string()),
    minerIp: yup.string(),
    forceSetIp: yup.boolean(),
    containerMinerRackId: containerMinerRackIdSchema,
  })
}

const { setAddPendingSubmissionAction } = actionsSlice.actions

const getDuplicateErrMessage = (isStaticIpAssignment?: boolean, forceSetIp?: boolean): string =>
  `Short code, Serial Number ${
    isStaticIpAssignment && forceSetIp ? ', IP address' : ''
  } or MAC address is already being used`

interface AddReplaceMinerDialogContentProps {
  selectedEditSocket?: UnknownRecord
  onCancel?: () => void
  currentDialogFlow?: string
  isDirectToMaintenanceMode?: boolean
  minersType?: string
  isContainerEmpty?: boolean
}

const AddReplaceMinerDialogContent = ({
  selectedEditSocket,
  onCancel,
  currentDialogFlow,
  isDirectToMaintenanceMode = false,
  minersType,
}: AddReplaceMinerDialogContentProps) => {
  const dispatch = useDispatch()
  const pendingSubmissions = useSelector(selectPendingSubmissions)
  const { data: siteData, isLoading: isSiteLoading } = useGetSiteQuery(undefined)
  const { isStaticIpAssignment, minerIp } = useStaticMinerIpAssignment(selectedEditSocket)
  const { checkDuplicate, duplicateError, isDuplicateCheckLoading, setDuplicateError } =
    useMinerDuplicateValidation()

  const currentSite = _get(siteData, ['site']) as string | undefined
  const isChangeInfo = POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO === currentDialogFlow

  const { data: minerSparePartsData, isLoading: isMinerSparePartsLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      $and: [
        {
          'info.parentDeviceId': {
            $eq:
              ((selectedEditSocket?.miner as UnknownRecord | undefined)?.id as
                | string
                | undefined) || undefined,
          },
          type: { $eq: 'inventory-miner_part-controller' },
        },
      ],
    }),
    fields: JSON.stringify({
      id: 1,
    }),
  })
  const [spareParts, setSpareParts] = useState<UnknownRecord[]>([])

  useEffect(() => {
    const dataArray = minerSparePartsData as UnknownRecord[] | undefined
    if (isMinerSparePartsLoading || _isEmpty(_head(dataArray))) {
      return
    }
    setSpareParts((_head(dataArray) as UnknownRecord[] | undefined) || [])
  }, [minerSparePartsData, isMinerSparePartsLoading])

  const selectedEditSocketMiner = selectedEditSocket?.miner as UnknownRecord | undefined
  const selectedEditSocketMinerInfo = selectedEditSocketMiner?.info as UnknownRecord | undefined
  const selectedEditSocketContainerInfo = selectedEditSocket?.containerInfo as
    | UnknownRecord
    | undefined

  const initialTags = (selectedEditSocketMiner?.tags as string[] | undefined) || []
  const initialRackId =
    (selectedEditSocketContainerInfo?.rack as string) ||
    (selectedEditSocketMiner?.rack as string) ||
    minersType ||
    ''
  const [minerRack, setMinerRack] = useState<string>(initialRackId)

  const formik = useFormik({
    initialValues: {
      serialNumber: (selectedEditSocketMinerInfo?.serialNum as string) || '',
      macAddress: (selectedEditSocketMinerInfo?.macAddress as string) || '',
      username: '',
      password: '',
      forceSetIp: false,
      tags: initialTags,
      shortCode: getMinerShortCode(
        (selectedEditSocketMiner?.code as string) || '',
        initialTags,
        '',
      ),
      containerMinerRackId: initialRackId,
      minerIp: minerIp || '',
    },
    validationSchema: getValidationSchema(isChangeInfo, isDirectToMaintenanceMode),
    validateOnMount: true,
    onSubmit: async (values) => {
      await onAddReplaceMiner(values)
    },
  })

  const { data, isLoading: isLoadingShortCode } = useGetThingConfigQuery(
    {
      requestType: 'nextAvailableCode',
      type: 'miner',
    },
    {
      skip: currentDialogFlow !== undefined || !minerRack,
    },
  )

  useEffect(() => {
    if (isLoadingShortCode || !minerRack) return
    const dataArray = data as UnknownRecord[] | undefined
    const nextAvailableCodeObj = _find(
      _head(dataArray) as UnknownRecord[] | undefined,
      (item) => (item as UnknownRecord | undefined)?.rackId === minerRack,
    ) as UnknownRecord | undefined
    const nextAvailableCode = nextAvailableCodeObj?.requestValue as string | undefined

    if (nextAvailableCode) {
      formik.setFieldValue('shortCode', nextAvailableCode)
    }
  }, [minerRack, data, isLoadingShortCode])

  const getNotificationText = (values: typeof formik.values): string => {
    const containerPosText = getDeviceContainerPosText(selectedEditSocket!)
    const commonText = `
      Code: ${values.shortCode},
      SN: ${values.serialNumber},
      MAC: ${formatMacAddress(values.macAddress)}
      ${containerPosText ? `to ${containerPosText}` : ''}
    `
    switch (currentDialogFlow) {
      case POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO:
        return `Change Miner Info: SN: ${values.serialNumber}, MAC: ${formatMacAddress(values.macAddress)}`
      case POSITION_CHANGE_DIALOG_FLOWS.REPLACE_MINER:
        return `Replace Miner: ${selectedEditSocketMiner?.id as string} with Miner: ${commonText}`
      default:
        return `Add Miner: ${commonText}`
    }
  }

  const onAddReplaceMiner = async (values: typeof formik.values) => {
    if (!isValidMacAddress(values.macAddress)) return

    const duplicatePayload = isChangeInfo
      ? {
          ...(values.macAddress !== (selectedEditSocketMinerInfo?.macAddress as string)
            ? { macAddress: values.macAddress }
            : {}),
          ...(values.serialNumber !== (selectedEditSocketMinerInfo?.serialNumber as string)
            ? { serialNumber: values.serialNumber }
            : {}),
          ...(values.serialNumber !== (selectedEditSocketMiner?.code as string)
            ? { code: values.shortCode }
            : {}),
        }
      : {
          macAddress: values.macAddress,
          serialNumber: values.serialNumber,
          address: values.minerIp,
          code: values.shortCode,
        }
    const isDuplicate = await checkDuplicate(
      (selectedEditSocket as { miner?: { id?: string } }) || null,
      duplicatePayload,
    )
    if (isDuplicate) return
    if (
      isActionExists({
        pendingSubmissions: pendingSubmissions as unknown[],
        macAddress: values.macAddress,
        serialNumber: values.serialNumber,
      })
    ) {
      notifyError(
        'Action already exists',
        'There is already an action for this serial number or MAC address',
      )
      return
    }
    if (isDirectToMaintenanceMode && (isSiteLoading || !currentSite)) {
      notifyError("Site information didn't load", 'Please try again in sometime')
    }
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: isDirectToMaintenanceMode ? minerRack : values.containerMinerRackId,
      forceSetIp: values.forceSetIp,
      isChangeInfo,
      isDirectToMaintenanceMode,
      macAddress: values.macAddress,
      password: values.password,
      selectedEditSocket,
      serialNumber: values.serialNumber,
      shortCode: values.shortCode,
      tags: values.tags,
      username: values.username,
      currentSite,
      isStaticIpAssignment,
      minerIp: values.minerIp,
    })
    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: isChangeInfo ? ACTION_TYPES.UPDATE_THING : ACTION_TYPES.REGISTER_THING,
        params: params,
        minerId: selectedEditSocketMiner?.id as string,
      }),
    )
    notifyInfo('Action added', getNotificationText(values))
    formik.resetForm()
    onCancel?.()
  }

  const getButtonText = (): string => {
    switch (currentDialogFlow) {
      case POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO:
        return 'Change Miner Info'
      case POSITION_CHANGE_DIALOG_FLOWS.REPLACE_MINER:
        return 'Replace Miner'
      default:
        return 'Add Miner'
    }
  }

  const getIsSubmitDisabled = (): boolean => isDuplicateCheckLoading || isMinerSparePartsLoading

  const onSetIpCheckboxChange: CheckboxProps['onChange'] = (e) => {
    formik.setFieldValue('forceSetIp', e.target.checked)
  }

  const handleMinerTypeChange = (value: unknown) => {
    setMinerRack(value as string)
    formik.setFieldValue('containerMinerRackId', value)
    formik.setFieldTouched('containerMinerRackId', true)
  }

  const getMACTooltipText = (): string => {
    if (isMinerSparePartsLoading) return 'Please wait validating miner controller'
    if (!_isEmpty(spareParts))
      return "To change MAC, replace the miner's Controller from the Inventory management tool"
    return ''
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    formik.setTouched(
      {
        containerMinerRackId: true,
        serialNumber: true,
        macAddress: true,
        username: true,
        password: true,
      },
      false,
    ) // false = don't trigger validation yet
    formik.handleSubmit()
  }

  const hasMinerTypeError =
    formik.touched.containerMinerRackId && formik.errors.containerMinerRackId

  return (
    <FormikProvider value={formik}>
      <form onSubmit={handleFormSubmit} noValidate>
        <Row gutter={[15, 4]}>
          {!currentDialogFlow && (
            <Col span={24}>
              <InputTitle>Miner type</InputTitle>
              <RackIdSelectionDropdown
                value={minerRack}
                handleChange={handleMinerTypeChange}
                status={hasMinerTypeError ? 'error' : undefined}
              />
              <MinerTypeError>{hasMinerTypeError}</MinerTypeError>
            </Col>
          )}
          <Col span={24}>
            <InputTitle>{`Short Code ${!currentDialogFlow ? '(editable)' : ''}`}</InputTitle>
            <FormikInput name="shortCode" readOnly={!!currentDialogFlow} />
          </Col>
          <Col span={24}>
            <InputTitle>Serial Number</InputTitle>
            <FormikInputWithTransform
              name="serialNumber"
              required
              transform={(value) => _replace(String(value), /\s+/g, '')}
              onValueChange={() => setDuplicateError(false)}
            />
          </Col>
          <Col span={24}>
            <InputTitle>MAC Address</InputTitle>
            <Tooltip title={getMACTooltipText()}>
              <div>
                <FormikInputWithTransform
                  name="macAddress"
                  transform={(value) => _toLower(_replace(String(value), /\s+/g, ''))}
                  formatDisplay={(value) => formatMacAddress(value)}
                  onValueChange={() => setDuplicateError(false)}
                  readOnly={!_isEmpty(spareParts) || isMinerSparePartsLoading}
                />
              </div>
            </Tooltip>
          </Col>
          {!isChangeInfo ? (
            <>
              <Col span={24}>
                <InputTitle>User Name</InputTitle>
                <FormikInput name="username" />
              </Col>
              <Col span={24}>
                <InputTitle>Password</InputTitle>
                <FormikInput name="password" type="password" />
              </Col>
            </>
          ) : null}
          <Col span={24}>
            <InputTitle>Tags</InputTitle>
            <FormikSelect name="tags" mode="tags" placeholder="Add tags" />
          </Col>
          {(!isDirectToMaintenanceMode || isStaticIpAssignment) && (
            <StaticMinerIpAssigment
              forceSetIp={formik.values.forceSetIp}
              isStaticIpAssignment={isStaticIpAssignment}
              minerIp={formik.values.minerIp}
              setMinerIp={(ip) => formik.setFieldValue('minerIp', ip)}
              isChangeInfo={isChangeInfo}
            />
          )}
          {(isStaticIpAssignment || (!isDirectToMaintenanceMode && !isChangeInfo)) && (
            <Col span={24}>
              <Checkbox onChange={onSetIpCheckboxChange} checked={formik.values.forceSetIp}>
                Force set new IP
              </Checkbox>
            </Col>
          )}
        </Row>
        {duplicateError && (
          <DuplicateErrorMsg>
            {getDuplicateErrMessage(isStaticIpAssignment, formik.values.forceSetIp)}
          </DuplicateErrorMsg>
        )}
        <AddReplaceMinerModalFooter>
          <PrimaryButton
            htmlType="submit"
            loading={isDuplicateCheckLoading || isMinerSparePartsLoading || formik.isSubmitting}
            disabled={getIsSubmitDisabled()}
          >
            {getButtonText()}
          </PrimaryButton>
        </AddReplaceMinerModalFooter>
      </form>
    </FormikProvider>
  )
}

export default AddReplaceMinerDialogContent

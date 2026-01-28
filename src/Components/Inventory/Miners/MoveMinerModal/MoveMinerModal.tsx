import { ArrowRightOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _head from 'lodash/head'
import _isEqual from 'lodash/isEqual'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _reject from 'lodash/reject'
import _values from 'lodash/values'
import { useEffect, useState } from 'react'
import * as yup from 'yup'

import { useGetListThingsQuery } from '../../../../app/services/api'
import { getDevicesIdList } from '../../../../app/utils/actionUtils'
import { getLocationLabel } from '../../../../app/utils/inventoryUtils'
import { getLocationColors, getStatusColors } from '../../../../app/utils/minerUtils'
import { MAINTENANCE_CONTAINER } from '../../../../constants/containerConstants'
import { getPosHistory } from '../../../../Views/Container/Tabs/PduTab/PositionChangeDialog/PositionChangeDialog.utils'
import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'
import { MINER_LOCATIONS, MINER_STATUS_NAMES, MINER_STATUSES } from '../Miners.constants'

import { MinerDetails } from './MinerDetails'
import {
  FormActions,
  FormBody,
  FormHeader,
  FormStatus,
  LeftPanel,
  ModalBody,
  ModalTitle,
  MoveForm,
  MovementPreview,
  RightPanel,
  StatusFields,
  StatusSection,
  LargeStatusFields,
  TargetStateField,
  TargetStateFields,
  LargeStatusField,
  LargeStatusFieldName,
  LargeStatusFieldValue,
  ArrowWrapper,
  ConfirmationText,
  StyledModal,
  StyledSpinner,
} from './MoveMinerModal.styles'

import { notifyError } from '@/app/utils/NotificationService'
import { FormikSelect, FormikTextArea } from '@/Components/FormInputs'
import { ACTION_SUFFIXES, ACTION_TYPES, BATCH_ACTION_TYPES } from '@/constants/actions'

const MoveMinerFormSteps = {
  STEP_1: 1,
  STEP_2: 2,
}

interface MoveMinerModalProps {
  isOpen: boolean
  onClose: () => void
  miner: {
    id: string
    location?: string
    status?: string
    code?: string
    serialNum?: string
    raw?: {
      rack?: string
      info?: {
        container?: string
        pos?: string
      }
    }
    [key: string]: unknown
  }
  requestedValues?: {
    location?: string
    status?: string
  }
}

interface SparePart {
  id: string
  rack?: string
  [key: string]: unknown
}

interface ActionWithTags {
  action: string
  minerId: string
  params: Array<{
    id: string
    rackId?: string
    info?: {
      location?: string
    }
  }>
  tags?: string[]
}

const statusOptions = _map(_values(MINER_STATUSES), (value: string) => ({
  value: value,
  label: MINER_STATUS_NAMES[value as keyof typeof MINER_STATUS_NAMES] ?? value,
}))

const validationSchema = yup.object({
  location: yup.string().required('Location is required'),
  status: yup.string().required('Status is required'),
  observation: yup.string(),
})

const MoveMinerModal = ({ isOpen, onClose, miner, requestedValues }: MoveMinerModalProps) => {
  const { submitAction } = useDirectSubmitAction()

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  const {
    data,
    isLoading: isMinerSparePartsLoading,
    error: minerSparePartsLoadingError,
  } = useGetListThingsQuery({
    query: JSON.stringify({
      'info.parentDeviceId': {
        $eq: miner.id,
      },
    }),
    fields: JSON.stringify({
      id: 1,
      rack: 1,
    }),
  })

  useEffect(() => {
    if (minerSparePartsLoadingError) {
      notifyError('Unable to load data. Please try again later', '')
      onClose()
    }
  })

  const deviceType = 'Miner'
  const [formStep, setFormStep] = useState(MoveMinerFormSteps.STEP_1)
  const [spareParts, setSpareParts] = useState<SparePart[]>([])

  useEffect(() => {
    if (isMinerSparePartsLoading || !data) {
      return
    }

    const firstData = _head(data as unknown[])
    if (firstData && Array.isArray(firstData)) {
      setSpareParts(firstData as SparePart[])
    }
  }, [data, isMinerSparePartsLoading])

  const minerValues = {
    location: miner.location,
    status: miner.status,
    observation: '',
  }

  const initialValues = {
    location: requestedValues?.location ?? miner.location,
    status: requestedValues?.status ?? miner.status,
    observation: '',
  }

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const { location, status, observation } = values
      const { id, raw } = miner
      const rack = raw?.rack

      const info = {
        location,
        status,
      }

      const isLocationChanged = info.location !== miner.location
      const isOutsideContainer = location !== MINER_LOCATIONS.SITE_CONTAINER
      const movingOutFromContainer =
        isOutsideContainer && miner?.raw?.info?.container === MINER_LOCATIONS.SITE_CONTAINER

      const sparePartActions = isLocationChanged
        ? _map(spareParts, (part: SparePart) => {
            const action: ActionWithTags = {
              action: ACTION_TYPES.UPDATE_THING,
              minerId: part.id,
              params: [
                {
                  id: part.id,
                  rackId: part.rack,
                  info: {
                    location,
                  },
                },
              ],
            }

            action.tags = getDevicesIdList(action)

            return action
          })
        : []

      const posHistory = getPosHistory({
        containerInfo: {
          container: miner?.raw?.info?.container,
        },
        selectedSocketToReplacePos: miner?.raw?.info?.pos,
        miner: miner?.raw,
      })

      const minerActionParams = [
        {
          id,
          code: miner.code,
          rackId: rack,
          info: {
            ...info,
            serialNum: miner.serialNum,
            ...(isOutsideContainer
              ? {
                  container: MAINTENANCE_CONTAINER,
                  pos: '',
                  subnet: '',
                  ...(movingOutFromContainer ? { posHistory } : {}),
                }
              : {}),
          },
          comment: observation,
        },
      ]

      const minerAction = {
        action: ACTION_TYPES.UPDATE_THING,
        minerId: id,
        params: minerActionParams,
      }

      const batchedAction = {
        action: BATCH_ACTION_TYPES.MOVE_MINER,
        batchActionUID: miner.id,
        batchActionsPayload: [...sparePartActions, minerAction],
        metadata: {
          from: {
            location: miner.location,
            status: miner.status,
          },
          to: info,
        },
        suffix: ACTION_SUFFIXES.REPAIR,
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
      await executeAction({
        executor: wrappedSubmitAction,
        action: batchedAction,
        onSuccess: handleSuccess,
      })
    },
  })

  const valuesChanged = !_isEqual(
    _omit(formik.values, ['observation']),
    _omit(minerValues, ['observation']),
  )

  const handleStep1Confirm = () => {
    setFormStep(MoveMinerFormSteps.STEP_2)
  }

  const handleCancel = () => {
    formik.setValues(minerValues)
    setFormStep(MoveMinerFormSteps.STEP_1)
  }

  const allowedLocationItems = _map(
    _reject(_values(MINER_LOCATIONS), (value: string) => value === MINER_LOCATIONS.SITE_CONTAINER),
    (value: string) => ({
      value: value,
      label: getLocationLabel(value),
    }),
  )

  const isLoading = isMinerSparePartsLoading

  return (
    <StyledModal
      title={
        <ModalTitle>
          Device Updates {'>'} Move {deviceType}
        </ModalTitle>
      }
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={850}
      maskClosable={false}
    >
      {isLoading ? (
        <StyledSpinner />
      ) : (
        <ModalBody>
          <StatusSection>
            <LeftPanel>
              <MinerDetails miner={miner} />
            </LeftPanel>
            <RightPanel>
              {formStep === MoveMinerFormSteps.STEP_1 && (
                <LargeStatusFields>
                  <LargeStatusField>
                    <LargeStatusFieldName>Current Location: </LargeStatusFieldName>
                    <LargeStatusFieldValue {...getLocationColors(miner.location ?? '')}>
                      {getLocationLabel(miner.location ?? '')}
                    </LargeStatusFieldValue>
                  </LargeStatusField>
                  <LargeStatusField>
                    <LargeStatusFieldName>Current Status: </LargeStatusFieldName>
                    <LargeStatusFieldValue {...getStatusColors(miner.status ?? '')}>
                      {miner.status
                        ? (MINER_STATUS_NAMES[miner.status as keyof typeof MINER_STATUS_NAMES] ??
                          miner.status)
                        : ''}
                    </LargeStatusFieldValue>
                  </LargeStatusField>
                </LargeStatusFields>
              )}
            </RightPanel>
          </StatusSection>
          {formStep === MoveMinerFormSteps.STEP_2 && (
            <MovementPreview>
              <LargeStatusFields>
                <LargeStatusField>
                  <LargeStatusFieldName>Current Location: </LargeStatusFieldName>
                  <LargeStatusFieldValue {...getLocationColors(miner.location ?? '')}>
                    {getLocationLabel(miner.location ?? '')}
                  </LargeStatusFieldValue>
                </LargeStatusField>
                <LargeStatusField>
                  <LargeStatusFieldName>Current Status: </LargeStatusFieldName>
                  <LargeStatusFieldValue {...getStatusColors(miner.status ?? '')}>
                    {miner.status
                      ? (MINER_STATUS_NAMES[miner.status as keyof typeof MINER_STATUS_NAMES] ??
                        miner.status)
                      : ''}
                  </LargeStatusFieldValue>
                </LargeStatusField>
              </LargeStatusFields>
              <ArrowWrapper>
                <ArrowRightOutlined height={72} width={72} />
              </ArrowWrapper>
              <LargeStatusFields>
                <LargeStatusField>
                  <LargeStatusFieldName>New Location: </LargeStatusFieldName>
                  <LargeStatusFieldValue {...getLocationColors(formik.values.location ?? '')}>
                    {getLocationLabel(formik.values.location ?? '')}
                  </LargeStatusFieldValue>
                </LargeStatusField>
                <LargeStatusField>
                  <LargeStatusFieldName>New Status: </LargeStatusFieldName>
                  <LargeStatusFieldValue {...getStatusColors(formik.values.status ?? '')}>
                    {formik.values.status
                      ? (MINER_STATUS_NAMES[
                          formik.values.status as keyof typeof MINER_STATUS_NAMES
                        ] ?? formik.values.status)
                      : ''}
                  </LargeStatusFieldValue>
                </LargeStatusField>
              </LargeStatusFields>
            </MovementPreview>
          )}
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit}>
              <MoveForm>
                {formStep === MoveMinerFormSteps.STEP_1 && (
                  <FormBody>
                    <FormHeader>Move {deviceType} to</FormHeader>
                    <TargetStateFields>
                      <TargetStateField>
                        <span>New Location</span>
                        <FormikSelect name="location" options={allowedLocationItems} />
                      </TargetStateField>
                      <StatusFields>
                        <TargetStateField>
                          <span>New Status</span>
                          <FormikSelect name="status" options={statusOptions} />
                        </TargetStateField>
                      </StatusFields>
                    </TargetStateFields>
                    <FormikTextArea
                      rows={3}
                      placeholder="Please enter observations here"
                      name="observation"
                    />
                    {valuesChanged ? (
                      <FormActions>
                        <Button type="primary" onClick={handleStep1Confirm}>
                          Review Changes
                        </Button>
                      </FormActions>
                    ) : (
                      <FormStatus>No Changes made</FormStatus>
                    )}
                  </FormBody>
                )}
                {formStep === MoveMinerFormSteps.STEP_2 && (
                  <FormBody>
                    <FormikTextArea
                      rows={3}
                      placeholder="Please enter observations here"
                      name="observation"
                    />
                    <ConfirmationText>Are you sure?</ConfirmationText>
                    <FormActions>
                      <Button loading={formik.isSubmitting} type="primary" htmlType="submit">
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} disabled={formik.isSubmitting}>
                        Cancel
                      </Button>
                    </FormActions>
                  </FormBody>
                )}
              </MoveForm>
            </form>
          </FormikProvider>
        </ModalBody>
      )}
    </StyledModal>
  )
}

export default MoveMinerModal

import { ArrowRightOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _isEqual from 'lodash/isEqual'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _reject from 'lodash/reject'
import _values from 'lodash/values'
import { useState } from 'react'
import * as yup from 'yup'

import { getLocationLabel } from '../../../../app/utils/inventoryUtils'
import { getLocationColors, getStatusColors } from '../../../../app/utils/sparePartUtils'
import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'
import {
  SPARE_PART_LOCATIONS,
  SPARE_PART_STATUS_NAMES,
  SPARE_PART_STATUSES,
} from '../SpareParts.constants'

import {
  ArrowWrapper,
  ConfirmationText,
  FormActions,
  FormBody,
  FormHeader,
  FormStatus,
  LargeStatusField,
  LargeStatusFieldName,
  LargeStatusFields,
  LargeStatusFieldValue,
  LeftPanel,
  ModalBody,
  ModalTitle,
  MoveForm,
  MovementPreview,
  RightPanel,
  StatusFields,
  StatusSection,
  StyledModal,
  TargetStateField,
  TargetStateFields,
} from './MoveSparePartModal.styles'
import SparePartDetails from './SparePartDetails'

import { FormikSelect, FormikTextArea } from '@/Components/FormInputs'
import { ACTION_TYPES } from '@/constants/actions'

const MoveSparePartFormSteps = {
  STEP_1: 1,
  STEP_2: 2,
}

type SparePartLocationValue = (typeof SPARE_PART_LOCATIONS)[keyof typeof SPARE_PART_LOCATIONS]
type SparePartStatusValue = (typeof SPARE_PART_STATUSES)[keyof typeof SPARE_PART_STATUSES]

interface SparePart {
  id: string
  location: SparePartLocationValue
  status: SparePartStatusValue
  raw: {
    rack: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface RequestedValues {
  location?: SparePartLocationValue
  status?: SparePartStatusValue
}

interface FormValues {
  location: SparePartLocationValue
  status: SparePartStatusValue
  observation: string
}

const statusOptions = _map(_values(SPARE_PART_STATUSES), (value) => ({
  value: value as SparePartStatusValue,
  label: SPARE_PART_STATUS_NAMES[value as SparePartStatusValue],
}))

const validationSchema = yup.object({
  location: yup.string().required('Location is required'),
  status: yup.string().required('Status is required'),
  observation: yup.string(),
})

interface MoveSparePartModalProps {
  isOpen?: boolean
  onClose?: () => void
  sparePart?: SparePart
  requestedValues?: RequestedValues
}

const MoveSparePartModal = ({
  isOpen,
  onClose,
  sparePart,
  requestedValues,
}: MoveSparePartModalProps) => {
  const deviceType = 'Spare Part'
  const [formStep, setFormStep] = useState(MoveSparePartFormSteps.STEP_1)
  const { submitAction } = useDirectSubmitAction()

  // Calculate initial values before early return to avoid React Hooks rules violation
  const initialValues: FormValues = sparePart
    ? {
        location: requestedValues?.location ?? sparePart.location,
        status: requestedValues?.status ?? sparePart.status,
        observation: '',
      }
    : { location: '', status: '', observation: '' }

  const sparePartValues: FormValues = sparePart
    ? {
        location: sparePart.location,
        status: sparePart.status,
        observation: '',
      }
    : { location: '', status: '', observation: '' }

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (!sparePart) return

      const { location, status, observation } = values
      const {
        id,
        raw: { rack },
      } = sparePart

      const info = {
        location,
        status,
      }

      const params = [
        {
          id,
          rackId: rack,
          info,
          comment: observation,
        },
      ]

      const action = {
        type: 'voting',
        action: ACTION_TYPES.UPDATE_THING,
        params,
        minerId: id,
      }

      await executeAction({
        executor: submitAction as (params: {
          action: unknown
        }) => Promise<{ error?: unknown; [key: string]: unknown }>,
        action,
        onSuccess: handleSuccess,
      })

      if (onClose) {
        onClose()
      }
    },
  })

  if (!sparePart) return null

  const valuesChanged = !_isEqual(
    _omit(formik.values, ['observation']),
    _omit(sparePartValues, ['observation']),
  )

  const handleStep1Confirm = () => {
    setFormStep(MoveSparePartFormSteps.STEP_2)
  }

  const handleCancel = () => {
    formik.setValues(sparePartValues)
    setFormStep(MoveSparePartFormSteps.STEP_1)
  }

  const allowedLocationItems = _map(
    _reject(
      _values(SPARE_PART_LOCATIONS),
      (value) => value === SPARE_PART_LOCATIONS.SITE_CONTAINER,
    ),
    (value) => ({
      value: value as SparePartLocationValue,
      label: getLocationLabel(value as SparePartLocationValue),
    }),
  )

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
    >
      <ModalBody>
        <StatusSection>
          <LeftPanel>
            <SparePartDetails sparePart={sparePart} />
          </LeftPanel>
          <RightPanel>
            {formStep === MoveSparePartFormSteps.STEP_1 && (
              <LargeStatusFields>
                <LargeStatusField>
                  <LargeStatusFieldName>Current Location: </LargeStatusFieldName>
                  <LargeStatusFieldValue {...getLocationColors(sparePart.location)}>
                    {getLocationLabel(sparePart.location)}
                  </LargeStatusFieldValue>
                </LargeStatusField>
                <LargeStatusField>
                  <LargeStatusFieldName>Current Status: </LargeStatusFieldName>
                  <LargeStatusFieldValue {...getStatusColors(sparePart.status)}>
                    {SPARE_PART_STATUS_NAMES[sparePart.status]}
                  </LargeStatusFieldValue>
                </LargeStatusField>
              </LargeStatusFields>
            )}
          </RightPanel>
        </StatusSection>
        {formStep === MoveSparePartFormSteps.STEP_2 && (
          <MovementPreview>
            <LargeStatusFields>
              <LargeStatusField>
                <LargeStatusFieldName>Current Location: </LargeStatusFieldName>
                <LargeStatusFieldValue {...getLocationColors(sparePart.location)}>
                  {getLocationLabel(sparePart.location)}
                </LargeStatusFieldValue>
              </LargeStatusField>
              <LargeStatusField>
                <LargeStatusFieldName>Current Status: </LargeStatusFieldName>
                <LargeStatusFieldValue {...getStatusColors(sparePart.status)}>
                  {SPARE_PART_STATUS_NAMES[sparePart.status]}
                </LargeStatusFieldValue>
              </LargeStatusField>
            </LargeStatusFields>
            <ArrowWrapper>
              <ArrowRightOutlined height={72} width={72} />
            </ArrowWrapper>
            <LargeStatusFields>
              <LargeStatusField>
                <LargeStatusFieldName>New Location: </LargeStatusFieldName>
                <LargeStatusFieldValue {...getLocationColors(formik.values.location)}>
                  {getLocationLabel(formik.values.location)}
                </LargeStatusFieldValue>
              </LargeStatusField>
              <LargeStatusField>
                <LargeStatusFieldName>New Status: </LargeStatusFieldName>
                <LargeStatusFieldValue {...getStatusColors(formik.values.status)}>
                  {SPARE_PART_STATUS_NAMES[formik.values.status]}
                </LargeStatusFieldValue>
              </LargeStatusField>
            </LargeStatusFields>
          </MovementPreview>
        )}
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <MoveForm>
              {formStep === MoveSparePartFormSteps.STEP_1 && (
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
                        Save Changes
                      </Button>
                    </FormActions>
                  ) : (
                    <FormStatus>No Changes made</FormStatus>
                  )}
                </FormBody>
              )}
              {formStep === MoveSparePartFormSteps.STEP_2 && (
                <FormBody>
                  <FormikTextArea
                    rows={3}
                    placeholder="Please enter observations here"
                    name="observation"
                  />
                  <ConfirmationText>Are you sure?</ConfirmationText>
                  <FormActions>
                    <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                      Request Changes
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
    </StyledModal>
  )
}

export default MoveSparePartModal

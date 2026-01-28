import { nanoid } from '@reduxjs/toolkit'
import Alert from 'antd/es/alert'
import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _reject from 'lodash/reject'
import _values from 'lodash/values'
import * as yup from 'yup'

import {
  SPARE_PART_LOCATIONS,
  SPARE_PART_STATUS_NAMES,
  SPARE_PART_STATUSES,
} from '../SpareParts.constants'

import {
  FormActions,
  FormFields,
  ModalBody,
  ModalTitle,
  StyledModal,
} from './BatchMoveSparePartsModal.styles'

import { Logger } from '@/app/services/logger'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getLocationLabel } from '@/app/utils/inventoryUtils'
import { notifyError, notifySuccess } from '@/app/utils/NotificationService'
import AppTable from '@/Components/AppTable/AppTable'
import { FormikSelect, FormikTextArea } from '@/Components/FormInputs'
import { useDirectSubmitAction } from '@/Components/Inventory/hooks/useDirectSubmitAction'
import { ACTION_TYPES, BATCH_ACTION_TYPES } from '@/constants/actions'
import type { SetupPoolsAction } from '@/types/api'

const validationSchema = yup
  .object({
    location: yup.string().nullable(),
    status: yup.string().nullable(),
    observation: yup.string().nullable(),
  })
  .test('at-least-one', 'Either location or status must be selected', function (value) {
    return !_isNil(value.location) || !_isNil(value.status)
  })

interface SparePart {
  id: string
  raw: { rack: string }
}

interface MoveParams {
  location?: string
  status?: string
  observation?: string
}

const createBulkMoveAction = (
  spareParts: SparePart[],
  { location, status, observation }: MoveParams,
) => {
  const sparePartActions = _map(spareParts, (sparePart: SparePart) => {
    const {
      id,
      raw: { rack },
    } = sparePart

    const info = {
      ...(!_isNil(location) ? { location } : {}),
      ...(!_isNil(status) ? { status } : {}),
    }

    const params = [
      {
        id,
        rackId: rack,
        info,
        ...(!_isNil(observation) ? { comment: observation } : {}),
      },
    ]
    return {
      type: 'voting',
      action: ACTION_TYPES.UPDATE_THING,
      params,
      minerId: id,
    }
  })

  return {
    action: BATCH_ACTION_TYPES.BATCH_MOVE_SPARE_PARTS,
    batchActionUID: nanoid(),
    batchActionsPayload: sparePartActions,
  }
}

const statusOptions = _map(_values(SPARE_PART_STATUSES), (value) => ({
  value,
  label: SPARE_PART_STATUS_NAMES[value as keyof typeof SPARE_PART_STATUS_NAMES],
}))

const getBulkMoveSparePartsTableColumns = () => [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Current Location',
    dataIndex: 'location',
    key: 'location',
    render: (value: string) => getLocationLabel(value),
  },
  {
    title: 'Current Status',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) =>
      SPARE_PART_STATUS_NAMES[value as keyof typeof SPARE_PART_STATUS_NAMES],
  },
]

interface BatchMoveSparePartsModalProps {
  isOpen: boolean
  onClose: () => void
  spareParts: SparePart[]
}

const BatchMoveSparePartsModal = ({
  isOpen,
  onClose,
  spareParts,
}: BatchMoveSparePartsModalProps) => {
  const { submitAction } = useDirectSubmitAction()

  const locationOptions = _map(
    _reject(
      _values(SPARE_PART_LOCATIONS),
      (value) => value === SPARE_PART_LOCATIONS.SITE_CONTAINER,
    ),
    (value: string) => ({
      value,
      label: getLocationLabel(value),
    }),
  )

  const formik = useFormik({
    initialValues: {
      location: null as string | null,
      status: null as string | null,
      observation: null as string | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const action = createBulkMoveAction(spareParts, {
          location: values.location ?? undefined,
          observation: values.observation ?? undefined,
          status: values.status ?? undefined,
        })

        const { error } = await submitAction({ action: action as UnknownRecord | SetupPoolsAction })

        if (!_isNil(error)) {
          throw error
        }

        notifySuccess('Moved Spare Parts successfully', '')
        onClose()
      } catch (error) {
        notifyError('Unable to perform action', '')
        Logger.error(String(error))
      }
    },
  })

  return (
    <StyledModal
      title={<ModalTitle>Batch Move Spare Parts</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={850}
    >
      <ModalBody>
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <AppTable
              dataSource={spareParts as unknown as readonly Record<string, unknown>[]}
              columns={getBulkMoveSparePartsTableColumns()}
              pagination={false}
            />
            <Alert
              message="Bulk actions can take a few seconds to complete. Please do not submit other bulk actions until the previous one is completed."
              type="info"
            />
            <FormFields>
              <FormikSelect name="location" placeholder="New Location" options={locationOptions} />
              <FormikSelect name="status" placeholder="New Status" options={statusOptions} />
              <FormikTextArea
                rows={3}
                placeholder="Please enter observations here"
                name="observation"
              />
            </FormFields>
            <FormActions>
              <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                Save
              </Button>
              <Button onClick={onClose} disabled={formik.isSubmitting}>
                Cancel
              </Button>
            </FormActions>
          </form>
        </FormikProvider>
      </ModalBody>
    </StyledModal>
  )
}

export default BatchMoveSparePartsModal

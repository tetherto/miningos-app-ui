import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import { FormikProvider, useFormik } from 'formik'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { useEffect, useRef, useState } from 'react'
import * as yup from 'yup'

import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'
import { SparePartNames } from '../../SpareParts/SpareParts.constants'
import AttachSparePartModal from '../AttachSparePartModal/AttachSparePartModal'
import { MINER_LOCATIONS, MINER_REPAIR_LOCATIONS } from '../Miners.constants'

import { getAttachedPartsListColumns, getChangedParts, getMinerMACUpdates } from './MinerInfo.utils'
import type { AttachedPartRecord } from './MinerInfo.utils'
import {
  AttributeName,
  AttributeRow,
  EmptyStateWrapper,
  FormActions,
  ModalBody,
  ModalTitle,
  StyledModal,
} from './MinerInfoModal.styles'

import { useGetListThingsQuery } from '@/app/services/api'
import { getDevicesIdList } from '@/app/utils/actionUtils'
import { getRackNameFromId } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatMacAddress } from '@/app/utils/format'
import { notifyError } from '@/app/utils/NotificationService'
import AppTable from '@/Components/AppTable/AppTable'
import { FormikTextArea } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ACTION_SUFFIXES, ACTION_TYPES, BATCH_ACTION_TYPES } from '@/constants/actions'
import { useContextualModal } from '@/hooks/useContextualModal'

interface MinerInfoModalProps {
  isOpen: boolean
  onClose: () => void
  miner: {
    id: string
    code?: string
    site?: string
    container?: string
    pos?: string
    serialNum?: string
    macAddress?: string
    location?: string
    raw: {
      rack?: string
      code?: string
      type?: string
      info?: {
        serialNum?: string
        location?: string
        container?: string
        macAddress?: string
      }
    }
  }
}

interface SparePart extends AttachedPartRecord {
  part: string
  id: string
  raw: {
    id: string
    rack?: string
    info?: {
      serialNum?: string
      macAddress?: string | null
    }
    type?: string
  }
}

interface SparePartRaw {
  id: string
  rack?: string
  info?: {
    serialNum?: string
    macAddress?: string | null
  }
  type?: string
}

interface FormValues {
  comments?: string
}

const validationSchema = yup.object({
  comments: yup.string(),
})

const MinerInfoModal = ({ isOpen, onClose, miner }: MinerInfoModalProps) => {
  const { submitAction } = useDirectSubmitAction()
  const {
    currentData: data,
    isLoading: isSparePartsLoading,
    isFetching: isSparePartsFetching,
    error: sparePartsError,
  } = useGetListThingsQuery(
    {
      query: JSON.stringify({
        'info.parentDeviceId': {
          $eq: miner.id,
        },
      }),
      fields: JSON.stringify({
        id: 1,
        code: 1,
        comments: 1,
        rack: 1,
        info: 1,
        type: 1,
        tags: 1,
      }),
    },
    { refetchOnMountOrArgChange: true },
  )

  useEffect(() => {
    if (sparePartsError) {
      notifyError('Unable to load data. Please try again', 'Error')
      onClose()
    }
  }, [sparePartsError, onClose])

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  const [spareParts, setSpareParts] = useState<SparePart[]>([])
  const initialSparePartsRef = useRef<SparePart[]>([])

  useEffect(() => {
    if (isSparePartsLoading || isSparePartsFetching || !data || _isEmpty(data)) {
      initialSparePartsRef.current = []
      setSpareParts([])
      return
    }

    const dataArray = Array.isArray(data) ? data : [data]
    const mappedParts = _map(
      _head(dataArray) as SparePartRaw[],
      (part: SparePartRaw): SparePart => ({
        part: _get(SparePartNames, getRackNameFromId(part.rack ?? '')) ?? '',
        serialNum: part.info?.serialNum,
        macAddress: part.info?.macAddress ?? undefined,
        id: part.id,
        raw: part,
        existing: true,
      }),
    )

    initialSparePartsRef.current = mappedParts
    setSpareParts(mappedParts)
  }, [data, isSparePartsFetching, isSparePartsLoading])

  const [isRegisterRepairMode, setIsRegisterRepairMode] = useState(false)
  const [areChangesMade, setAreChangesMade] = useState(false)

  const handleSubmit = async (values: FormValues) => {
    const { comments: comment } = values

    const changedParts = getChangedParts(spareParts as AttachedPartRecord[]) as SparePart[]
    const macUpdates = getMinerMACUpdates(changedParts)

    const sparePartActions = _map(changedParts, (part: SparePart) => {
      const action = {
        action: ACTION_TYPES.UPDATE_THING,
        minerId: part.id,
        params: [
          {
            id: part.id,
            rackId: part.raw.rack,
            info: {
              parentDeviceId: part.removed ? null : miner.id,
              parentDeviceType: part.removed ? null : miner.raw.type,
              parentDeviceCode: part.removed ? null : miner.raw.code,
              parentDeviceSN: part.removed ? null : miner.raw.info?.serialNum,
              ...(part.removed ? {} : { location: miner.raw.info?.location }),
            },
          },
        ],
      }

      const actionWithTags = {
        ...action,
        tags: getDevicesIdList(action),
      }

      return actionWithTags
    })

    const shouldUpdate = comment || macUpdates.isMACUpdated

    const minerActionParams = {
      id: miner.id,
      rackId: miner.raw.rack,
      info: {
        location: miner.raw.info?.location,
        container: miner.raw.info?.container,
        ...(macUpdates.isMACUpdated && { macAddress: macUpdates.newMAC }),
      },
      ...(comment && { comment }),
    }

    const minerActions = shouldUpdate
      ? [
          {
            action: ACTION_TYPES.UPDATE_THING,
            minerId: miner.id,
            params: [minerActionParams],
          },
        ]
      : []
    const batchedAction = {
      action: BATCH_ACTION_TYPES.ATTACH_SPARE_PARTS,
      batchActionUID: miner.id,
      batchActionsPayload: [...sparePartActions, ...minerActions],
      suffix: ACTION_SUFFIXES.REPAIR,
    }

    await executeAction({
      executor: submitAction as (params: {
        action: unknown
      }) => Promise<{ error?: unknown; [key: string]: unknown }>,
      action: batchedAction,
      onSuccess: handleSuccess,
    })
  }

  const formik = useFormik({
    initialValues: {
      comments: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
  })

  const {
    modalOpen: attachSparePartModalOpen,
    handleOpen: openAttachSparePartModal,
    handleClose: closeAttachSparePartModal,
  } = useContextualModal()

  const handleRegisterRepair = () => {
    setIsRegisterRepairMode(true)
  }

  const handleRemoveSparePart = (sparePartToRemove: SparePart) => {
    if (sparePartToRemove.existing) {
      setSpareParts(
        _map(spareParts, (part: SparePart) => {
          if (part.id !== sparePartToRemove.id) {
            return part
          }

          return {
            ...part,
            removed: true,
          }
        }),
      )
    } else {
      setSpareParts(_filter(spareParts, ({ id }) => id !== sparePartToRemove.id))
    }
    setAreChangesMade(true)
  }

  const handleUndoRemoveSparePart = (sparePartToUndoRemove: SparePart) => {
    if (!sparePartToUndoRemove.existing) {
      return
    }

    setSpareParts(
      _map(spareParts, (part: SparePart) => {
        if (part.id !== sparePartToUndoRemove.id) {
          return part
        }

        return {
          ...part,
          removed: false,
        }
      }),
    )
  }

  const handleCancelRegistration = () => {
    setAreChangesMade(false)
    setSpareParts(initialSparePartsRef.current)
    setIsRegisterRepairMode(false)
  }

  const handleSparePartAttachment = (part: SparePartRaw) => {
    const newPart: SparePart = {
      part: _get(SparePartNames, getRackNameFromId(part.rack ?? '')) ?? '',
      serialNum: part.info?.serialNum,
      macAddress: part.info?.macAddress ?? undefined,
      id: part.id,
      raw: part,
    }
    setSpareParts([...spareParts, newPart])
    setAreChangesMade(true)
  }

  const allowRepair = miner.location
    ? MINER_REPAIR_LOCATIONS.has(
        miner.location as typeof MINER_LOCATIONS.WORKSHOP_LAB | typeof MINER_LOCATIONS.SITE_LAB,
      )
    : false

  const registerRepairControls = (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        {areChangesMade ? (
          <>
            <FormikTextArea name="comments" placeholder="Please enter observations here..." />
            <FormActions>
              <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                Request Changes
              </Button>
              <Button onClick={handleCancelRegistration} disabled={formik.isSubmitting}>
                Cancel
              </Button>
            </FormActions>
          </>
        ) : (
          <EmptyStateWrapper>
            <p>No changes made</p>
          </EmptyStateWrapper>
        )}
      </form>
    </FormikProvider>
  )

  const isLoading = isSparePartsFetching || isSparePartsLoading

  return (
    <>
      <StyledModal
        title={<ModalTitle>Repair</ModalTitle>}
        open={isOpen}
        footer={false}
        onCancel={onClose}
        width={800}
        maskClosable={false}
      >
        <ModalBody>
          <AttributeRow>
            <AttributeName>Code: </AttributeName>
            <div>{miner.code}</div>
          </AttributeRow>
          <AttributeRow>
            <AttributeName>Site: </AttributeName>
            <div>{miner.site}</div>
          </AttributeRow>
          <Row gutter={16}>
            <Col>
              <AttributeRow>
                <AttributeName>Container: </AttributeName>
                <div>{miner.container ?? 'Maintenance'}</div>
              </AttributeRow>
            </Col>
            <Col>
              <AttributeRow>
                <AttributeName>POS: </AttributeName>
                <div>{miner.pos}</div>
              </AttributeRow>
            </Col>
          </Row>
          <AttributeRow>
            <AttributeName>SN: </AttributeName>
            <div>{miner.serialNum}</div>
          </AttributeRow>
          <AttributeRow>
            <AttributeName>MAC: </AttributeName>
            <div>{formatMacAddress(miner.macAddress)}</div>
          </AttributeRow>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <AppTable<AttachedPartRecord>
                $fullSize
                dataSource={spareParts as AttachedPartRecord[]}
                columns={getAttachedPartsListColumns({
                  isRegisterRepairMode,
                  onAttachSparePart: () => {
                    openAttachSparePartModal(undefined)
                  },
                  onRemoveSparePart: (record: AttachedPartRecord) =>
                    handleRemoveSparePart(record as SparePart),
                  onUndoRemoveSparePart: (record: AttachedPartRecord) =>
                    handleUndoRemoveSparePart(record as SparePart),
                })}
                pagination={false}
              />
              {isRegisterRepairMode ? (
                registerRepairControls
              ) : (
                <>
                  {allowRepair && (
                    <Button type="primary" onClick={handleRegisterRepair}>
                      Register Repair
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </ModalBody>
      </StyledModal>
      {attachSparePartModalOpen && (
        <AttachSparePartModal
          isOpen={attachSparePartModalOpen}
          onClose={closeAttachSparePartModal}
          spareParts={
            spareParts.map((part) => ({
              removed: part.removed,
              serialNum: part.serialNum,
              raw: { rack: part.raw.rack ?? '' },
            })) as Array<{
              removed?: boolean
              serialNum?: string
              raw: { rack: string }
              [key: string]: unknown
            }>
          }
          onSubmit={(part: UnknownRecord) =>
            handleSparePartAttachment(part as unknown as SparePartRaw)
          }
        />
      )}
    </>
  )
}

export default MinerInfoModal

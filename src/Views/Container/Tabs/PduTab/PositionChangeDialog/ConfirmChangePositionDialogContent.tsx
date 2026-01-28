import Checkbox from 'antd/es/checkbox'
import type { CheckboxProps } from 'antd/es/checkbox'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import { FormikProvider, useFormik } from 'formik'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import * as yup from 'yup'

import { MINER_LOCATIONS } from '../../../../../Components/Inventory/Miners/Miners.constants'
import { DuplicateErrorMsg } from '../AddReplaceMinerDialog/AddReplaceMinerDialog.styles'
import { StaticMinerIpAssigment } from '../StaticMinerIpAssigment'

import { ModalFooter } from './PositionChangeDialog.styles'
import { getPosHistory } from './PositionChangeDialog.utils'
import { RackIdSelectionDropdown } from './RackIdSelectionDropdown'

const validationSchema = yup.object({
  containerMinerRackId: yup.string().required('Rack ID is required'),
  forceSetIp: yup.boolean(),
  minerIp: yup.string().when('forceSetIp', {
    is: true,
    then: (schema) => schema.required('IP address is required when force set IP is enabled'),
    otherwise: (schema) => schema,
  }),
})

import { useGetListThingsQuery } from '@/app/services/api'
import { actionsSlice } from '@/app/slices/actionsSlice'
import { getDevicesIdList } from '@/app/utils/actionUtils'
import { getDeviceContainerPosText } from '@/app/utils/containerUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { notifyInfo } from '@/app/utils/NotificationService'
import { PrimaryButton } from '@/Components/ActionsSidebar/ActionCard/ActionCard.styles'
import { InputTitle } from '@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.styles'
import { ACTION_TYPES, BATCH_ACTION_TYPES } from '@/constants/actions'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'
import { useMinerDuplicateValidation } from '@/hooks/useMinerDuplicateValidation'
import { useStaticMinerIpAssignment } from '@/hooks/useStaticMinerIpAssignment'

const { setAddPendingSubmissionAction } = actionsSlice.actions

interface ConfirmChangePositionDialogContentProps {
  selectedSocketToReplace?: UnknownRecord
  selectedEditSocket?: UnknownRecord
  isContainerEmpty: boolean
  onSave: () => void
  onCancel: () => void
}

const ConfirmChangePositionDialogContent = ({
  selectedSocketToReplace,
  selectedEditSocket,
  isContainerEmpty,
  onSave,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCancel: _onCancel,
}: ConfirmChangePositionDialogContentProps) => {
  const dispatch = useDispatch()

  const { data, isLoading: isMinerSparePartsLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      'info.parentDeviceId': {
        $eq: (
          (selectedSocketToReplace as UnknownRecord | undefined)?.miner as UnknownRecord | undefined
        )?.id,
      },
    }),
    fields: JSON.stringify({
      id: 1,
      rack: 1,
    }),
  })
  const [spareParts, setSpareParts] = useState<UnknownRecord[]>([])

  useEffect(() => {
    const dataArray = data as UnknownRecord[] | undefined
    if (isMinerSparePartsLoading || _isEmpty(_head(dataArray))) {
      return
    }
    setSpareParts((_head(dataArray) as UnknownRecord[] | undefined) || [])
  }, [data, isMinerSparePartsLoading])

  const { isStaticIpAssignment, minerIp } = useStaticMinerIpAssignment(selectedEditSocket)
  const { checkDuplicate, duplicateError, isDuplicateCheckLoading, setDuplicateError } =
    useMinerDuplicateValidation()

  const formik = useFormik({
    initialValues: {
      containerMinerRackId:
        ((
          (selectedSocketToReplace as UnknownRecord | undefined)?.miner as UnknownRecord | undefined
        )?.rack as string | undefined) || '',
      forceSetIp: false,
      minerIp: minerIp || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onChangePosition(values)
    },
  })

  const isBackFromMaintenance =
    (
      (selectedSocketToReplace as UnknownRecord | undefined)?.containerInfo as
        | UnknownRecord
        | undefined
    )?.container === MAINTENANCE_CONTAINER

  const getNotificationText = () => {
    if (isBackFromMaintenance) {
      return `Bring miner back from maintenance to ${getDeviceContainerPosText(selectedEditSocket!)}`
    }
    return `Change Position from ${getDeviceContainerPosText(
      selectedSocketToReplace!,
    )} to ${getDeviceContainerPosText(selectedEditSocket!)}`
  }
  const getConfirmationText = () => {
    if (isBackFromMaintenance) {
      return `Are you sure to bring miner back from maintenance to ${getDeviceContainerPosText(
        selectedEditSocket!,
      )} ?`
    }
    const code =
      ((selectedSocketToReplace as UnknownRecord | undefined)?.miner as UnknownRecord | undefined)
        ?.code || ''
    const selectedSocketContainerInfo = (selectedSocketToReplace as UnknownRecord | undefined)
      ?.containerInfo as UnknownRecord | undefined
    const selectedSocketMinerInfo = (
      (selectedSocketToReplace as UnknownRecord | undefined)?.miner as UnknownRecord | undefined
    )?.info as UnknownRecord | undefined
    const initialInfo = getDeviceContainerPosText({
      containerInfo: selectedSocketContainerInfo!,
      pos: selectedSocketMinerInfo?.pos as string | undefined,
    })
    const destinationInfo = getDeviceContainerPosText(selectedEditSocket!)
    return `Are you sure to change position of miner ${code} from ${initialInfo} to ${destinationInfo} ?`
  }

  const onSetIpCheckboxChange: CheckboxProps['onChange'] = (e) => {
    setDuplicateError(false)
    formik.setFieldValue('forceSetIp', e.target.checked)
  }

  const onChangePosition = async (values: {
    containerMinerRackId: string
    forceSetIp: boolean
    minerIp: string
  }) => {
    if (values.minerIp && isStaticIpAssignment && values.forceSetIp) {
      const isDuplicate = await checkDuplicate(
        (selectedEditSocket as { miner?: { id?: string } }) || null,
        {
          address: values.minerIp,
        },
      )
      if (isDuplicate) return
    }

    const selectedSocketMiner = (selectedSocketToReplace as UnknownRecord | undefined)?.miner as
      | UnknownRecord
      | undefined
    const selectedEditSocketContainerInfo = (selectedEditSocket as UnknownRecord | undefined)
      ?.containerInfo as UnknownRecord | undefined

    const sparePartActions = isBackFromMaintenance
      ? _map(spareParts, (part) => {
          const action = {
            action: ACTION_TYPES.UPDATE_THING,
            minerId: part.id as string,
            params: [
              {
                id: part.id,
                rackId: part.rack,
                info: {
                  location: MINER_LOCATIONS.SITE_CONTAINER,
                },
              },
            ],
            tags: [] as string[],
          }

          action.tags = getDevicesIdList(action as UnknownRecord) || []

          return action
        })
      : []

    const minerActionParams = [
      {
        rackId: selectedSocketMiner?.rack,
        id: selectedSocketMiner?.id,
        code: selectedSocketMiner?.code,
        info: {
          container: selectedEditSocketContainerInfo?.container,
          pos: `${(selectedEditSocket as UnknownRecord | undefined)?.pdu}_${(selectedEditSocket as UnknownRecord | undefined)?.socket}`,
          subnet: selectedEditSocketContainerInfo?.subnet,
          posHistory: getPosHistory(selectedSocketToReplace!),
          ...(isBackFromMaintenance ? { location: MINER_LOCATIONS.SITE_CONTAINER } : {}),
        },
        opts: {
          forceSetIp: values.forceSetIp,
          address: isStaticIpAssignment && values.forceSetIp ? values.minerIp : undefined,
        },
      },
    ]

    const minerAction = {
      action: ACTION_TYPES.UPDATE_THING,
      params: minerActionParams,
      minerId: selectedSocketMiner?.id as string,
    }

    const batchedAction = {
      action: BATCH_ACTION_TYPES.MOVE_BACK_FROM_MAINTENANCE_TO_CONTAINER,
      batchActionUID: selectedSocketMiner?.id as string,
      batchActionsPayload: [minerAction, ...sparePartActions],
      metadata: {
        isBackFromMaintenance,
      },
    }

    dispatch(setAddPendingSubmissionAction(batchedAction))
    onSave()
    notifyInfo('Action added', getNotificationText())
  }

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <Row gutter={[0, 10]}>
          {getConfirmationText()}
          {isContainerEmpty &&
            !((selectedEditSocket as UnknownRecord | undefined)?.miner as UnknownRecord | undefined)
              ?.rack && (
              <Col span={24}>
                <InputTitle>Rack Id</InputTitle>
                <RackIdSelectionDropdown
                  value={formik.values.containerMinerRackId}
                  handleChange={(value) =>
                    formik.setFieldValue('containerMinerRackId', value as string | undefined)
                  }
                />
              </Col>
            )}
          <StaticMinerIpAssigment
            forceSetIp={formik.values.forceSetIp}
            isStaticIpAssignment={isStaticIpAssignment}
            minerIp={formik.values.minerIp}
            setMinerIp={(ip) => formik.setFieldValue('minerIp', ip)}
            isChangeInfo={false}
          />
          <Col span={24}>
            <Checkbox onChange={onSetIpCheckboxChange} checked={formik.values.forceSetIp}>
              Force set new IP
            </Checkbox>
          </Col>
          {duplicateError && (
            <DuplicateErrorMsg>IP address is already being used.</DuplicateErrorMsg>
          )}
          <ModalFooter>
            <PrimaryButton
              htmlType="submit"
              loading={isDuplicateCheckLoading || formik.isSubmitting}
            >
              {isBackFromMaintenance ? 'Back from maintenance' : 'Change position'}
            </PrimaryButton>
          </ModalFooter>
        </Row>
      </form>
    </FormikProvider>
  )
}

export default ConfirmChangePositionDialogContent

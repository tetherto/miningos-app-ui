import { flatten as _flatten, isEmpty as _isEmpty } from 'lodash'
import { useEffect, useState, FC } from 'react'

import { useGetListThingsQuery } from '../../../app/services/api'
import { getDevicesIdList, isBatchAction, isContainerAction } from '../../../app/utils/actionUtils'
import { getByTagsQuery, getContainerByContainerTagsQuery } from '../../../app/utils/queryUtils'
import { POLLING_20s } from '../../../constants/pollingIntervalConstants'
import { useSmartPolling } from '../../../hooks/useSmartPolling'

import { ActionsCollapse } from './ActionCard.styles'
import ActionCardBody from './ActionCardBody/ActionCardBody'
import ActionCardHeader from './ActionCardHeader/ActionCardHeader'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { DeviceData } from '@/app/utils/deviceUtils/types'
import type { CardActionCall } from '@/types/api'

const getListThingsQuery = (action: string, devicesIdList: string[]) =>
  isContainerAction(action)
    ? getContainerByContainerTagsQuery(devicesIdList)
    : getByTagsQuery(devicesIdList)

export interface CardAction {
  id: string
  action: string
  tags?: string[]
  targets?: Record<string, { calls: Array<CardActionCall> }>
  minerId?: string
  batchActionsPayload?: Array<UnknownRecord>
  batchActionUID?: string
  metadata?: {
    from?: { location?: string; status?: string }
    to?: { location?: string; status?: string }
  }
  cancelled?: boolean
  status?: string
  isLoading?: boolean
  votesPos?: number
  params?: unknown[][]
  deviceId?: string
  deviceIds?: string[]
  createdAt?: number
  [key: string]: unknown
}

interface ConfirmationAction {
  action: CardAction
  actionFn: () => void
}

interface ActionCardProps {
  cardAction: CardAction
  type?: string
  setIsOpen?: (isOpen: boolean) => void
  setConfirmationAction?: (action: ConfirmationAction) => void
  onActionCancel?: (id: string) => void
  areRejectApproveAvailable?: boolean
}

const ActionCard: FC<ActionCardProps> = ({
  cardAction,
  type,
  setIsOpen,
  setConfirmationAction,
  onActionCancel,
  areRejectApproveAvailable,
}) => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const [devicesIdList, setDevicesIdList] = useState<string[]>([])

  const { id, tags, targets, action, minerId } = cardAction
  const {
    data: itemsData,
    isLoading,
    isError,
  } = useGetListThingsQuery(
    {
      query: getListThingsQuery(action, devicesIdList),
      status: 1,
    },
    {
      pollingInterval: smartPolling20s,
      skip: _isEmpty(devicesIdList),
    },
  )
  const collapsible = _isEmpty(_flatten(itemsData as DeviceData[][])) ? 'disabled' : 'header'

  const enhancedCardAction = isBatchAction(cardAction.action)
    ? cardAction
    : {
        ...cardAction,
        tags: devicesIdList,
      }

  useEffect(() => {
    const devicesList = getDevicesIdList({ tags, minerId, targets })
    if (devicesList) {
      setDevicesIdList(devicesList)
    }
  }, [tags, targets, minerId])

  const getActionItems = () => [
    {
      key: id,
      label: (
        <ActionCardHeader
          cardAction={enhancedCardAction}
          type={type}
          setIsOpen={setIsOpen}
          onActionCancel={onActionCancel}
          setConfirmationAction={setConfirmationAction}
          areRejectApproveAvailable={areRejectApproveAvailable}
        />
      ),
      children: (
        <ActionCardBody
          devicesList={itemsData as DeviceData[][]}
          isLoading={isLoading}
          isError={isError}
          cardAction={enhancedCardAction}
        />
      ),
    },
  ]

  return (
    <ActionsCollapse
      collapsible={collapsible}
      expandIconPosition="end"
      size="small"
      items={getActionItems()}
    />
  )
}

export default ActionCard

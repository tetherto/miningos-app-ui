import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import _some from 'lodash/some'

import { getExistedActions } from '@/app/utils/actionUtils'
import { getContainerName } from '@/app/utils/containerUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { MINER_STATUSES } from '@/Components/Inventory/Miners/Miners.constants'
import { ACTION_TYPES } from '@/constants/actions'
import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'

const getData = (replace?: UnknownRecord, edit?: UnknownRecord) => {
  const replaceContainerInfo = replace?.containerInfo as UnknownRecord | undefined
  const editContainerInfo = edit?.containerInfo as UnknownRecord | undefined
  return {
    container:
      (replaceContainerInfo?.container as string) || (editContainerInfo?.container as string) || '',
    pdu: (replace?.pdu as string) || (edit?.pdu as string) || '',
    socket: (replace?.socket as string) || (edit?.socket as string) || '',
  }
}

interface GetTitleParams {
  selectedSocketToReplace?: UnknownRecord
  selectedEditSocket?: UnknownRecord
  currentDialogFlow?: string
  isDirectToMaintenanceMode?: boolean
}

export const getTitle = ({
  selectedSocketToReplace,
  selectedEditSocket,
  currentDialogFlow,
  isDirectToMaintenanceMode,
}: GetTitleParams): string => {
  if (isDirectToMaintenanceMode) {
    return 'Register miner directly in maintenance mode'
  }
  if (currentDialogFlow === POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO) {
    return 'Change Miner info'
  }

  if (!selectedEditSocket && !selectedSocketToReplace) return ''

  const { container, pdu, socket } = getData(selectedSocketToReplace, selectedEditSocket)

  return `Add miner to socket: ${getContainerName(container)} ${pdu}_${socket}`
}

/**
 * Check if there's an action for this mac or serial number,
 * don't add another one in this case
 */
interface IsActionExistsParams {
  pendingSubmissions: unknown[]
  macAddress?: string
  serialNumber?: string
}

export const isActionExists = ({
  pendingSubmissions,
  macAddress,
  serialNumber,
}: IsActionExistsParams): boolean => {
  if (_isEmpty(pendingSubmissions)) return false

  const existedActions = getExistedActions(
    ACTION_TYPES.REGISTER_THING,
    pendingSubmissions as unknown as [],
  )

  if (_isEmpty(existedActions)) return false

  return _some(existedActions, (action) => {
    const actionRecord = action as unknown as UnknownRecord | undefined
    const params = (actionRecord?.params as UnknownRecord[] | undefined)?.[0] as
      | UnknownRecord
      | undefined
    const paramsInfo = params?.info as UnknownRecord | undefined

    return (
      (paramsInfo?.macAddress && paramsInfo?.macAddress === macAddress) ||
      (paramsInfo?.serialNum && paramsInfo?.serialNum === serialNumber)
    )
  })
}

interface GetSiteParams {
  containerInfo?: UnknownRecord
  currentSite?: string
  isDirectToMaintenanceMode?: boolean
}

const getSite = ({
  containerInfo,
  currentSite,
  isDirectToMaintenanceMode,
}: GetSiteParams): string | null => {
  if (containerInfo) return (containerInfo?.site as string) || null
  if (isDirectToMaintenanceMode && currentSite) return currentSite
  return null
}

interface BuildAddReplaceMinerParamsInput {
  selectedEditSocket?: UnknownRecord
  serialNumber?: string
  macAddress?: string
  isDirectToMaintenanceMode?: boolean
  containerMinerRackId?: string
  username?: string
  password?: string
  forceSetIp?: boolean
  isChangeInfo?: boolean
  tags?: string[]
  currentSite?: string
  isStaticIpAssignment?: boolean
  minerIp?: string
  shortCode?: string
}

export const buildAddReplaceMinerParams = ({
  selectedEditSocket,
  serialNumber,
  macAddress,
  isDirectToMaintenanceMode,
  containerMinerRackId,
  username,
  password,
  forceSetIp,
  isChangeInfo,
  tags,
  currentSite,
  isStaticIpAssignment,
  minerIp,
  shortCode,
}: BuildAddReplaceMinerParamsInput): UnknownRecord[] => {
  const isEditSocketPresent = !!selectedEditSocket
  const containerInfo = selectedEditSocket?.containerInfo as UnknownRecord | undefined
  const posTag = selectedEditSocket
    ? `pos-${selectedEditSocket?.pdu as string}_${selectedEditSocket?.socket as string}`
    : null
  const containerTag = containerInfo ? `container-${containerInfo?.container as string}` : null
  const site = getSite({ containerInfo, currentSite, isDirectToMaintenanceMode })
  const siteTag = `site-${site}`

  const baseInfo: UnknownRecord = {
    serialNum: serialNumber,
    macAddress,
    container: isDirectToMaintenanceMode
      ? ACTION_TYPES.MAINTENANCE
      : (containerInfo?.container as string),
    subnet: containerInfo?.subnet as string,
  }

  if (isDirectToMaintenanceMode) {
    baseInfo.status = MINER_STATUSES.ON_HOLD
  }

  const credentials = username && password ? { username, password } : {}
  const address = isStaticIpAssignment && forceSetIp ? { address: minerIp } : {}
  const advancedOpts = forceSetIp && { forceSetIp }

  const updatedOpts = !_isEmpty({ ...credentials, ...advancedOpts, ...address })
    ? { opts: { ...credentials, ...advancedOpts, ...address } }
    : {}

  if (isChangeInfo) {
    return [
      {
        id: ((selectedEditSocket?.miner as UnknownRecord | undefined)?.id as string) || undefined,
        rackId: containerMinerRackId,
        ...(shortCode ? { code: shortCode } : {}),
        info: baseInfo,
        ...updatedOpts,
        tags: _compact([...(tags || [])]),
      },
    ]
  }
  return [
    {
      rackId: containerMinerRackId,
      info: {
        ...baseInfo,
        pos: isEditSocketPresent
          ? `${selectedEditSocket?.pdu as string}_${selectedEditSocket?.socket as string}`
          : '',
        site: site,
      },
      ...(shortCode ? { code: shortCode } : {}),
      ...updatedOpts,
      tags: _compact([...(tags || []), posTag, containerTag, siteTag]),
    },
  ]
}

export const isValidMacAddress = (mac?: string): boolean => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  return _isEmpty(mac) || macRegex.test(mac || '')
}

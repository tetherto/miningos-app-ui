import _head from 'lodash/head'
import _map from 'lodash/map'

import { getDevicesIdList } from '@/app/utils/actionUtils'
import { ACTION_TYPES, BATCH_ACTION_TYPES } from '@/constants/actions'

export interface Miner {
  id: string
  raw: {
    rack: string
    code?: string
    info?: {
      container?: string
      pos?: string
    }
  }
}

export interface SparePart {
  id: string
  raw?: {
    rack?: string
    info?: {
      parentDeviceId?: string | null
      parentDeviceType?: string | null
      parentDeviceCode?: string | null
      parentDeviceSN?: string | null
    }
  }
  rack?: string
}

export interface MappedSparePart {
  id: string
  raw?: SparePart['raw']
  rack?: string
}

export const mapSparePartsData = (sparePartsData: unknown): MappedSparePart[] => {
  const rawParts = _head(sparePartsData as unknown[]) ?? []
  return (rawParts as unknown[])
    .map((part: unknown) => {
      const sparePart = part as SparePart
      return {
        id: sparePart.id,
        raw: sparePart.raw,
        rack: sparePart.rack ?? sparePart.raw?.rack,
      } as MappedSparePart
    })
    .filter((part) => Boolean(part.id && (part.raw?.rack || part.rack)))
}

export const createMinerDeleteAction = (miner: Miner) => ({
  type: 'voting',
  action: ACTION_TYPES.FORGET_THINGS,
  params: [
    {
      rackId: miner.raw.rack,
      query: { id: miner.id },
    },
  ],
  container: miner.raw.info?.container,
  pos: miner.raw.info?.pos,
  minerId: miner.id,
})

export const createSparePartDeleteAction = (
  part: MappedSparePart,
): Record<string, unknown> | null => {
  const rackId = part.raw?.rack ?? part.rack
  if (!rackId || !part.id) {
    return null
  }

  const action: Record<string, unknown> = {
    type: 'voting',
    action: ACTION_TYPES.FORGET_THINGS,
    params: [
      {
        rackId,
        query: { id: part.id },
      },
    ],
    minerId: part.id,
  }

  action.tags = getDevicesIdList({
    minerId: action.minerId as string | undefined,
    targets: action.targets as Record<string, { calls: Array<{ id: string }> }> | undefined,
  })

  return action
}

export const createSparePartUnlinkAction = (
  part: MappedSparePart,
): Record<string, unknown> | null => {
  const rackId = part.raw?.rack ?? part.rack
  if (!rackId || !part.id) {
    return null
  }

  const action: Record<string, unknown> = {
    action: ACTION_TYPES.UPDATE_THING,
    minerId: part.id,
    params: [
      {
        id: part.id,
        rackId,
        info: {
          parentDeviceId: null,
          parentDeviceType: null,
          parentDeviceCode: null,
          parentDeviceSN: null,
        },
      },
    ],
  }

  action.tags = getDevicesIdList({
    minerId: action.minerId as string | undefined,
    targets: action.targets as Record<string, { calls: Array<{ id: string }> }> | undefined,
  })

  return action
}

export const createSparePartAction = (
  part: MappedSparePart,
  deleteSpareParts: boolean,
): Record<string, unknown> | null =>
  deleteSpareParts ? createSparePartDeleteAction(part) : createSparePartUnlinkAction(part)

export const createSparePartActions = (
  parts: MappedSparePart[],
  deleteSpareParts: boolean,
): Record<string, unknown>[] =>
  _map(parts, (part) => createSparePartAction(part, deleteSpareParts)).filter(
    (action): action is Record<string, unknown> => action !== null,
  )

export const createDeleteMinerBatchAction = (
  miner: Miner,
  spareParts: MappedSparePart[],
  deleteSpareParts: boolean,
) => ({
  action: BATCH_ACTION_TYPES.DELETE_MINER,
  batchActionUID: miner.id,
  batchActionsPayload: [
    ...createSparePartActions(spareParts, deleteSpareParts),
    createMinerDeleteAction(miner),
  ],
})

export type SubmitActionFn<T = unknown> = (params: {
  action: T
}) => Promise<{ error?: unknown; [key: string]: unknown }>

export const createActionExecutor =
  <T>(submitAction: SubmitActionFn<T>) =>
  async (params: { action: unknown }) => {
    const result = await submitAction({ action: params.action as T })
    return {
      ...result,
      error: result.error,
    }
  }

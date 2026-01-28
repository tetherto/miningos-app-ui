import notification from 'antd/es/notification'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _map from 'lodash/map'
import _orderBy from 'lodash/orderBy'
import _sortBy from 'lodash/sortBy'

import { isCabinet } from '@/app/utils/deviceUtils'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'

export type CommentDevice = Record<string, unknown> & {
  id?: string
  type?: string
  rack?: string
  powerMeters?: Array<{ id?: string; rack?: string }>
  info?: Record<string, unknown> & {
    container?: string
  }
}

export interface CommentIds {
  thingId: string | undefined
  rackId: string | undefined
}

/**
 * Extracts thingId and rackId for comment API calls.
 * For cabinet devices, uses the first power meter's id and rack.
 * For other devices, uses the device's own id and rack.
 */
export const getCommentIds = (device: CommentDevice | undefined): CommentIds => {
  if (!device) {
    return { thingId: undefined, rackId: undefined }
  }

  const deviceIsCabinet = isCabinet(device.type || '')

  if (deviceIsCabinet) {
    const firstPowerMeter = _head(device.powerMeters)
    return {
      thingId: firstPowerMeter?.id,
      rackId: firstPowerMeter?.rack,
    }
  }

  return {
    thingId: device.id,
    rackId: device.rack,
  }
}

export const getDevicesWithMaintenanceContainer = (devices: CommentDevice[]) =>
  _map(devices, (device) => {
    if (!device?.info?.container) {
      return {
        ...device,
        info: {
          ...(device?.info || {}),
          container: MAINTENANCE_CONTAINER,
        },
      }
    }

    return device
  })

export const sortDevicesByLatestComment = (devicesWithMaintenanceContainer: CommentDevice[]) =>
  devicesWithMaintenanceContainer?.length === 1
    ? devicesWithMaintenanceContainer
    : _sortBy(devicesWithMaintenanceContainer, (device) => {
        const comments = _get(device, 'comments', []) as CommentDevice[]
        const latestTs = _get(sortCommentsByRecent(comments), '[0].ts', 0) as number
        // Negate timestamp to sort descending (latest first)
        return -latestTs || 0
      })

export const sortCommentsByRecent = (comments: CommentDevice[]) =>
  comments?.length === 1 ? comments : _orderBy(comments, ['ts'], ['desc'])

/**
 * Builds the base payload for editing/deleting a comment.
 * Prioritizes thingId/rackId from the comment itself (for cabinet comments),
 * falls back to deriving from device.
 */
export const getCommentPayloadBase = (
  device: CommentDevice | undefined,
  commentToEdit: CommentDevice | null,
  deviceIsCabinet: boolean,
) => {
  const id = _get(commentToEdit, 'id') as string
  const ts = _get(commentToEdit, 'ts') as number

  // For cabinet comments, use thingId and rackId stored on the comment itself
  // (these are enriched when aggregating comments from multiple devices)
  const commentThingId = _get(commentToEdit, 'thingId') as string | undefined
  const commentRackId = _get(commentToEdit, 'rackId') as string | undefined

  // Fall back to deriving from device if not available on comment
  const deviceIds = getCommentIds(deviceIsCabinet ? device : device)
  const thingId = commentThingId || deviceIds.thingId
  const rackId = commentRackId || deviceIds.rackId

  return { id, ts, thingId, rackId }
}

interface HandleCommentMutationProps {
  refetch: VoidFunction
  errorMessage: string
  successMessage: string
  onFinally?: VoidFunction
}

type MutationFunction = (payload: Record<string, unknown>) => {
  unwrap: () => Promise<unknown>
}

export const mutateCommentAsync = async (
  mutationFn: MutationFunction,
  payload: Record<string, unknown>,
  { refetch, successMessage, errorMessage, onFinally }: HandleCommentMutationProps,
): Promise<void> => {
  try {
    const data = await mutationFn(payload).unwrap()

    if (_get(_head(data as CommentDevice[]), 'success') === 1) {
      refetch()
      notification.success({ message: successMessage })
      onFinally?.()
    } else {
      notification.error({ message: errorMessage })
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'

    notification.error({
      message: errorMessage,
      description: errorMsg,
    })
  }
}

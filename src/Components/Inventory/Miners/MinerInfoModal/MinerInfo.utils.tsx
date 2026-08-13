import Button from 'antd/es/button'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _gt from 'lodash/gt'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _size from 'lodash/size'

import { UnknownRecord } from '../../../../app/utils/deviceUtils/types'
import { formatMacAddress } from '../../../../app/utils/format'
import { NoWrapText } from '../../InventoryTable/InventoryTable.styles'
import { SparePartTypes } from '../../SpareParts/SpareParts.constants'

import { CommentsPopover } from '@/Components/CommentsPopover/CommentsPopover'
import { SecondaryButton } from '@/styles/shared-styles'

export interface AttachedPartRecord {
  part?: string
  serialNum?: string
  macAddress?: string | null
  raw?: UnknownRecord
  removed?: boolean
  existing?: boolean
  type?: string
  id?: string
  [key: string]: unknown
}

interface GetAttachedPartsListColumnsProps {
  onAttachSparePart: () => void
  isRegisterRepairMode?: boolean
  onRemoveSparePart: (record: AttachedPartRecord) => void
  onUndoRemoveSparePart: (record: AttachedPartRecord) => void
}

export const getAttachedPartsListColumns = ({
  onAttachSparePart,
  isRegisterRepairMode,
  onRemoveSparePart,
  onUndoRemoveSparePart,
}: GetAttachedPartsListColumnsProps) => [
  {
    title: 'Type',
    dataIndex: 'part',
    key: 'part',
  },
  {
    title: () => <NoWrapText>SN</NoWrapText>,
    dataIndex: 'serialNum',
    key: 'serialNum',
  },
  {
    title: 'MAC',
    dataIndex: 'macAddress',
    key: 'macAddress',
    render: (text: string) => formatMacAddress(text),
  },
  {
    title: 'Comments',
    key: 'commentActions',
    render: (_text: unknown, record: AttachedPartRecord) => <CommentsPopover device={record.raw} />,
  },
  ...(isRegisterRepairMode
    ? [
        {
          title: <Button onClick={onAttachSparePart}>Add</Button>,
          dataIndex: 'actions',
          key: 'actions',
          render: (_text: unknown, record: AttachedPartRecord) => {
            if (record.removed) {
              return (
                <SecondaryButton onClick={() => onUndoRemoveSparePart(record)}>
                  Removed
                </SecondaryButton>
              )
            }

            return <Button onClick={() => onRemoveSparePart(record)}>Remove</Button>
          },
        },
      ]
    : []),
]

export const getChangedParts = (spareParts: AttachedPartRecord[]) =>
  _filter(spareParts, (part: AttachedPartRecord) => {
    const isPartRemoved = part.existing && part.removed
    const isPartAdded = !part.existing
    return isPartAdded || isPartRemoved
  })

export const getMinerMACUpdates = (
  changedParts: AttachedPartRecord[],
): { isMACUpdated: boolean; newMAC?: string | null } => {
  const controllerChanges = _filter(
    changedParts,
    (part: AttachedPartRecord) =>
      part.raw && _includes((part.raw as { type?: string }).type, SparePartTypes.CONTROLLER),
  )
  if (!controllerChanges.length) return { isMACUpdated: false }

  if (controllerChanges.length > 1) {
    const newController = _find(
      controllerChanges,
      (part: AttachedPartRecord) => part.macAddress,
    ) as AttachedPartRecord | undefined

    if (!newController || !newController.macAddress) return { isMACUpdated: false }
    return { isMACUpdated: true, newMAC: newController.macAddress }
  }
  const firstControllerChange =
    _isArray(controllerChanges) &&
    _gt(_size(controllerChanges), 0) &&
    _isObject(controllerChanges[0]) &&
    controllerChanges[0] !== null
      ? (controllerChanges[0] as AttachedPartRecord)
      : undefined
  if (
    firstControllerChange &&
    'removed' in firstControllerChange &&
    firstControllerChange.removed
  ) {
    return { isMACUpdated: true, newMAC: null }
  }

  return {
    isMACUpdated: true,
    newMAC:
      firstControllerChange && 'macAddress' in firstControllerChange
        ? (firstControllerChange.macAddress as string | null)
        : null,
  }
}

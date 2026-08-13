import _filter from 'lodash/filter'
import _fromPairs from 'lodash/fromPairs'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import { useEffect, useState } from 'react'

import { useGetListThingsQuery } from '../../../app/services/api'
import { getRackNameFromId, isMiner } from '../../../app/utils/deviceUtils'
import { MINER_TYPE_NAME_MAP } from '../../../constants/deviceConstants'
import { SparePartNames } from '../SpareParts/SpareParts.constants'

import { sparePartChangesColumns } from './Repairs.constants'

import AppTable from '@/Components/AppTable/AppTable'
import { Spinner } from '@/Components/Spinner/Spinner'

interface Action {
  params?: Array<{
    comment?: string
    id?: string
    info?: {
      parentDeviceId?: string | null
    }
  }>
  [key: string]: unknown
}

interface Device {
  id?: string
  rack?: string
  info?: {
    serialNum?: string
    macAddress?: string
  }
}

interface MappedItem {
  type: string
  serialNum?: string
  macAddress?: string
  removed: boolean
  [key: string]: unknown
}

interface RepairLogChangesSubRowProps {
  batchAction: Action
}

const RepairLogChangesSubRow = ({ batchAction }: RepairLogChangesSubRowProps) => {
  const [mappedItems, setMappedItems] = useState<MappedItem[]>([])

  const repairActions = _filter(
    batchAction.params,
    (action) =>
      _isNil(_get(action, ['params', '0', 'comment'])) &&
      !isMiner(getRackNameFromId(_get(action, ['params', '0', 'rackId']))),
  )

  const partRemovalMapping = _fromPairs(
    _map(repairActions, (action) => [
      _get(action, ['params', '0', 'id']),
      _isNil(_get(action, ['params', '0', 'info', 'parentDeviceId'])),
    ]),
  )

  const { data, isLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      id: {
        $in: _map(repairActions, (action: unknown) => _get(action, ['params', '0', 'id'])),
      },
    }),
    fields: JSON.stringify({
      id: 1,
      'info.serialNum': 1,
      'info.macAddress': 1,
      rack: 1,
    }),
  })

  useEffect(() => {
    const dataArray = Array.isArray(data) ? data : []
    if (!isLoading && _head(dataArray)?.length) {
      const mappedItems = _map(_head(dataArray), (device: Device) => {
        const rackName = getRackNameFromId(device.rack ?? '')
        return {
          type:
            (MINER_TYPE_NAME_MAP as Record<string, string>)[rackName] ??
            (SparePartNames as Record<string, string>)[rackName] ??
            'Unknown',
          serialNum: device.info?.serialNum,
          macAddress: device.info?.macAddress,
          removed: partRemovalMapping[device.id as string] as boolean,
        }
      })
      setMappedItems(mappedItems)
    }
  }, [partRemovalMapping, data, isLoading])

  if (isLoading) {
    return <Spinner />
  }

  return (
    <AppTable
      dataSource={mappedItems as readonly import('@/app/utils/deviceUtils/types').UnknownRecord[]}
      columns={sparePartChangesColumns}
      pagination={false}
    />
  )
}

export default RepairLogChangesSubRow

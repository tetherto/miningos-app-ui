import Select from 'antd/es/select'
import _filter from 'lodash/filter'
import _flatten from 'lodash/flatten'
import _map from 'lodash/map'
import _startsWith from 'lodash/startsWith'

import { useGetListRacksQuery } from '@/app/services/api'
import { getRackNameFromId } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { MINER_TYPE_NAME_MAP } from '@/constants/deviceConstants'

export interface RackIdSelectionDropdownProps {
  value?: string | null
  handleChange: (value: unknown) => void
  placeholder?: string | null
  status?: 'error' | 'warning'
}

export const RackIdSelectionDropdown = ({
  value = '',
  handleChange,
  placeholder = null,
  status,
}: RackIdSelectionDropdownProps) => {
  const { data, isLoading } = useGetListRacksQuery({
    type: 'miner',
  })

  const filteredData = _filter(
    _flatten(data as UnknownRecord[] | undefined),
    (rack) => !_startsWith((rack as UnknownRecord)?.type as string, 'minerpool-'),
  )

  const selectOptions = _map(filteredData, (rack) => {
    const rackRecord = rack as UnknownRecord
    const rackId = rackRecord?.id as string
    const rackName = getRackNameFromId(rackId)
    return {
      value: rackId,
      label: (MINER_TYPE_NAME_MAP as Record<string, string>)[rackName] ?? rackName,
    }
  })

  return (
    <Select
      placeholder={placeholder}
      value={value}
      style={{ width: '100%' }}
      onChange={handleChange}
      options={selectOptions}
      loading={isLoading}
      status={status}
    />
  )
}

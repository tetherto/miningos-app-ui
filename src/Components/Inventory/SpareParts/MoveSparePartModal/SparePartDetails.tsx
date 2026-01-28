import _get from 'lodash/get'
import _map from 'lodash/map'
import _entries from 'lodash/toPairs'

import { AttributeName, AttributeRow, SparePartDetailsPanel } from './MoveSparePartModal.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface SparePartDetailsProps {
  sparePart?: UnknownRecord
}

const SparePartDetails = ({ sparePart }: SparePartDetailsProps) => {
  const attributesToShow = {
    Code: 'code',
    Model: 'type',
    Site: 'site',
    'Part SN': 'serialNum',
    MAC: 'macAddress',
  }

  return (
    <SparePartDetailsPanel>
      {_map(_entries(attributesToShow), ([attribute, accessor]) => {
        const value = _get(sparePart, accessor)
        return (
          <AttributeRow key={attribute}>
            <AttributeName>{attribute}: </AttributeName>
            <div>{value !== undefined && value !== null ? String(value) : ''}</div>
          </AttributeRow>
        )
      })}
    </SparePartDetailsPanel>
  )
}

export default SparePartDetails

import _get from 'lodash/get'
import _map from 'lodash/map'
import _entries from 'lodash/toPairs'

import {
  AttributeName,
  AttributeRow,
  AttributeValue,
  MinerDetailsPanel,
} from './MoveMinerModal.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface MinerDetailsProps {
  miner?: UnknownRecord
}

export const MinerDetails = ({ miner }: MinerDetailsProps) => {
  const attributesToShow = {
    'Short Code': 'code',
    Site: 'site',
    Container: 'container',
    SN: 'serialNum',
    MAC: 'macAddress',
  }

  const attributeDefaults: Record<string, string> = {
    Container: 'Maintenance',
  }

  return (
    <MinerDetailsPanel>
      {_map(_entries(attributesToShow), ([attribute, accessor]) => (
        <AttributeRow key={attribute}>
          <AttributeName>{attribute}: </AttributeName>
          <AttributeValue>
            {String(_get(miner, accessor) ?? attributeDefaults[attribute] ?? '-')}
          </AttributeValue>
        </AttributeRow>
      ))}
    </MinerDetailsPanel>
  )
}

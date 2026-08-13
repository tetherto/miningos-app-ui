import _get from 'lodash/get'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'

import {
  MinerDetailsPanel,
  AttributeRow,
  AttributeName,
  AttributeValue,
} from './MovementDetailsModal.styles'

import { getMinerShortCode } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface DeviceDetailsProps {
  device?: UnknownRecord
}

const DeviceDetails = ({ device }: DeviceDetailsProps) => {
  if (!device) {
    return null
  }

  // Use subType for spare parts model, fall back to type for other devices
  const modelValue = _get(device, 'info.subType') ?? _get(device, 'type') ?? '-'

  const attributesToShow = {
    Site: 'info.site',
    Container: 'info.container',
    SN: 'info.serialNum',
    MAC: 'info.macAddress',
  }

  return (
    <MinerDetailsPanel>
      <AttributeRow>
        <AttributeName>Code: </AttributeName>
        <AttributeValue>
          {getMinerShortCode(device.code as string, device.tags as string[])}
        </AttributeValue>
      </AttributeRow>
      <AttributeRow>
        <AttributeName>Model: </AttributeName>
        <AttributeValue>{String(modelValue)}</AttributeValue>
      </AttributeRow>
      {_map(_toPairs(attributesToShow), ([attribute, accessor]) => (
        <AttributeRow key={attribute}>
          <AttributeName>{attribute}: </AttributeName>
          <AttributeValue>{String(_get(device, accessor) ?? '-')}</AttributeValue>
        </AttributeRow>
      ))}
    </MinerDetailsPanel>
  )
}

export default DeviceDetails

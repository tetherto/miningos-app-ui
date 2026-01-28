import _startCase from 'lodash/startCase'

import { getMajorLocation, getMinorLocation } from '../../../app/utils/inventoryUtils'

interface Shipment {
  source?: string
  destination?: string
}

export const getShipmentItinerary = (shipment: Shipment) => {
  let result = ''

  if (shipment.source) {
    result += `${_startCase(getMajorLocation(shipment.source))} ${_startCase(getMinorLocation(shipment.source))}`
  } else {
    result += 'Unknown'
  }

  result += '→'

  if (shipment.destination) {
    result += `${_startCase(getMajorLocation(shipment.destination))} ${_startCase(getMinorLocation(shipment.destination))}`
  } else {
    result += 'Unknown'
  }

  return result
}

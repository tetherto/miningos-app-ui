import _head from 'lodash/head'
import _isNaN from 'lodash/isNaN'
import _last from 'lodash/last'
import _some from 'lodash/some'
import _split from 'lodash/split'
import { useEffect, useState } from 'react'

import { useGetFeatureConfigQuery } from '@/app/services/api'

interface SelectedEditSocket {
  containerInfo?: {
    container?: string
  }
  socket?: string
  pdu?: string | number
}

export const useStaticMinerIpAssignment = (selectedEditSocket?: SelectedEditSocket) => {
  const { data: featureConfig } = useGetFeatureConfigQuery(undefined, { skip: false })
  const isStaticIpAssignment = (featureConfig as { isStaticIpAssignment?: boolean })
    ?.isStaticIpAssignment
  const [minerIp, setMinerIp] = useState('')

  useEffect(() => {
    if (!isStaticIpAssignment) return
    const containerNumber = _last(_split(selectedEditSocket?.containerInfo?.container, '-'))
    const socketPos = _split(selectedEditSocket?.socket, '_')
    const shelve = _head(socketPos)
    const pos = _last(socketPos)

    if (_some([containerNumber, selectedEditSocket?.pdu, shelve, pos], _isNaN)) {
      setMinerIp('')
      return
    }
    const ip = `10.${containerNumber}.${selectedEditSocket?.pdu}.${shelve}${pos}`
    setMinerIp(ip)
  }, [selectedEditSocket, isStaticIpAssignment])

  return { minerIp, setMinerIp, isStaticIpAssignment }
}

import Col from 'antd/es/col'
import Row from 'antd/es/row'
import {
  map as _map,
  head as _head,
  keys as _keys,
  find as _find,
  forEach as _forEach,
  isNumber as _isNumber,
} from 'lodash'
import { FC, type ReactNode } from 'react'

import { useGetListThingsQuery } from '../../../../app/services/api'
import { getConnectedMinerForSocket, getPduData } from '../../../../app/utils/containerUtils'
import { getByTagsQuery } from '../../../../app/utils/queryUtils'
import { ACTION_TYPES } from '../../../../constants/actions'
import { POLLING_20s } from '../../../../constants/pollingIntervalConstants'
import { useSmartPolling } from '../../../../hooks/useSmartPolling'
import { UnitRow } from '../../../../Views/Container/Tabs/PduTab/PduTab.styles'
import { Socket } from '../../../Container/Socket/Socket'
import SelectedContainerCard from '../../../Explorer/DetailsView/SelectedContainerCard/SelectedContainerCard'
import type { CardAction } from '../ActionCard'

import type { ContainerData, Device, SocketInfo } from '@/types/api'

// SocketParam represents a single socket action parameter: [pduIndex, socketIndex, enabled]
type SocketParam = [string | number, string | number, boolean | string]

// Type matching what getPduData expects (from containerPdu.ts ContainerData['last'])
// This represents the structure of container.last with PDU data
type ContainerLastWithPduData =
  | {
      snap?: {
        stats?: {
          container_specific?: {
            pdu_data?: Array<{
              pdu: string
              sockets: Array<{ socket: string; enabled: boolean; cooling?: boolean }>
              power_w?: number | string
              current_a?: number | string
              offline?: boolean
            }>
          }
        }
      }
    }
  | undefined

interface ContainerActionBodyProps {
  container?: ContainerData
  cardAction?: CardAction
  children?: ReactNode
}

const ContainerActionBody: FC<ContainerActionBodyProps> = ({ container, cardAction, children }) => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const { last } = container || {}
  const { data: containerMinersResponse } = useGetListThingsQuery(
    {
      query: getByTagsQuery([`container-${container?.info?.container}`]),
      status: 1,
    },
    {
      pollingInterval: smartPolling20s,
    },
  ) as { data: Device[] | undefined }

  if (cardAction?.action !== ACTION_TYPES.SWITCH_SOCKET) {
    return (
      <SelectedContainerCard data={container} cardAction={cardAction}>
        {children}
      </SelectedContainerCard>
    )
  }

  const getPduByIndex = (pduIndex: string | number) => {
    // Type last to match what getPduData expects
    // Cast through unknown since ContainerData['last'] has index signatures that conflict with the stricter type
    const containerLast = last as unknown as ContainerLastWithPduData
    const pduData = getPduData(containerLast)
    return _find(
      pduData as Array<{ pdu?: string | number; [key: string]: unknown }>,
      (pdu) => String(pdu?.pdu) === String(pduIndex),
    )
  }

  interface PduRow {
    pdu?: string | number
    sockets?: Array<{ socket?: string | number; [key: string]: unknown }>
    [key: string]: unknown
  }

  const getSocketInfo = (pduIndex: string | number, socketIndex: string | number): SocketInfo => {
    const devices = containerMinersResponse as Device[] | undefined
    const miner = getConnectedMinerForSocket(devices || [], String(pduIndex), String(socketIndex))
    const row = getPduByIndex(pduIndex) as PduRow | undefined
    if (!row || !row?.sockets) {
      return {
        pduIndex,
        socketIndex,
        miner: miner ?? undefined,
      } as SocketInfo
    }
    const socket = _find(
      row.sockets,
      (s: unknown) => String((s as { socket?: string | number })?.socket) === String(socketIndex),
    )
    return {
      ...(socket as SocketInfo),
      pduIndex,
      socketIndex,
      miner: miner ?? undefined,
    } as SocketInfo
  }

  const segregateSocketsByPduIndex = (): Record<string, SocketParam[]> => {
    const segregatedArrays: Record<string, SocketParam[]> = {}

    if (cardAction?.action === ACTION_TYPES.SWITCH_SOCKET && cardAction.params) {
      // params is SocketParam[][] for SWITCH_SOCKET actions
      // _head gets the first array of SocketParam[]
      const firstParamsArray = _head(cardAction.params as SocketParam[][])

      if (firstParamsArray) {
        _forEach(firstParamsArray, (param: SocketParam) => {
          const pduIndex = String(param[0])
          if (!segregatedArrays[pduIndex]) {
            segregatedArrays[pduIndex] = []
          }
          segregatedArrays[pduIndex].push(param)
        })
      }
    }

    return segregatedArrays
  }

  const segregatedSockets = segregateSocketsByPduIndex()

  return (
    <>
      <SelectedContainerCard data={container} cardAction={cardAction}>
        <Row>
          {_map(_keys(segregatedSockets), (pduIndex: string) => (
            <UnitRow key={`row-${pduIndex}-`}>
              <p>P-{pduIndex}</p>
              <Row>
                {_map(segregatedSockets[pduIndex], (param: SocketParam) => {
                  const socketInfo = getSocketInfo(String(param[0]), String(param[1]))
                  return (
                    <Col key={`col-${param[0]}-${param[1]}`}>
                      <Socket
                        current_a={socketInfo.current_a}
                        enabled={socketInfo.enabled}
                        miner={
                          (socketInfo.miner as { id?: string; [key: string]: unknown } | null) ||
                          null
                        }
                        power_w={socketInfo.power_w}
                        socket={
                          _isNumber(socketInfo.socketIndex) ? socketInfo.socketIndex : undefined
                        }
                      />
                    </Col>
                  )
                })}
              </Row>
            </UnitRow>
          ))}
        </Row>
      </SelectedContainerCard>
    </>
  )
}

export default ContainerActionBody

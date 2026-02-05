import Col from 'antd/es/col'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _values from 'lodash/values'
import pluralize from 'pluralize'
import { useState } from 'react'
import { FC } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'

import {
  selectSelectedContainers,
  selectSelectedSockets,
} from '../../../../app/slices/devicesSlice'
import {
  getNumberSelected,
  isContainerControlNotsupported,
  getContainerName,
} from '../../../../app/utils/containerUtils'
import { appendContainerToTag } from '../../../../app/utils/deviceUtils'
import { SecondaryButton } from '../../../../styles/shared-styles'
import AddReplaceMinerDialog from '../../../../Views/Container/Tabs/PduTab/AddReplaceMinerDialog/AddReplaceMinerDialog'
import LabeledCard from '../../../Card/LabeledCard'
import { Socket } from '../../../Container/Socket/Socket'
import { WarningDeviceCardColText } from '../../List/ListView.styles'

import {
  SocketListWrapper,
  ContainerSectionRowTitle,
  ContainerUnitRow,
  SectionRowTitle,
  SelectedSocketsListStyledRow,
} from './SelectedSocketsList.styles'

import { ROUTE } from '@/constants/routes'
import type { SocketData } from '@/types/redux'

interface SelectedContainerSocketsProps {
  selectedContainerSockets?: SocketData[]
  selectedContainer?: string
  minersType?: string
}

const SelectedContainerSockets: FC<SelectedContainerSocketsProps> = ({
  selectedContainerSockets = [],
  selectedContainer,
  minersType,
}) => {
  const [isAddMinerDialogOpen, setIsAddMinerDialogOpen] = useState(false)
  const selectedContainers = useSelector(selectSelectedContainers)

  const getSelectedContainerInfo = () =>
    _find(
      _values(
        selectedContainers as Record<
          string,
          { info?: { container?: string; [key: string]: unknown } }
        >,
      ),
      ['info.container', selectedContainer],
    )?.info

  const isSingleEmptySocket =
    _size(selectedContainerSockets) === 1 && !_head(selectedContainerSockets)?.miner
  const segregateSocketsByPduIndex = (): Record<string | number, SocketData[]> => {
    const segregatedArrays: Record<string | number, SocketData[]> = {}
    _forEach(selectedContainerSockets, (socket: SocketData) => {
      const pduIndex = socket?.pduIndex
      if (pduIndex !== undefined) {
        if (!segregatedArrays[pduIndex]) {
          segregatedArrays[pduIndex] = []
        }
        segregatedArrays[pduIndex]?.push(socket)
      }
    })
    return segregatedArrays
  }

  const segregatedSockets = segregateSocketsByPduIndex()

  const getIsSocketEnabled = (socket: SocketData | undefined): boolean =>
    isContainerControlNotsupported(selectedContainer || '') || !!socket?.miner

  const onClose = () => {
    setIsAddMinerDialogOpen(false)
  }

  const getEmptySocket = () => {
    const socket = _head(selectedContainerSockets)
    return {
      containerInfo: getSelectedContainerInfo(),
      pdu: socket?.pduIndex,
      socket: socket?.socketIndex,
    }
  }

  if (!selectedContainer) {
    return null
  }

  return (
    <Col span={24}>
      <ContainerUnitRow key={`row-${selectedContainer}`}>
        <Link
          to={`${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${appendContainerToTag(selectedContainer)}/home`}
        >
          <ContainerSectionRowTitle>{getContainerName(selectedContainer)}</ContainerSectionRowTitle>
        </Link>
        {isContainerControlNotsupported(selectedContainer) && (
          <WarningDeviceCardColText>Container controls not supported</WarningDeviceCardColText>
        )}
        <div>
          {_map(_keys(segregatedSockets), (pduIndex: string) => (
            <div key={pduIndex}>
              {!_isNil(pduIndex) ? <SectionRowTitle>P-{pduIndex}</SectionRowTitle> : null}
              <SocketListWrapper style={{ columnGap: '5px' }}>
                {_map(segregatedSockets[pduIndex], (selectedSocket: SocketData, index: number) => (
                  <Col key={`${pduIndex}-${index}`}>
                    <Socket
                      isContainerControlSupported={
                        !isContainerControlNotsupported(selectedContainer || '')
                      }
                      current_a={undefined}
                      enabled={getIsSocketEnabled(selectedSocket)}
                      miner={
                        selectedSocket?.miner as { id?: string; [key: string]: unknown } | undefined
                      }
                      power_w={undefined}
                      socket={
                        _isNumber(selectedSocket?.socketIndex) ? selectedSocket.socketIndex : null
                      }
                      cooling={undefined}
                    />
                  </Col>
                ))}
              </SocketListWrapper>
            </div>
          ))}
        </div>
        <SecondaryButton
          disabled={!isSingleEmptySocket}
          onClick={() => setIsAddMinerDialogOpen(true)}
        >
          Register miner
        </SecondaryButton>
      </ContainerUnitRow>
      {isAddMinerDialogOpen && (
        <AddReplaceMinerDialog
          open={true}
          onClose={onClose}
          selectedEditSocket={getEmptySocket()}
          selectedSocketToReplace={undefined}
          isContainerEmpty={false}
          currentDialogFlow={undefined}
          minersType={minersType}
        />
      )}
    </Col>
  )
}

interface SelectedSocketsListProps {
  minersType?: string
}

const SelectedSocketsList: FC<SelectedSocketsListProps> = ({ minersType }) => {
  const selectedSockets = useSelector(selectSelectedSockets)
  const getLabelText = (): string => {
    const { nSockets, nContainers } = getNumberSelected(
      selectedSockets as unknown as Record<
        string,
        { sockets: Array<{ socket: string; enabled: boolean }> }
      >,
    )
    return `Selected ${nSockets} ${pluralize('Socket', nSockets)} from ${nContainers} ${pluralize('Container', nContainers)}`
  }

  return (
    <>
      {!_isEmpty(selectedSockets) && (
        <LabeledCard label={getLabelText()} noMargin>
          <SelectedSocketsListStyledRow>
            {_map(_keys(selectedSockets), (selectedContainerSocket: string, index: number) => {
              const containerSockets = (
                selectedSockets as Record<string, { sockets?: SocketData[] }>
              )[selectedContainerSocket]
              return (
                <SelectedContainerSockets
                  key={index}
                  selectedContainerSockets={containerSockets?.sockets}
                  selectedContainer={selectedContainerSocket}
                  minersType={minersType}
                />
              )
            })}
          </SelectedSocketsListStyledRow>
        </LabeledCard>
      )}
    </>
  )
}

export default SelectedSocketsList

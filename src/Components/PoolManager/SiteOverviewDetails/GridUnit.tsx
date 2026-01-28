import { QuestionCircleOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Tooltip from 'antd/es/tooltip'
import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import type React from 'react'
import InfiniteViewer from 'react-infinite-viewer'

import { SITE_OVERVIEW_STATUS_COLORS, SITE_OVERVIEW_STATUSES } from '../PoolManager.constants'

import {
  CursorNotAllowedDiv,
  GridUnitControls,
  GridUnitControlsSection,
  GridUnitControlsTitle,
  RowWrapper,
  SocketContainerDiv,
  SocketsList,
  UnitRow,
  UnitRowLabel,
} from './GridUnit.styles'
import { MinerBox, MinerId } from './SiteOverviewDetailsContainer.styles'

import { isAntspaceHydro, isMicroBT } from '@/app/utils/containerUtils'
import { getControlSectionsTooltips, type ControlTooltip } from '@/app/utils/keyboardShortcutUtils'
import { MinerStatuses } from '@/app/utils/statusUtils'
import useDeviceResolution from '@/hooks/useDeviceResolution'
import { useInfiniteViewer } from '@/hooks/useInfiniteViewer'
import { useKeyDown } from '@/hooks/useKeyDown'
import usePlatform from '@/hooks/usePlatform'

interface Socket {
  socket: string
}

export interface Pdu {
  pdu: string
  sockets: Socket[]
}

export interface MinerHashrate {
  value?: string | number
  unit?: string
  realValue?: number
}

export interface MinerData {
  error?: string
  hashrate: MinerHashrate
  id?: string
  snap?: {
    config?: {
      power_mode: string
    }
    stats?: {
      status: string
    }
  }
  [key: string]: unknown
}

interface ContainerInfo {
  container?: string
  type?: string
  rack?: string
  [key: string]: unknown
}

interface ConnectedMiner {
  rack?: string
  [key: string]: unknown
}

interface GridUnitProps {
  containerInfo: ContainerInfo
  connectedMiners?: ConnectedMiner[]
  isHeatmapMode?: boolean
  type?: string
  onSocketClick?: (
    containerInfo: ContainerInfo,
    pduIndex: number | string,
    socketIndex: number | string,
    miner?: MinerData,
  ) => void
  disableMinerSelect?: boolean
  selectedItems: Set<string>
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>
  sectionKey: string
  mobileSelectionEnabled?: boolean
  segregatedPduSections: Record<string, Pdu[]>
  minersHashmap: Record<string, MinerData>
  getSelectableName: (pdu: string, socket: string) => string
}

export const GridUnit = ({
  containerInfo,
  connectedMiners = [],
  isHeatmapMode,
  type,
  onSocketClick = _noop,
  disableMinerSelect,
  selectedItems,
  setSelectedItems,
  sectionKey,
  mobileSelectionEnabled,
  segregatedPduSections,
  minersHashmap,
  getSelectableName,
}: GridUnitProps) => {
  const isAltDown = useKeyDown('Alt')
  const { isTablet } = useDeviceResolution()
  const platform = usePlatform()

  const {
    viewportBoundingBox,
    showBackToContent,
    showInfiniteViewerControls,
    minZoomLevel,
    registerInfiniteViewer,
    resetInfiniteViewer,
    handleBackToContent,
    handleZoomIn,
    handleZoomOut,
    checkShowBackToContent,
  } = useInfiniteViewer()

  const toolTips = getControlSectionsTooltips(platform)

  const handleUnitRowSelect = (pdu: Pdu, isDeselectKeyDown: boolean) => {
    setSelectedItems((existingItems: Set<string>) => {
      const selectedSet = new Set([...existingItems])
      _forEach(pdu.sockets, (socket: Socket) => {
        const name = getSelectableName(pdu.pdu, socket.socket)
        if (isDeselectKeyDown) {
          selectedSet.delete(name)
        } else {
          selectedSet.add(name)
        }
      })
      return selectedSet
    })
  }

  const getUnitRowLabel = (pdu: Pdu): string => `Rack ${pdu?.pdu}`

  const getIsClickDisabled = (pdu: Pdu, socket: Socket): boolean =>
    !!(
      minersHashmap[`${pdu?.pdu}_${socket?.socket}`] &&
      !minersHashmap[`${pdu?.pdu}_${socket?.socket}`].error &&
      disableMinerSelect
    )

  const onSocketClickHandler = (pdu: Pdu, socket: Socket) => {
    onSocketClick(
      { ...containerInfo, rack: _head(connectedMiners)?.rack },
      pdu?.pdu,
      socket?.socket,
      minersHashmap[`${pdu?.pdu}_${socket?.socket}`],
    )
  }

  const isSelected = (pdu: Pdu, socket: Socket): boolean =>
    selectedItems.has(getSelectableName(pdu.pdu, socket.socket))

  const getMinerInSocket = (pdu: Pdu, socket: Socket): MinerData | undefined =>
    minersHashmap[`${pdu?.pdu}_${socket?.socket}`]

  const getSocketStatus = (pdu: Pdu, socket: Socket): keyof typeof SITE_OVERVIEW_STATUS_COLORS => {
    const miner = getMinerInSocket(pdu, socket)

    if (!miner || miner.error === 'Device Not Found') {
      return SITE_OVERVIEW_STATUSES.EMPTY as keyof typeof SITE_OVERVIEW_STATUS_COLORS
    }

    if (miner.snap?.stats?.status === MinerStatuses.NOT_MINING) {
      return SITE_OVERVIEW_STATUSES.NOT_MINING as keyof typeof SITE_OVERVIEW_STATUS_COLORS
    }

    if (miner.snap?.stats?.status === MinerStatuses.MINING) {
      return SITE_OVERVIEW_STATUSES.MINING as keyof typeof SITE_OVERVIEW_STATUS_COLORS
    }

    return SITE_OVERVIEW_STATUSES.OFFLINE as keyof typeof SITE_OVERVIEW_STATUS_COLORS
  }

  const socketHasMiner = (pdu: Pdu, socket: Socket): boolean => {
    const miner = getMinerInSocket(pdu, socket)
    return miner ? miner.error !== 'Device Not Found' : false
  }

  return (
    <UnitRow
      $withoutBorder
      key={`row-${sectionKey}`}
      onContextMenu={(e: React.MouseEvent) => {
        e.preventDefault()
      }}
    >
      {showInfiniteViewerControls && (
        <GridUnitControls>
          <GridUnitControlsTitle>Racks</GridUnitControlsTitle>
          <GridUnitControlsSection $expand>
            <Button onClick={handleZoomIn}>Zoom in</Button>
            <Button onClick={handleZoomOut}>Zoom out</Button>
            <Button onClick={() => resetInfiniteViewer(viewportBoundingBox)}>Reset</Button>
            {showBackToContent && (
              <Button type="primary" onClick={handleBackToContent}>
                Back to content
              </Button>
            )}
          </GridUnitControlsSection>
          <GridUnitControlsSection>
            {!isTablet && (
              <Tooltip
                title={
                  <ul>
                    {_map(toolTips, (tip: ControlTooltip, idx: number) => (
                      <li key={idx}>
                        <strong>{tip.label}</strong>: {tip.desc}
                      </li>
                    ))}
                  </ul>
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            )}
          </GridUnitControlsSection>
        </GridUnitControls>
      )}
      <InfiniteViewer
        ref={registerInfiniteViewer}
        className="viewer"
        useMouseDrag={isAltDown}
        useAutoZoom
        zoomRange={[minZoomLevel, 1.5]}
        onDragStart={(e: { preventDrag?: () => void }) => {
          if (mobileSelectionEnabled && e.preventDrag) {
            e.preventDrag()
          }
        }}
        onScroll={checkShowBackToContent}
        useWheelScroll={false}
        usePinch
        pinchThreshold={0}
      >
        <RowWrapper
          $gridType={type || ''}
          $isColumn={type ? !isAntspaceHydro(type) && !isMicroBT(type) : false}
          key={`section-${sectionKey}`}
          className="viewport"
        >
          {_map(segregatedPduSections[sectionKey] || [], (pdu: Pdu, index: number) => (
            <UnitRow key={`row-${pdu?.pdu}-${index}`} $withoutBorder={isHeatmapMode} $isRack>
              <UnitRowLabel
                $isHeatmapMode={isHeatmapMode}
                $isPointer
                className="unit-row-label"
                onClick={(e: React.MouseEvent) =>
                  handleUnitRowSelect(pdu, !!(e.ctrlKey || e.metaKey))
                }
              >
                {getUnitRowLabel(pdu)}
              </UnitRowLabel>
              <SocketsList
                $gridType={type || ''}
                $pduIndex={pdu?.pdu ?? ''}
                $isHeatmapMode={isHeatmapMode}
                $isColumn={type ? isAntspaceHydro(type) || isMicroBT(type) : false}
                $isPduLayout={true}
              >
                {_map(pdu?.sockets, (socket: Socket) => (
                  <CursorNotAllowedDiv
                    key={socket.socket}
                    disabled={getIsClickDisabled(pdu, socket)}
                    $socket={socket.socket ?? ''}
                    $pduIndex={pdu?.pdu ?? ''}
                    $type={type || ''}
                  >
                    <SocketContainerDiv
                      onClick={() => onSocketClickHandler(pdu, socket)}
                      disabled={getIsClickDisabled(pdu, socket)}
                    >
                      <MinerBox
                        className={socketHasMiner(pdu, socket) ? 'socket-container' : ''}
                        $selectable={socketHasMiner(pdu, socket)}
                        key={`socket-${pdu?.pdu}-${socket?.socket}`}
                        $textColor={SITE_OVERVIEW_STATUS_COLORS[getSocketStatus(pdu, socket)]}
                        selected={isSelected(pdu, socket)}
                        data-socket-index={socket?.socket}
                        data-pdu-index={pdu?.pdu}
                      >
                        <div>{getMinerInSocket(pdu, socket)?.hashrate?.value}</div>
                        <div>{getMinerInSocket(pdu, socket)?.hashrate?.unit}</div>
                        <MinerId>{socket.socket}</MinerId>
                      </MinerBox>
                    </SocketContainerDiv>
                  </CursorNotAllowedDiv>
                ))}
              </SocketsList>
            </UnitRow>
          ))}
        </RowWrapper>
      </InfiniteViewer>
    </UnitRow>
  )
}

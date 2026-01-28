import { PrinterOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Tooltip from 'antd/es/tooltip'
import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import React, { useEffect, useRef, useState, type MouseEvent } from 'react'
import InfiniteViewer from 'react-infinite-viewer'
import { useDispatch, useSelector } from 'react-redux'

import { downloadCsv, downloadJson, getMinersFormattedJson } from './ExportPduData.helper'
import {
  ButtonWrapper,
  CursorNotAllowedDiv,
  BackToContentButton,
  PduControls,
  PduControlsSection,
  PduControlsTitle,
  PduLabel,
  PrintOverlay,
  Section,
  SocketContainerDiv,
  SocketsList,
  UnitRow,
} from './PduTab.styles'
import ToolbarPowerModeSelector from './ToolbarPowerModeSelector'

import { Logger } from '@/app/services/logger'
import { pduSlice } from '@/app/slices/pduSlice'
import type { RootState } from '@/app/store'
import { isAntspaceHydro, isBitmainImmersion, isMicroBT } from '@/app/utils/containerUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getControlSectionsTooltips } from '@/app/utils/keyboardShortcutUtils'
import { loadJsPDF, loadHtml2Canvas } from '@/app/utils/lazyPdfExport'
import { Socket } from '@/Components/Container/Socket/Socket'
import { StatsExport } from '@/Components/StatsExport/StatsExport'
import { COLOR } from '@/constants/colors'
import { useInfiniteViewer } from '@/hooks/useInfiniteViewer'
import { useKeyDown } from '@/hooks/useKeyDown'
import usePlatform from '@/hooks/usePlatform'
import type { Device } from '@/types/api'

const { switchLayout } = pduSlice.actions

interface PduGridUnitProps {
  containerInfo?: UnknownRecord
  connectedMiners?: UnknownRecord[]
  isHeatmapMode?: boolean
  type?: string
  heatmapMode?: string
  isEditFlow?: boolean
  onSocketClick?: (
    containerInfo: UnknownRecord,
    pdu: string | number,
    socket: string | number,
    miner: UnknownRecord,
  ) => void
  disableMinerSelect?: boolean
  selectedItems?: Set<string>
  setSelectedItems?: (items: Set<string> | ((prev: Set<string>) => Set<string>)) => void
  sectionKey?: string
  mobileSelectionEnabled?: boolean
  segregatedPduSections?: UnknownRecord
  minersHashmap?: UnknownRecord
  getSelectableName?: (pdu: string | number, socket: string | number) => string
  ranges?: UnknownRecord
  detailsLoading?: boolean
}

const LAYOUT_RESET_DELAY_MS = 250
const PduGridUnit = ({
  containerInfo,
  connectedMiners = [],
  isHeatmapMode,
  type,
  heatmapMode = '',
  isEditFlow,
  onSocketClick = _noop,
  disableMinerSelect,
  selectedItems,
  setSelectedItems,
  sectionKey,
  mobileSelectionEnabled,
  segregatedPduSections,
  minersHashmap,
  getSelectableName,
  ranges,
}: PduGridUnitProps) => {
  const minersFormattedJson = getMinersFormattedJson(connectedMiners as Device[])
  const isAltDown = useKeyDown('Alt')
  const platform = usePlatform()
  const toolTips = getControlSectionsTooltips(platform)
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false)

  const dispatch = useDispatch()
  const isPduLayout = useSelector((state: RootState) => state.pdu.isPduLayout)

  const {
    infiniteViewerRef,
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
    forceResetInfiniteViewer,
  } = useInfiniteViewer()

  const getIsClickDisabled = (pdu: UnknownRecord, socket: UnknownRecord): boolean =>
    !!(
      isEditFlow &&
      minersHashmap?.[`${pdu?.pdu}_${socket?.socket}`] &&
      !(minersHashmap[`${pdu?.pdu}_${socket?.socket}`] as UnknownRecord)?.error &&
      disableMinerSelect
    )

  const getPduLabel = (pdu: UnknownRecord): string => `Rack ${pdu?.pdu as string}`

  const onSocketClickHandler = (pdu: UnknownRecord, socket: UnknownRecord) => {
    onSocketClick?.(
      { ...containerInfo, rack: (_head(connectedMiners) as UnknownRecord | undefined)?.rack },
      pdu?.pdu as string | number,
      socket?.socket as string | number,
      minersHashmap?.[`${pdu?.pdu}_${socket?.socket}`] as UnknownRecord,
    )
  }

  const isSelected = (pdu: UnknownRecord, socket: UnknownRecord): boolean =>
    !!selectedItems?.has?.(
      getSelectableName?.(pdu.pdu as string | number, socket.socket as string | number) || '',
    )

  const handlePDUSelect = (pdu: UnknownRecord, isDeselectKeyDown: boolean) => {
    setSelectedItems?.((existingItems: Set<string>) => {
      const selectedSet = new Set([...existingItems])
      _forEach(pdu.sockets as UnknownRecord[], (socket) => {
        const name = getSelectableName?.(
          pdu.pdu as string | number,
          (socket as UnknownRecord).socket as string | number,
        )
        if (name) {
          if (isDeselectKeyDown) {
            selectedSet.delete(name)
          } else {
            selectedSet.add(name)
          }
        }
      })
      return selectedSet
    })
  }

  const forceResetTimeoutIdRef = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (!_isNil(forceResetTimeoutIdRef.current)) {
        clearTimeout(forceResetTimeoutIdRef.current)
      }
    },
    [],
  )
  const togglePduLayout = () => {
    dispatch(switchLayout())

    forceResetTimeoutIdRef.current = window.setTimeout(
      forceResetInfiniteViewer,
      LAYOUT_RESET_DELAY_MS,
    )
  }

  const exportViewerToPDF = async () => {
    if (!infiniteViewerRef.current) return

    setIsExportingPDF(true)

    const viewer = infiniteViewerRef.current
    const prevZoom = viewer.getZoom()
    viewer.setZoom(1)

    const viewport = infiniteViewerRef.current.getViewport()

    try {
      // Lazy load PDF libraries only when export is triggered
      const [jsPDF, html2canvas] = await Promise.all([loadJsPDF(), loadHtml2Canvas()])

      const canvas = await html2canvas(viewport, {
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        logging: false,
        allowTaint: true,
        backgroundColor: COLOR.DARK_BACK,
      })

      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: canvas.height >= canvas.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${containerInfo?.container}_Layout_${new Date()}.pdf`)
    } catch (err) {
      Logger.error('PDF export failed', err)
    } finally {
      viewer.setZoom(prevZoom)
      setIsExportingPDF(false)
    }
  }

  return (
    <UnitRow
      $withoutBorder
      key={`row-${sectionKey}`}
      onContextMenu={(e) => {
        e.preventDefault()
      }}
    >
      {isExportingPDF && (
        <PrintOverlay>
          <span>Printing Layout...</span>
          <PrinterOutlined />
        </PrintOverlay>
      )}
      {showInfiniteViewerControls && (
        <PduControls>
          <PduControlsTitle>Racks</PduControlsTitle>
          <PduControlsSection $expand>
            <Button onClick={handleZoomIn}>Zoom in</Button>
            <Button onClick={handleZoomOut}>Zoom out</Button>
            <Button onClick={() => resetInfiniteViewer(viewportBoundingBox)}>Reset</Button>
            <Button onClick={exportViewerToPDF}>Print</Button>
            {!isBitmainImmersion(type || '') && !isAntspaceHydro(type || '') && (
              <Button onClick={() => togglePduLayout()}>
                {isPduLayout ? 'Go to Ordered View' : 'Go to Container View'}
              </Button>
            )}
            <StatsExport
              onCsvExport={async () => downloadCsv(minersFormattedJson)}
              onJsonExport={async () => downloadJson(minersFormattedJson)}
            />
            {showBackToContent && (
              <BackToContentButton type="primary" onClick={handleBackToContent}>
                Back to content
              </BackToContentButton>
            )}
            <ButtonWrapper>
              <ToolbarPowerModeSelector />
            </ButtonWrapper>
          </PduControlsSection>
          <PduControlsSection>
            <Tooltip
              title={
                <ul>
                  {_map(toolTips, (tip, idx) => (
                    <li key={idx}>
                      <strong>{tip.label}</strong>: {tip.desc}
                    </li>
                  ))}
                </ul>
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </PduControlsSection>
        </PduControls>
      )}
      <InfiniteViewer
        ref={registerInfiniteViewer}
        className="viewer"
        useMouseDrag={isAltDown}
        useAutoZoom
        zoomRange={[minZoomLevel, 1.5]}
        onDragStart={(e) => {
          if (mobileSelectionEnabled) {
            e.preventDrag()
          }
        }}
        onScroll={checkShowBackToContent}
        useWheelScroll={false}
        usePinch
        pinchThreshold={0}
      >
        <Section
          $gridType={type}
          $isHeatmapMode={isHeatmapMode}
          $isColumn={!isAntspaceHydro(type || '') && !isMicroBT(type || '')}
          $isPduLayout={isPduLayout}
          key={`section-${sectionKey}`}
          className="viewport"
        >
          {_map(
            segregatedPduSections?.[sectionKey || ''] as UnknownRecord[] | undefined,
            (pdu, index) => {
              const pduRecord = pdu as UnknownRecord
              return (
                <UnitRow
                  key={`row-${pduRecord?.pdu}-${index}`}
                  $withoutBorder={isHeatmapMode}
                  $isRack
                >
                  <PduLabel
                    $isHeatmapMode={isHeatmapMode}
                    $isPointer
                    className="pdu-label"
                    onClick={(e: MouseEvent<HTMLDivElement>) =>
                      handlePDUSelect(pduRecord, e.ctrlKey || e.metaKey)
                    }
                  >
                    {getPduLabel(pduRecord)}
                  </PduLabel>
                  <SocketsList
                    $gridType={type}
                    $pduIndex={pduRecord?.pdu as string}
                    $isHeatmapMode={isHeatmapMode}
                    $isColumn={isAntspaceHydro(type || '') || isMicroBT(type || '')}
                    $isPduLayout={isPduLayout}
                  >
                    {_map(pduRecord?.sockets as UnknownRecord[] | undefined, (socket) => {
                      const socketRecord = socket as UnknownRecord
                      return (
                        <CursorNotAllowedDiv
                          key={socketRecord.socket as string | number}
                          disabled={getIsClickDisabled(pduRecord, socketRecord)}
                          $socket={socketRecord.socket as string}
                          $pduIndex={pduRecord?.pdu as string}
                          $type={type}
                        >
                          <SocketContainerDiv
                            onClick={() => onSocketClickHandler(pduRecord, socketRecord)}
                            disabled={getIsClickDisabled(pduRecord, socketRecord)}
                          >
                            <Socket
                              miner={
                                minersHashmap?.[
                                  `${pduRecord?.pdu}_${socketRecord?.socket}`
                                ] as React.ComponentProps<typeof Socket>['miner']
                              }
                              key={`socket-${pduRecord?.pdu}-${socketRecord?.socket}`}
                              selected={isSelected(pduRecord, socketRecord)}
                              heatmap={{
                                isHeatmapMode,
                                mode: heatmapMode,
                                ranges: ranges as Record<
                                  string,
                                  {
                                    min?: number
                                    max?: number
                                  }
                                >,
                              }}
                              pdu={pduRecord}
                              {...socketRecord}
                              isEditFlow={isEditFlow}
                              clickDisabled={getIsClickDisabled(pduRecord, socketRecord)}
                              isEmptyPowerDashed={isMicroBT(type || '')}
                            />
                          </SocketContainerDiv>
                        </CursorNotAllowedDiv>
                      )
                    })}
                  </SocketsList>
                </UnitRow>
              )
            },
          )}
        </Section>
      </InfiniteViewer>
    </UnitRow>
  )
}

export { PduGridUnit }

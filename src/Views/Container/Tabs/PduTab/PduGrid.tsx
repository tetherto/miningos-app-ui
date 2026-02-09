import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _isEqual from 'lodash/isEqual'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _max from 'lodash/maxBy'
import _min from 'lodash/minBy'
import _noop from 'lodash/noop'
import _split from 'lodash/split'
import _values from 'lodash/values'
import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import Selecto from 'react-selecto'

import { PduGridUnit } from './PduGridUnit'
import { SectionsList, PduGridWrapper } from './PduTab.styles'
import { getSelectableName } from './pduUtils'

import { devicesSlice } from '@/app/slices/devicesSlice'
import { getConnectedMinerForSocket } from '@/app/utils/containerUtils'
import { PduData } from '@/app/utils/containerUtils/containerPdu'
import { getDeviceData, getDeviceTemperature } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import useDeviceResolution from '@/hooks/useDeviceResolution'
import { useKeyDown } from '@/hooks/useKeyDown'
import { Device } from '@/types'
import { HeatmapControls } from '@/Views/Container/Tabs/HeatmapTab/HeatmapControls'

const { selectDeviceTag, resetSelectedDevicesTags } = devicesSlice.actions

interface PduGridProps {
  containerInfo?: UnknownRecord
  connectedMiners?: UnknownRecord[]
  type?: string
  isHeatmapMode?: boolean
  heatmapMode?: string
  setHeatmapMode?: (mode: string) => void
  isEditFlow?: boolean
  onSocketClick?: (
    containerInfo: UnknownRecord,
    pdu: string | number,
    socket: string | number,
    miner: UnknownRecord,
  ) => void
  disableMinerSelect?: boolean
  pdus?: PduData[]
  selectedItems?: Set<string>
  setSelectedItems?: (items: Set<string> | ((prev: Set<string>) => Set<string>)) => void
  mobileSelectionEnabled?: boolean
  detailsLoading?: boolean
  onRangesChange?: (ranges: Record<string, { min?: number; max?: number }>) => void
}

const PduGrid = ({
  containerInfo = {},
  connectedMiners = [],
  type = '',
  isHeatmapMode = false,
  heatmapMode = '',
  setHeatmapMode = _noop,
  isEditFlow = false,
  onSocketClick = _noop,
  disableMinerSelect = false,
  pdus,
  selectedItems,
  setSelectedItems,
  mobileSelectionEnabled,
  detailsLoading,
  onRangesChange,
}: PduGridProps) => {
  const selectablesContainerRef = useRef<HTMLElement | null>(null)
  const [showSelecto, setShowSelecto] = useState<boolean>(false)
  const registerSelectablesContainer = (node: HTMLElement | null) => {
    selectablesContainerRef.current = node
    setShowSelecto(!!node)
  }
  const isAltDown = useKeyDown('Alt')
  const lastSelectionTimeRef = useRef<number>(0)
  const RAPID_CLICK_THRESHOLD = 300 // ms - if clicks happen within this time, don't clear selection

  const [pduList, setPduList] = useState<UnknownRecord[]>([])
  const [minersHashmap, setMinersHashmap] = useState<UnknownRecord>({})
  const [ranges, setRanges] = useState<UnknownRecord>({
    pcb: { min: 0, max: 0 },
    inlet: { min: 0, max: 0 },
    chip: { min: 0, max: 0 },
    hashrate: { min: 0, max: 0 },
  })

  const dispatch = useDispatch()
  const { isTablet } = useDeviceResolution()
  const isSelectoActive = isTablet ? mobileSelectionEnabled : !isAltDown

  // Gather miners and temperature data
  useEffect(() => {
    // Skip updating hashmap if connectedMiners is empty but pdus exist
    // This prevents overwriting good data during polling/re-fetch cycles
    if (pdus && pdus.length > 0 && (!connectedMiners || connectedMiners.length === 0)) {
      return
    }

    let minersHashMap: UnknownRecord = {}

    _forEach(pdus as UnknownRecord[] | undefined, (pdu) => {
      const pduRecord = pdu as UnknownRecord
      _forEach(pduRecord?.sockets as UnknownRecord[] | undefined, (socket) => {
        const socketRecord = socket as UnknownRecord
        const miner = getConnectedMinerForSocket(
          connectedMiners as Device[],
          pduRecord?.pdu as string,
          socketRecord?.socket as string,
        ) as UnknownRecord | undefined
        const [error, data] = getDeviceData(miner as Device)
        const currentTemperature = error ? {} : getDeviceTemperature(data as UnknownRecord)

        minersHashMap[`${pduRecord?.pdu}_${socketRecord?.socket}`] = {
          ...miner,
          temperature: currentTemperature,
          error,
          snap: (miner as { last?: { snap?: unknown } })?.last?.snap,
        }
      })
    })

    setMinersHashmap(minersHashMap)

    const minersArray = _values(minersHashMap)
    const pcbArray = _map(
      minersArray,
      (miner) => ((miner as UnknownRecord)?.temperature as UnknownRecord | undefined)?.pcb,
    )
    const inletArray = _map(
      minersArray,
      (miner) => ((miner as UnknownRecord)?.temperature as UnknownRecord | undefined)?.inlet,
    )
    const chipArray = _map(
      minersArray,
      (miner) => ((miner as UnknownRecord)?.temperature as UnknownRecord | undefined)?.chip,
    )
    const hashrateArray = _map(
      minersArray,
      (miner) =>
        (
          (
            ((miner as UnknownRecord)?.snap as UnknownRecord | undefined)?.stats as
              | UnknownRecord
              | undefined
          )?.hashrate_mhs as { t_5m?: number } | undefined
        )?.t_5m,
    )

    const minPcb = _min(pcbArray) as number | undefined
    const maxPcb = _max(pcbArray) as number | undefined
    const minInlet = _min(inletArray) as number | undefined
    const maxInlet = _max(inletArray) as number | undefined
    const minChip = _min(chipArray) as number | undefined
    const maxChip = _max(chipArray) as number | undefined
    const minHashrate = _min(hashrateArray) as number | undefined
    const maxHashrate = _max(hashrateArray) as number | undefined

    const newRanges: Record<string, { min?: number; max?: number }> = {
      pcb: { min: minPcb, max: maxPcb },
      inlet: { min: minInlet, max: maxInlet },
      chip: { min: minChip, max: maxChip },
      hashrate: { min: minHashrate, max: maxHashrate },
    }
    setRanges(newRanges)
    onRangesChange?.(newRanges)

    setPduList((pdus as UnknownRecord[] | undefined) || [])
  }, [pdus, connectedMiners, onRangesChange])

  // Use a ref to track the previous container to only reset when container actually changes
  const prevContainerRef = useRef<string | undefined>(
    containerInfo?.container as string | undefined,
  )

  useEffect(() => {
    const currentContainer = containerInfo?.container as string | undefined
    const containerChanged = !_isEqual(prevContainerRef.current, currentContainer)

    if (containerChanged) {
      dispatch(resetSelectedDevicesTags())
      prevContainerRef.current = currentContainer
    }

    if (isEditFlow) {
      return
    }

    dispatch(resetSelectedDevicesTags())

    _forEach([...(selectedItems || [])], (selectedSocketRaw) => {
      const selectedSocket = JSON.parse(selectedSocketRaw) as UnknownRecord
      dispatch(
        selectDeviceTag({
          id: '',
          info: {
            pos:
              selectedSocket?.pduIndex === 'miners'
                ? (selectedSocket?.socketIndex as string)
                : (selectedSocket?.pduIndex as string) +
                  '_' +
                  (selectedSocket?.socketIndex as string),
            container: currentContainer || '',
          },
        }),
      )
    })
  }, [containerInfo?.container, dispatch, isEditFlow, selectedItems])

  const segregatePduSections = (): UnknownRecord => {
    const segregatedSections: UnknownRecord = {}
    _forEach(pduList, (pdu) => {
      const pduRecord = pdu as UnknownRecord
      if (_split(pduRecord?.pdu as string, '_').length <= 1) {
        if (!segregatedSections['Racks']) {
          segregatedSections['Racks'] = []
        }
        ;(segregatedSections['Racks'] as UnknownRecord[]).push(pduRecord)
        return
      }
      const sectionKey = (pduRecord?.pdu as string)?.split('_')[0]
      if (!segregatedSections[sectionKey]) {
        segregatedSections[sectionKey] = []
      }
      ;(segregatedSections[sectionKey] as UnknownRecord[]).push(pduRecord)
    })
    return segregatedSections
  }

  const segregatedPduSections = segregatePduSections()

  const getSelectableNameFromSocketEl = (socketEl: HTMLElement | null): string | undefined => {
    if (!socketEl) return
    const pduIndex = socketEl.dataset?.pduIndex
    const socketIndex = socketEl.dataset?.socketIndex
    if (!pduIndex || !socketIndex) return
    return getSelectableName(pduIndex, socketIndex)
  }

  const hasConnectedMiner = (pduIndex?: string, socketIndex?: string): boolean => {
    if (!pduIndex || !socketIndex) return false
    const miner = minersHashmap?.[`${pduIndex}_${socketIndex}`] as UnknownRecord | undefined
    return !!(miner && !(miner as UnknownRecord)?.error)
  }

  const handleSelectEnd = (e: {
    inputEvent?: { target?: { classList?: { contains: (className: string) => boolean } } }
    added?: HTMLElement[]
    removed?: HTMLElement[]
  }) => {
    const { added: addedElements, removed: removedElements, inputEvent } = e
    const isPduLabelClicked = inputEvent?.target?.classList?.contains('pdu-label')

    if (isPduLabelClicked) {
      return
    }

    // Update last selection time
    lastSelectionTimeRef.current = Date.now()

    // Use functional update to avoid stale closure issues during rapid clicks
    setSelectedItems?.((prevSelectedItems) => {
      const selectedSet = new Set([...(prevSelectedItems || [])])

      // react-selecto can "toggle off" a previously selected element when using selectByClick.
      // We want repeated clicks (incl. on inner label areas) to be idempotent: keep the socket selected
      // unless a modifier key is pressed.
      const clickEvent = inputEvent as unknown as {
        shiftKey?: boolean
        metaKey?: boolean
        ctrlKey?: boolean
        altKey?: boolean
      }
      const hasModifierKey = !!(
        clickEvent?.shiftKey ||
        clickEvent?.metaKey ||
        clickEvent?.ctrlKey ||
        clickEvent?.altKey
      )
      if (
        !hasModifierKey &&
        (addedElements?.length ?? 0) === 0 &&
        (removedElements?.length ?? 0) === 1
      ) {
        const name = getSelectableNameFromSocketEl(removedElements?.[0] ?? null)
        if (name && selectedSet.has(name)) {
          return selectedSet
        }
      }

      const shouldFilterByMiner = (addedElements?.length ?? 0) > 1
      const filteredAddedElements = shouldFilterByMiner
        ? _filter(addedElements, (socketElement) => {
            const { dataset } = socketElement as unknown as {
              dataset: { pduIndex?: string; socketIndex?: string }
            }
            return hasConnectedMiner(dataset.pduIndex, dataset.socketIndex)
          })
        : addedElements

      _forEach(filteredAddedElements, (socketElement: HTMLElement) => {
        const { dataset } = socketElement as unknown as {
          dataset: { pduIndex: string; socketIndex: string }
        }
        const name = getSelectableName(dataset.pduIndex, dataset.socketIndex)
        selectedSet.add(name)
      })
      _forEach(removedElements, (socketElement: HTMLElement) => {
        const { dataset } = socketElement as unknown as {
          dataset: { pduIndex: string; socketIndex: string }
        }
        const name = getSelectableName(dataset.pduIndex, dataset.socketIndex)
        selectedSet.delete(name)
      })

      return selectedSet
    })
  }

  const handleSelectStart = ({
    inputEvent,
  }: {
    inputEvent: {
      target: { classList: { contains: (className: string) => boolean } }
      shiftKey: boolean
    }
  }) => {
    const isPduLabelClicked = inputEvent.target.classList.contains('pdu-label')
    const isShiftDown = inputEvent.shiftKey

    if (!isPduLabelClicked && !isShiftDown) {
      // If the user is clicking an already-selected socket, don't clear selection.
      // This prevents a slow repeat-click from clearing selection and then being interpreted
      // by Selecto as a "toggle off" (which looks like random deselection).
      const rawTarget = inputEvent.target as unknown
      const targetEl = rawTarget instanceof HTMLElement ? rawTarget : null
      const socketEl = (targetEl?.closest?.('.socket-container') as HTMLElement | null) ?? null
      const clickedName = getSelectableNameFromSocketEl(socketEl)
      if (clickedName && selectedItems?.has(clickedName)) {
        return
      }

      const now = Date.now()
      const timeSinceLastSelection = now - lastSelectionTimeRef.current

      if (timeSinceLastSelection > RAPID_CLICK_THRESHOLD) {
        setSelectedItems?.(new Set())
      }
    }
  }

  return (
    <PduGridWrapper>
      <SectionsList ref={registerSelectablesContainer}>
        {isHeatmapMode && <HeatmapControls mode={heatmapMode} setMode={setHeatmapMode || _noop} />}

        {_map(_keys(segregatedPduSections), (sectionKey) => (
          <PduGridUnit
            key={sectionKey}
            containerInfo={containerInfo}
            connectedMiners={connectedMiners}
            isHeatmapMode={isHeatmapMode}
            type={type}
            heatmapMode={heatmapMode}
            isEditFlow={isEditFlow}
            onSocketClick={onSocketClick}
            disableMinerSelect={disableMinerSelect}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            sectionKey={sectionKey}
            mobileSelectionEnabled={mobileSelectionEnabled}
            segregatedPduSections={segregatedPduSections}
            minersHashmap={minersHashmap}
            getSelectableName={(pdu: string | number, socket: string | number) =>
              getSelectableName(String(pdu), String(socket))
            }
            ranges={ranges}
            detailsLoading={detailsLoading}
          />
        ))}
      </SectionsList>
      {showSelecto && isSelectoActive && !!selectablesContainerRef.current && (
        <Selecto
          ratio={0}
          hitRate={25}
          selectByClick
          toggleContinueSelect={['shift']}
          selectableTargets={['.socket-container']}
          dragContainer={selectablesContainerRef.current}
          onSelectStart={handleSelectStart as (e: unknown) => void}
          onSelectEnd={handleSelectEnd as (e: unknown) => void}
        />
      )}
    </PduGridWrapper>
  )
}

export { PduGrid }

import { QuestionCircleOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _size from 'lodash/size'
import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Selecto from 'react-selecto'

import {
  ASSIGN_POOL_POPUP_ENABLED,
  SETUP_POOLS_WARNING_MESSAGE,
  SITE_OVERVIEW_STATUS_COLORS,
  SITE_OVERVIEW_STATUS_LABELS,
  SITE_OVERVIEW_STATUSES,
  SiteOverviewDetailsLegendColors,
} from '../PoolManager.constants'
import { SetPoolConfiguration } from '../SitesOverview/SetPoolConfiguration/SetPoolConfiguration'
import SetPoolConfigurationModal from '../SitesOverview/SetPoolConfiguration/SetPoolConfigurationModal'
import { StatusBadge } from '../SitesOverview/SitesOverviewStatusCard.styles'
import {
  SetPoolConfigurationTabletButton,
  StickyConfigurationCol,
} from '../SitesOverview/SitesOverviewStatusCardList.styles'

import { GridUnit, Pdu, type MinerData } from './GridUnit'
import {
  Actions,
  HeaderInfoCol,
  HeaderLabel,
  HeaderRow,
  HeaderValue,
  Info,
  Legend,
  LegendItem,
  RacksCol,
  Wrapper,
} from './SiteOverviewDetailsContainer.styles'
import { getMinersPoolName } from './SiteOverviewDetailsContainer.utils'

import { actionsSlice, selectPendingSubmissions } from '@/app/slices/actionsSlice'
import { getConnectedMinerForSocket } from '@/app/utils/containerUtils'
import { appendIdToTag } from '@/app/utils/deviceUtils'
import { notifyInfo } from '@/app/utils/NotificationService'
import { MinerStatuses } from '@/app/utils/statusUtils'
import { DangerActionButton } from '@/Components/DangerActionButton/DangerActionButton'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ACTION_TYPES } from '@/constants/actions'
import type { Device } from '@/hooks/hooks.types'
import useDeviceResolution from '@/hooks/useDeviceResolution'
import { useKeyDown } from '@/hooks/useKeyDown'
import { useSiteOverviewDetailsData } from '@/hooks/useSiteOverviewDetailsData'
import { useUpdateExistedActions } from '@/hooks/useUpdateExistedActions'
import { getSelectableName } from '@/Views/Container/Tabs/PduTab/pduUtils'

const { setAddPendingSubmissionAction } = actionsSlice.actions

const POOL_SETUPPABLE_MINERS_STATUSES = [MinerStatuses.NOT_MINING, MinerStatuses.MINING]

interface UnitData {
  last?: {
    snap?: {
      stats?: {
        status?: string
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  type?: string
  info?: {
    container?: string
    nominalMinerCapacity?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface SiteOverviewDetailsContainerProps {
  unit?: UnitData
}

interface SelectEndEvent {
  inputEvent?: {
    target?: {
      classList?: {
        contains: (className: string) => boolean
      }
    }
  }
  added?: Array<{
    dataset?: {
      pduIndex?: string
      socketIndex?: string
    }
  }>
  removed?: Array<{
    dataset?: {
      pduIndex?: string
      socketIndex?: string
    }
  }>
}

interface SelectStartEvent {
  inputEvent: {
    target: {
      classList: {
        contains: (className: string) => boolean
      }
    }
    shiftKey: boolean
  }
}

const SiteOverviewDetailsContainer = ({ unit }: SiteOverviewDetailsContainerProps) => {
  const { isTablet } = useDeviceResolution()
  const isAltDown = useKeyDown('Alt')
  const mobileSelectionEnabled = false // TODO: handle mobile selection as per PDU

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [showSelecto, setShowSelecto] = useState(false)
  const selectablesContainerRef = useRef<HTMLDivElement | null>(null)
  const registerSelectablesContainer = (node: HTMLDivElement | null) => {
    selectablesContainerRef.current = node
    setShowSelecto(!!node)
  }
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Fetch and process all data using custom hook
  const {
    actualMinersCount,
    containerHashRate,
    pdus,
    segregatedPduSections,
    minersHashmap,
    connectedMiners,
    containerInfo,
    connectedMinersData,
    isContainerRunning,
    isLoading,
  } = useSiteOverviewDetailsData(unit)

  const { type } = unit || {}

  const isSelectoActive = isTablet ? mobileSelectionEnabled : !isAltDown

  const handleSelectEnd = (e: SelectEndEvent) => {
    const isLabelClicked = e?.inputEvent?.target?.classList?.contains('unit-row-label')

    if (isLabelClicked) {
      return
    }

    const selectedSet = new Set([...selectedItems])

    _forEach(e.added || [], (el: unknown) => {
      const elTyped = el as { dataset?: { pduIndex?: string; socketIndex?: string } }
      const pduIndex = elTyped.dataset?.pduIndex
      const socketIndex = elTyped.dataset?.socketIndex
      if (pduIndex !== undefined && socketIndex !== undefined) {
        const name = getSelectableName(pduIndex, socketIndex)
        selectedSet.add(name)
      }
    })
    _forEach(e.removed || [], (el: unknown) => {
      const elTyped = el as { dataset?: { pduIndex?: string; socketIndex?: string } }
      const pduIndex = elTyped.dataset?.pduIndex
      const socketIndex = elTyped.dataset?.socketIndex
      if (pduIndex !== undefined && socketIndex !== undefined) {
        const name = getSelectableName(pduIndex, socketIndex)
        selectedSet.delete(name)
      }
    })

    setSelectedItems(selectedSet)
  }

  const handleSelectStart = ({ inputEvent }: SelectStartEvent) => {
    const isPduLabelClicked = inputEvent.target.classList.contains('unit-row-label')
    const isShiftDown = inputEvent.shiftKey

    if (!isPduLabelClicked && !isShiftDown) {
      setSelectedItems(new Set())
    }
  }

  const handleSelectAll = () => {
    const selections: string[] = []
    _forEach(pdus || [], (pdu: Pdu) => {
      const pduIndex = pdu?.pdu
      if (!pduIndex) return
      _forEach(pdu?.sockets || [], (socket: unknown) => {
        const socketTyped = socket as { socket?: string; [key: string]: unknown }
        const socketIndex = socketTyped?.socket
        if (_isUndefined(socketIndex)) return
        const miner = getConnectedMinerForSocket(
          connectedMiners || [],
          pduIndex,
          String(socketIndex),
        )
        if (miner) {
          selections.push(getSelectableName(pduIndex, socketIndex))
        }
      })
    })
    setSelectedItems(new Set(selections))
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const openSidebar = () => {
    setIsSidebarOpen(true)
  }

  const hasSelection = _size(selectedItems) > 0

  const pendingSubmissions = useSelector(selectPendingSubmissions)
  const { updateExistedActions } = useUpdateExistedActions()
  const dispatch = useDispatch()

  const handleSetupPools = () => {
    const selectedDevices: Device[] = []
    _forEach([...selectedItems], (name: string) => {
      const parsed = JSON.parse(name) as { pduIndex: string; socketIndex: string }
      const { pduIndex, socketIndex } = parsed
      const miner = minersHashmap[`${pduIndex}_${socketIndex}`]
      const deviceId = miner?.id

      if (deviceId && _includes(POOL_SETUPPABLE_MINERS_STATUSES, miner.snap?.stats?.status)) {
        const connectedMiner = _find(connectedMiners || [], (d: Device) => d.id === deviceId)
        if (connectedMiner) {
          selectedDevices.push(connectedMiner)
        }
      }
    })

    if (_isEmpty(selectedDevices)) {
      notifyInfo('No miners found', "Selected miners are not in 'Not Mining (Sleep + Error)' state")
    }

    const selectedDevicesTags = _map(selectedDevices, (device: Device) => appendIdToTag(device.id))
    updateExistedActions({
      actionType: ACTION_TYPES.SETUP_POOLS,
      pendingSubmissions: pendingSubmissions as Array<{
        id: string | number
        action: string
        tags: string[]
        [key: string]: unknown
      }>,
      selectedDevices,
    })

    if (!_isEmpty(selectedDevicesTags)) {
      dispatch(
        setAddPendingSubmissionAction({
          type: 'voting',
          action: ACTION_TYPES.SETUP_POOLS,
          tags: selectedDevicesTags,
          params: [],
        }),
      )

      notifyInfo('Action added', 'Setup Pools')
    }
  }

  const poolName = getMinersPoolName(connectedMiners) || '-'

  return (
    <Wrapper>
      <RacksCol $hasSelection={false} $isTablet={isTablet}>
        <HeaderRow>
          <Info>
            <HeaderInfoCol>
              <HeaderLabel>Pool</HeaderLabel>
              <HeaderValue>{poolName}</HeaderValue>
            </HeaderInfoCol>
            <HeaderInfoCol>
              <HeaderLabel>Miners</HeaderLabel>
              <HeaderValue $value={actualMinersCount}>{actualMinersCount}</HeaderValue>
            </HeaderInfoCol>
            <HeaderInfoCol>
              <HeaderLabel>Hashrate</HeaderLabel>
              <HeaderValue>{containerHashRate}</HeaderValue>
            </HeaderInfoCol>
            <HeaderInfoCol>
              <HeaderLabel>Status</HeaderLabel>
              <HeaderValue>
                <StatusBadge
                  $textColor={
                    SITE_OVERVIEW_STATUS_COLORS[
                      isContainerRunning
                        ? SITE_OVERVIEW_STATUSES.MINING
                        : SITE_OVERVIEW_STATUSES.OFFLINE
                    ]
                  }
                >
                  {
                    SITE_OVERVIEW_STATUS_LABELS[
                      isContainerRunning
                        ? SITE_OVERVIEW_STATUSES.MINING
                        : SITE_OVERVIEW_STATUSES.OFFLINE
                    ]
                  }
                </StatusBadge>
              </HeaderValue>
            </HeaderInfoCol>
          </Info>
          <Actions>
            {hasSelection && (
              <DangerActionButton
                confirmation={{
                  title: 'Setup Pools',
                  description: SETUP_POOLS_WARNING_MESSAGE,
                  onConfirm: () => handleSetupPools(),
                  icon: <QuestionCircleOutlined style={{ color: 'red' }} />,
                }}
                label="Setup Pools"
              />
            )}
            {hasSelection && (
              <Button onClick={() => setSelectedItems(new Set())}>Deselect All</Button>
            )}
            <Button onClick={handleSelectAll}>Select All</Button>
          </Actions>
        </HeaderRow>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div ref={registerSelectablesContainer}>
              {_map(_keys(segregatedPduSections), (sectionKey: string) => (
                <GridUnit
                  key={sectionKey}
                  containerInfo={containerInfo}
                  connectedMiners={
                    connectedMinersData as unknown as Array<{
                      rack?: string
                      [key: string]: unknown
                    }>
                  }
                  type={type}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  sectionKey={sectionKey}
                  mobileSelectionEnabled={mobileSelectionEnabled}
                  segregatedPduSections={segregatedPduSections as unknown as Record<string, Pdu[]>}
                  minersHashmap={minersHashmap as Record<string, MinerData>}
                  getSelectableName={getSelectableName}
                />
              ))}
            </div>
            {showSelecto && isSelectoActive && !!selectablesContainerRef.current && (
              <Selecto
                ratio={0}
                hitRate={25}
                selectByClick
                toggleContinueSelect={['shift']}
                selectableTargets={['.socket-container']}
                dragContainer={selectablesContainerRef.current}
                onSelectStart={handleSelectStart}
                onSelectEnd={handleSelectEnd}
              />
            )}
          </>
        )}

        <Legend>
          <LegendItem color={SiteOverviewDetailsLegendColors[SITE_OVERVIEW_STATUSES.OFFLINE]}>
            Offline
          </LegendItem>
          <LegendItem
            $hasBorder
            color={SiteOverviewDetailsLegendColors[SITE_OVERVIEW_STATUSES.EMPTY]}
          >
            Empty
          </LegendItem>
          <LegendItem color={SiteOverviewDetailsLegendColors[SITE_OVERVIEW_STATUSES.NOT_MINING]}>
            Not Mining (Sleep + Error)
          </LegendItem>
          <LegendItem color={SiteOverviewDetailsLegendColors[SITE_OVERVIEW_STATUSES.MINING]}>
            Online
          </LegendItem>
        </Legend>
      </RacksCol>
      {hasSelection &&
        ASSIGN_POOL_POPUP_ENABLED &&
        (isTablet ? (
          <>
            <SetPoolConfigurationTabletButton onClick={openSidebar}>
              <div>
                {' '}
                {selectedItems.size} {selectedItems.size > 1 ? 'Selected units' : 'Selected unit'}
              </div>
              <div>Selected</div>
            </SetPoolConfigurationTabletButton>
            <SetPoolConfigurationModal
              isSidebarOpen={isSidebarOpen}
              handleCancel={handleSidebarClose}
            />
          </>
        ) : (
          <StickyConfigurationCol>
            <SetPoolConfiguration></SetPoolConfiguration>
          </StickyConfigurationCol>
        ))}
    </Wrapper>
  )
}

export default SiteOverviewDetailsContainer

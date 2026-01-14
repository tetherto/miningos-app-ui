import _compact from 'lodash/compact'
import _groupBy from 'lodash/groupBy'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isNaN from 'lodash/isNaN'
import _join from 'lodash/join'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _parseInt from 'lodash/parseInt'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _uniq from 'lodash/uniq'
import pluralize from 'pluralize'
import { useState, type FC, useEffect } from 'react'

import {
  ApplyButton,
  ControlsSection,
  InputLabel,
  ManualInputRow,
  ModelTitle,
  PanelContainer,
  PanelHeader,
  PercentageButton,
  PercentageButtonsRow,
  RackGroup,
  RackGroupTitle,
  RacksLabel,
  SectionLabel,
  SelectionSummary,
  SocketBadge,
  SocketBadgesRow,
  StyledInputNumber,
  SummaryTitle,
} from './PowerControlsPanel.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { NoMinersSelectedContainer } from '@/Components/Explorer/DetailsView/DetailsView.styles'
import NoDataSelected from '@/Components/Explorer/DetailsView/NoDataSelected/NoDataSelected'
import { UNITS } from '@/constants/units'

interface SelectedSocket {
  pduIndex: string
  socketIndex: string
}

interface PowerControlsPanelProps {
  selectedItems: Set<string>
  connectedMiners?: UnknownRecord[]
  containerInfo?: UnknownRecord
  onApply: (percentage: number, selectedSockets: SelectedSocket[]) => void
}

const PERCENTAGE_PRESETS = [0, 25, 50, 75, 100]

const PowerControlsPanel: FC<PowerControlsPanelProps> = ({
  selectedItems,
  connectedMiners,
  containerInfo,
  onApply,
}) => {
  const [powerPercentage, setPowerPercentage] = useState<number | null>(null)

  const parseSelectedItems = (): SelectedSocket[] => {
    const itemsArray = Array.from(selectedItems)
    const parsed = _compact(
      _map(itemsArray, (item) => {
        try {
          return JSON.parse(item) as SelectedSocket
        } catch {
          return null
        }
      }),
    )
    return parsed
  }

  const selectedSockets = parseSelectedItems()
  const selectedCount = _size(selectedSockets)
  const hasSelection = selectedCount > 0

  // Get unique racks from selection
  const getSelectedRacks = (): string[] => {
    const racks = _map(selectedSockets, (socket) => socket.pduIndex)
    return _sortBy(_uniq(racks))
  }

  // Group sockets by rack
  const getSocketsByRack = (): Record<string, SelectedSocket[]> => _groupBy(selectedSockets, 'pduIndex')

  // Get model name from first connected miner
  const getModelName = (): string => {
    if (!connectedMiners || _isEmpty(connectedMiners)) {
      return 'Whatsminer'
    }
    const firstMiner = _head(connectedMiners) as UnknownRecord | undefined
    const type = firstMiner?.type as string | undefined
    return type || 'Whatsminer'
  }

  // Reset percentage when selection changes
  useEffect(() => {
    if (!hasSelection) {
      setPowerPercentage(null)
    }
  }, [hasSelection])

  const handlePercentageChange = (value: string | number | null) => {
    if (typeof value === 'string') {
      const parsed = _parseInt(value, 10)
      setPowerPercentage(_isNaN(parsed) ? null : parsed)
    } else {
      setPowerPercentage(value)
    }
  }

  const handlePresetClick = (preset: number) => {
    setPowerPercentage(preset)
  }

  const handleApply = () => {
    if (powerPercentage !== null && hasSelection) {
      onApply(powerPercentage, selectedSockets)
    }
  }

  const selectedRacks = getSelectedRacks()
  const socketsByRack = getSocketsByRack()
  const containerName = (containerInfo?.container as string) || 'Container'

  if (!hasSelection) {
    return (
      <NoMinersSelectedContainer>
        <NoDataSelected
          text="No Selected"
          subtext="Please select to view details"
        />
      </NoMinersSelectedContainer>
    )
  }

  return (
    <PanelContainer>
      <PanelHeader>
        <ModelTitle>{getModelName()}</ModelTitle>
        <RacksLabel>
          {_join(_map(selectedRacks, (rack) => `Rack ${rack}`), ' | ')}
        </RacksLabel>
      </PanelHeader>

      <ControlsSection>
        <SectionLabel>Power Controls</SectionLabel>

        <ManualInputRow>
          <InputLabel>Manual Input</InputLabel>
          <StyledInputNumber
            value={powerPercentage}
            onChange={handlePercentageChange}
            min={0}
            max={100}
            placeholder="Mixed"
            addonAfter={UNITS.PERCENT}
          />
        </ManualInputRow>

        <PercentageButtonsRow>
          {_map(PERCENTAGE_PRESETS, (preset) => (
            <PercentageButton
              key={preset}
              $isActive={powerPercentage === preset}
              onClick={() => handlePresetClick(preset)}
            >
              {preset}{UNITS.PERCENT}
            </PercentageButton>
          ))}
        </PercentageButtonsRow>

        <ApplyButton
          onClick={handleApply}
          disabled={powerPercentage === null}
        >
          Apply
        </ApplyButton>
      </ControlsSection>

      <SelectionSummary>
        <SummaryTitle>
          Selected {selectedCount} {pluralize('socket', selectedCount)} from {containerName}
        </SummaryTitle>

        {_map(_keys(socketsByRack), (rackId) => (
          <RackGroup key={rackId}>
            <RackGroupTitle>Rack {rackId}</RackGroupTitle>
            <SocketBadgesRow>
              {_map(_sortBy(socketsByRack[rackId], 'socketIndex'), (socket) => (
                <SocketBadge key={`${socket.pduIndex}-${socket.socketIndex}`}>
                  Socket: {socket.socketIndex}
                </SocketBadge>
              ))}
            </SocketBadgesRow>
          </RackGroup>
        ))}
      </SelectionSummary>
    </PanelContainer>
  )
}

export { PowerControlsPanel }
export type { SelectedSocket }

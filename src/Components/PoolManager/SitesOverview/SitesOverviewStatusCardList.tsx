import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import _concat from 'lodash/concat'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _without from 'lodash/without'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SetPoolConfiguration } from './SetPoolConfiguration/SetPoolConfiguration'
import SetPoolConfigurationModal from './SetPoolConfiguration/SetPoolConfigurationModal'
import SitesOverviewStatusCard from './SitesOverviewStatusCard'
import {
  SetPoolConfigurationTabletButton,
  SitesOverviewRow,
  SitesUnitCol,
  SitesUnitWrapper,
  StickyConfigurationCol,
} from './SitesOverviewStatusCardList.styles'

import { getContainerName } from '@/app/utils/containerUtils'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ROUTE } from '@/constants/routes'
import useDeviceResolution from '@/hooks/useDeviceResolution'
import { useSitesOverviewData, type ProcessedContainerUnit } from '@/hooks/useSitesOverviewData'

export const SitesOverviewStatusCardList = () => {
  const [selected, setSelected] = useState<string[]>([])
  const navigate = useNavigate()
  const { isTablet } = useDeviceResolution()

  // Fetch and process all data using custom hook
  const { units, isLoading } = useSitesOverviewData()

  const handleSelect = (id: string) => {
    setSelected((prev: string[]) => (_includes(prev, id) ? _without(prev, id) : _concat(prev, id)))
  }
  const handleCardClick = (unit: string) => navigate(`${ROUTE.POOL_MANAGER_SITES_OVERVIEW}/${unit}`)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const openSidebar = () => {
    setIsSidebarOpen(true)
  }

  const hasSelection = _size(selected) > 0

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <SitesOverviewRow>
          <SitesUnitCol>
            <SitesUnitWrapper>
              {_map(units, (unit: ProcessedContainerUnit) => (
                <SitesOverviewStatusCard
                  key={unit.id}
                  id={unit.id ? Number(unit.id) : 0}
                  unit={getContainerName(unit.info?.container ?? '', unit.type)}
                  pool="-"
                  hashrate={unit.hashrate}
                  miners={unit.miners?.actualMiners ?? 0}
                  overrides={0}
                  onClick={() => handleCardClick(unit.id ?? '')}
                  checked={_includes(selected, unit.id)}
                  onSelect={(e: CheckboxChangeEvent) => {
                    e.stopPropagation()
                    handleSelect(unit.id ?? '')
                  }}
                  status={unit.status}
                  selectable={false}
                />
              ))}
            </SitesUnitWrapper>
          </SitesUnitCol>

          {hasSelection &&
            (isTablet ? (
              <>
                <SetPoolConfigurationTabletButton onClick={openSidebar}>
                  <div>{`${selected.length} Selected unit${selected.length > 1 ? 's' : ''}`}</div>
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
        </SitesOverviewRow>
      )}
    </>
  )
}

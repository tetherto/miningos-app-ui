import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { FC } from 'react'

import { getContainerSpecificStats } from '../../../../../../../app/utils/deviceUtils'
import { DEVICE_STATUS } from '../../../../../../../app/utils/statusUtils'
import { DeviceStatus } from '../../../../../../DeviceStatus/DeviceStatus'
import { BitdeerPumpSegment, CoolingSystemContainer } from '../BitdeerOptions.styles'
import OilPumps from '../OilPumps/OilPumps'
import WaterPumps from '../WaterPumps/WaterPumps'

import { ContainerFansCard } from './ContainerFansCard/ContainerFansCard'
import { CoolerGroupsContainer, PumpsContainer } from './DryCooler.styles'

import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { NoScrollStyledCard } from '@/Components/Explorer/Containers/Container.styles'

const FANS_DATA = [
  { index: 0 },
  { index: 1 },
  { index: 2 },
  { index: 3 },
  { index: 4 },
  { index: 5 },
  { index: 6 },
  { index: 7 },
]

const getEmptyCoolerData = () => [
  {
    index: 0,
    fans: FANS_DATA,
  },
  {
    index: 1,
    fans: FANS_DATA,
  },
]

interface DryCoolerItem {
  index: number
  enabled?: boolean
  fans: Array<{ index: number; enabled?: boolean }>
}

interface DryCoolerProps {
  data?: UnknownRecord
}

interface PumpItem {
  index: number
  enabled?: boolean
}

const DryCooler: FC<DryCoolerProps> = ({ data }) => {
  // Extract cooling system data from container_specific stats
  const coolingSystem = getContainerSpecificStats(data as Device)?.cooling_system as
    | UnknownRecord
    | undefined

  // Extract dry cooler array data
  const dryCoolerDataRaw = _get(coolingSystem, 'dry_cooler')
  const dryCoolerData: DryCoolerItem[] = _isArray(dryCoolerDataRaw) ? dryCoolerDataRaw : []

  // Extract pump arrays (they should be arrays, not booleans)
  const oilPumpRaw = _get(coolingSystem, 'oil_pump')
  const waterPumpRaw = _get(coolingSystem, 'water_pump')
  const oilPump: PumpItem[] = _isArray(oilPumpRaw) ? oilPumpRaw : []
  const waterPump: PumpItem[] = _isArray(waterPumpRaw) ? waterPumpRaw : []

  const getButtonStatus = (enabled: boolean) =>
    enabled ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF

  const getSingleBlankCoolerData = (): DryCoolerItem[] => {
    const firstItem = dryCoolerData[0]
    if (!firstItem) return getEmptyCoolerData()

    return firstItem.index === 0
      ? [
          ...dryCoolerData,
          {
            index: 1,
            fans: FANS_DATA,
          },
        ]
      : [
          {
            index: 0,
            fans: FANS_DATA,
          },
          ...dryCoolerData,
        ]
  }

  const getCurrentCoolerData = (): DryCoolerItem[] =>
    // eslint-disable-next-line no-nested-ternary
    _isEmpty(dryCoolerData)
      ? getEmptyCoolerData()
      : dryCoolerData.length === 1
        ? getSingleBlankCoolerData()
        : dryCoolerData

  return (
    <CoolerGroupsContainer>
      {_map(getCurrentCoolerData(), (dryCoolerItem: DryCoolerItem, index: number) => (
        <BitdeerPumpSegment key={dryCoolerItem.index + ' ' + index}>
          <NoScrollStyledCard $noWrap>
            <CoolingSystemContainer>
              <DeviceStatus
                isRow
                status={getButtonStatus(dryCoolerItem.enabled ?? false)}
                title={`Dry Cooler ${dryCoolerItem.index + 1}`}
                unavailable={!_isBoolean(dryCoolerItem.enabled)}
              />
            </CoolingSystemContainer>
            <ContainerFansCard fansData={dryCoolerItem.fans} />
          </NoScrollStyledCard>
          <PumpsContainer>
            <OilPumps oilPumpItem={oilPump[index] as PumpItem | undefined} />
            <WaterPumps waterPumpItem={waterPump[index] as PumpItem | undefined} />
          </PumpsContainer>
        </BitdeerPumpSegment>
      ))}
    </CoolerGroupsContainer>
  )
}

export default DryCooler

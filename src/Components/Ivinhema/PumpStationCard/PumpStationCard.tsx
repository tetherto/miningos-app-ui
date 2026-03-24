import _map from 'lodash/map'

import { PUMP_STATION_DATA, PUMP_STATION_STATUS_COLORS } from './PumpStationCard.const'
import { PumpStationBody, PumpStationGrid, PumpStationLabel } from './PumpStationCard.styles'
import { PumpStationCardProps } from './PumpStationCard.types'

import ContentPanel from '@/Components/Ivinhema/ContentPanel/ContentPanel'
import DataRow from '@/Components/Ivinhema/DataRow/DataRow'
import EntityHeader from '@/Components/Ivinhema/EntityHeader/EntityHeader'

const PumpStationCard = ({ label }: PumpStationCardProps) => (
  <>
    {label && <PumpStationLabel>{label}</PumpStationLabel>}
    <PumpStationGrid>
      {_map(
        PUMP_STATION_DATA,
        ({ pump_id, pump_name, pump_status, pump_speed, pump_voltage, speed_unit, voltage_unit }) => (
          <ContentPanel key={pump_id}>
            <EntityHeader
              id={pump_id}
              name={pump_name}
              status={pump_status}
              statusColor={PUMP_STATION_STATUS_COLORS[pump_status]}
            />
            <PumpStationBody>
              <DataRow label="Speed" value={`${pump_speed}${speed_unit}`} />
              <DataRow label="Current" value={`${pump_voltage} ${voltage_unit}`} />
            </PumpStationBody>
          </ContentPanel>
        ),
      )}
    </PumpStationGrid>
  </>
)

export default PumpStationCard

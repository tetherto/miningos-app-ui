import _flatMap from 'lodash/flatMap'
import _map from 'lodash/map'

import { COOLING_CARD_DATA } from './CoolingCard.const'
import {
  CcmPower,
  CcmTitle,
  CcmHeader,
  CcmPowerValue,
  CcmPowerUnit,
  CoolingCardWrapper,
} from './CoolingCard.styles'

import { formatNumber } from '@/app/utils/format'
import DataCard from '@/Components/Ivanhema/DataCard/DataCard'

const CoolingCard = () => (
  <>
    {_map(COOLING_CARD_DATA, ({ ccm, total_power_kw, unit, sections }) => {
      const sectionsData = _flatMap(sections, ({ name, total_kw, children }) => ({
        unit,
        title: name,
        power: total_kw,
        children: children,
      }))

      return (
        <CoolingCardWrapper key={ccm}>
          <CcmHeader>
            <CcmTitle>{ccm}</CcmTitle>
            <CcmPowerValue>
              <CcmPower>{formatNumber(total_power_kw, { minimumFractionDigits: 2 })}</CcmPower>
              <CcmPowerUnit>{unit}</CcmPowerUnit>
            </CcmPowerValue>
          </CcmHeader>
          <DataCard data={sectionsData} columns={2} minWidth={400} padding={12} />
        </CoolingCardWrapper>
      )
    })}
  </>
)

export default CoolingCard

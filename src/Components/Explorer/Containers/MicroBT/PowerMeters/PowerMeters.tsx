import _map from 'lodash/map'
import { FC } from 'react'

import { UNITS } from '../../../../../constants/units'
import { getPowerMeterBoxData } from '../../../../../Views/Container/Tabs/ParametersTab/ParametersTab.util'
import { ContentBox } from '../../../../Container/ContentBox/ContentBox'
import { GenericDataBox } from '../../../../Container/ContentBox/GenericDataBox'
import { ContainerPanel } from '../../Container.styles'

import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'

interface PowerMetersProps {
  data?: Device
}

interface PowerMeterData {
  status?: number
  voltage_ab?: number
  voltage_bc?: number
  voltage_ca?: number
  total_power_factor?: number
  freq?: number
  total_active_power?: number
  total_apparent_power?: number
  total_active_energy?: number
}

const PowerMeters: FC<PowerMetersProps> = ({ data }) => {
  if (!data) return null

  const powerMeters = getPowerMeterBoxData(data) as unknown

  const powerMetersBoxData = _map(
    powerMeters as unknown[],
    (powerMeter: unknown, index: number) => {
      const meterTyped = powerMeter as PowerMeterData
      const meterData = [
        {
          label: 'Communication Status',
          value: meterTyped?.status === 1 ? 'Normal' : 'Error',
          units: '',
        },
        { label: 'Voltage A-B', value: meterTyped?.voltage_ab, units: UNITS.VOLTAGE_V },
        { label: 'Voltage B-C', value: meterTyped?.voltage_bc, units: UNITS.VOLTAGE_V },
        { label: 'Voltage C-A', value: meterTyped?.voltage_ca, units: UNITS.VOLTAGE_V },
        {
          label: 'Total Power Factor',
          value: meterTyped?.total_power_factor,
          units: '',
        },
        { label: 'Frequency', value: meterTyped?.freq, units: UNITS.FREQUENCY_HERTZ },
        {
          label: 'Total Active Power',
          value: meterTyped?.total_active_power,
          units: UNITS.POWER_KW,
        },
        {
          label: 'Total Apparent Power',
          value: meterTyped?.total_apparent_power,
          units: UNITS.APPARENT_POWER_KVA,
        },
        {
          label: 'Total Active Energy',
          value: meterTyped?.total_active_energy,
          units: UNITS.ENERGY_KWH,
        },
      ]

      return (
        <ContainerPanel key={index}>
          <ContentBox title={`Power Meter ${index + 1}`}>
            <GenericDataBox data={meterData as unknown as UnknownRecord} />
          </ContentBox>
        </ContainerPanel>
      )
    },
  )

  return <>{powerMetersBoxData}</>
}

export default PowerMeters

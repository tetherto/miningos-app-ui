import Tooltip from 'antd/es/tooltip'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'

import {
  getCabinetTitle,
  getLvCabinetTempSensorColor,
  getRootTempSensorTempValue,
  unitToKilo,
} from '@/app/utils/deviceUtils'
import { formatValueUnit } from '@/app/utils/format'
import { ColoredText, TemperatureCell } from '@/Components/Explorer/List/ListView.styles'
import { BorderedLink } from '@/Components/Explorer/List/LvCabinetCard/LvCabinetCard.styles'
import { TemperatureIndicator } from '@/Components/Explorer/List/MinerCard/Icons/TemperatureIndicator'
import RightNavigateToIcon from '@/Components/Icons/RightNavigateToIcon'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { ROUTE } from '@/constants/routes'
import { UNITS } from '@/constants/units'

interface PowerMeter {
  last?: {
    snap?: {
      stats?: {
        power_w?: number
      }
    }
  }
}

interface LvCabinetRecord {
  id: string
  powerMeters?: PowerMeter[]
}

export const getLvCabinetTableColumns = () => [
  {
    title: 'Cabinet',
    key: 'id',
    dataIndex: 'id',
    render: (_text: string, record: LvCabinetRecord) =>
      getCabinetTitle(record as unknown as import('@/app/utils/deviceUtils/types').Device),
    sorter: (a: LvCabinetRecord, b: LvCabinetRecord) => {
      const aName = getCabinetTitle(a as unknown as import('@/app/utils/deviceUtils/types').Device)
      const bName = getCabinetTitle(b as unknown as import('@/app/utils/deviceUtils/types').Device)
      return aName.localeCompare(bName)
    },
    defaultSortOrder: 'ascend',
  },
  {
    title: 'Temperature',
    dataIndex: 'temperature',
    key: 'temperature',
    width: 140,
    render: (_text: number | undefined, record: LvCabinetRecord) => {
      const temperatureValue = getRootTempSensorTempValue(
        record as unknown as import('@/app/utils/deviceUtils/types').Device,
      ) as number | undefined
      return (
        <Tooltip title="Temperature">
          <TemperatureCell>
            <TemperatureIndicator />
            <ColoredText color={getLvCabinetTempSensorColor(temperatureValue ?? 0)}>
              {!_isNil(temperatureValue) ? `${temperatureValue} ${UNITS.TEMPERATURE_C}` : '-'}{' '}
            </ColoredText>
          </TemperatureCell>
        </Tooltip>
      )
    },
    sorter: (a: LvCabinetRecord, b: LvCabinetRecord) => {
      const aTemp =
        (getRootTempSensorTempValue(
          a as unknown as import('@/app/utils/deviceUtils/types').Device,
        ) as number | undefined) || 0
      const bTemp =
        (getRootTempSensorTempValue(
          b as unknown as import('@/app/utils/deviceUtils/types').Device,
        ) as number | undefined) || 0
      return aTemp - bTemp
    },
  },
  {
    title: 'Consumption',
    dataIndex: 'powerMode',
    key: 'powerMode',
    render: (_text: never, record: LvCabinetRecord) => {
      const powerMode = _head(record?.powerMeters)
      const powerValue = powerMode?.last?.snap?.stats?.power_w
      return formatValueUnit(unitToKilo(_isNumber(powerValue) ? powerValue : 0), UNITS.POWER_KW)
    },
    sorter: (a: LvCabinetRecord, b: LvCabinetRecord) => {
      const aPower = _head(a?.powerMeters)?.last?.snap?.stats?.power_w || 0
      const bPower = _head(b?.powerMeters)?.last?.snap?.stats?.power_w || 0
      return aPower - bPower
    },
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (_text: never, record: LvCabinetRecord) => (
      <BorderedLink
        to={`/cabinets/${record?.id}?backUrl=${ROUTE.OPERATIONS_MINING_EXPLORER}?tab=${CROSS_THING_TYPES.CABINET}`}
      >
        <RightNavigateToIcon />
      </BorderedLink>
    ),
  },
]

import Tooltip from 'antd/es/tooltip'
import _isFinite from 'lodash/isFinite'

import { TAB } from './ListView.const'

import { getContainerName, isContainerOffline } from '@/app/utils/containerUtils'
import { appendContainerToTag, unitToKilo } from '@/app/utils/deviceUtils'
import { formatValueUnit } from '@/app/utils/format'
import { DangerDeviceCardColText, Wrapper } from '@/Components/Explorer/List/ListView.styles'
import { BorderedLink } from '@/Components/Explorer/List/LvCabinetCard/LvCabinetCard.styles'
import AlertTriangle from '@/Components/Explorer/List/MinerCard/Icons/AlertTriangle'
import { MinerStatusIndicatorContainer } from '@/Components/Explorer/List/MinerCard/MinerCard.styles'
import ErrorIcon from '@/Components/Explorer/List/MinerStatusIndicator/Icons/ErrorIcon'
import OfflineIcon from '@/Components/Explorer/List/MinerStatusIndicator/Icons/OfflineIcon'
import { StatusLabel } from '@/Components/Explorer/List/MinerStatusIndicator/MinerStatusIndicator'
import RightNavigateToIcon from '@/Components/Icons/RightNavigateToIcon'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { ROUTE } from '@/constants/routes'
import { UNITS } from '@/constants/units'
import { Device } from '@/types'
import { getAlarms } from '@/Views/Container/Tabs/HomeTab/HomeTab.util'

interface ContainerRecord {
  info?: {
    container?: string
  }
  last?: {
    alerts?: unknown[]
    err?: string
    snap?: Snap
  }
  type?: string
  [key: string]: unknown
}

interface Stats {
  status?: string
  ambient_temp_c?: number
  humidity_percent?: number
  power_w?: number
}

interface Snap {
  stats?: Stats
}

export const getContainerTableColumns = (
  getFormattedDate: (date: Date | number, fixedTimezone?: string, formatString?: string) => string,
) => [
  {
    title: 'Container',
    dataIndex: 'model',
    key: 'model',
    render: (_text: unknown, record: ContainerRecord) => getContainerName(record?.info?.container),
    sorter: (a: ContainerRecord, b: ContainerRecord) => {
      const aName = getContainerName(a?.info?.container)
      const bName = getContainerName(b?.info?.container)
      return aName.localeCompare(bName)
    },
    width: 180,
  },
  {
    title: 'Alarms',
    dataIndex: 'alarms',
    key: 'alarms',
    width: 80,
    render: (_text: unknown, record: ContainerRecord) => {
      const alarmStatus = Array.isArray(record?.last?.alerts) && record.last.alerts.length > 0
      const error = record?.last?.err
      if (!alarmStatus && !error) {
        return ''
      }
      if (alarmStatus) {
        const alarm = getAlarms(record as Device, undefined, getFormattedDate)
        return (
          <Tooltip title={String(alarm || '')}>
            <MinerStatusIndicatorContainer>
              <AlertTriangle />
            </MinerStatusIndicatorContainer>
          </Tooltip>
        )
      }
      if (error) {
        return (
          <Tooltip title={`Error : ${error}`}>
            <StatusLabel $error>
              <ErrorIcon width={14} height={14} />
            </StatusLabel>
          </Tooltip>
        )
      }
      return ''
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (_text: unknown, record: ContainerRecord) => {
      const { snap } = record?.last || {}

      return (
        <Wrapper>
          {isContainerOffline(snap || {}) && (
            <StatusLabel $offline>
              <OfflineIcon width={14} height={14} />
            </StatusLabel>
          )}
          <DangerDeviceCardColText $isContainerOffline={isContainerOffline(snap || {})}>
            {(snap as Snap)?.stats?.status}
          </DangerDeviceCardColText>
        </Wrapper>
      )
    },
  },
  {
    title: 'Temp',
    dataIndex: 'temperatureAmbient',
    key: 'temperatureAmbient',
    width: 80,
    render: (_text: unknown, record: ContainerRecord) => {
      const isValueAvailable = !isContainerOffline(record?.last?.snap || {})

      const value = isValueAvailable
        ? Number((record?.last?.snap as Snap)?.stats?.ambient_temp_c)
        : NaN

      if (!_isFinite(value)) {
        return ''
      }

      return `${value} ${UNITS.TEMPERATURE_C}`
    },
    sorter: (a: ContainerRecord, b: ContainerRecord) => {
      const aTemp = (a?.last?.snap as Snap)?.stats?.ambient_temp_c || 0
      const bTemp = (b?.last?.snap as Snap)?.stats?.ambient_temp_c || 0
      return aTemp - bTemp
    },
  },
  {
    title: 'Humidity',
    dataIndex: 'humidity',
    key: 'humidity',
    width: 100,
    render: (_text: unknown, record: ContainerRecord) => {
      if (!isContainerOffline(record?.last?.snap || {})) {
        return formatValueUnit(
          (record?.last?.snap as Snap)?.stats?.humidity_percent ?? 0,
          UNITS.PERCENT,
        )
      }
      return ''
    },
    sorter: (a: ContainerRecord, b: ContainerRecord) => {
      const aHumidity = (a?.last?.snap as Snap)?.stats?.humidity_percent || 0
      const bHumidity = (b?.last?.snap as Snap)?.stats?.humidity_percent || 0
      return aHumidity - bHumidity
    },
  },
  {
    title: 'Consumption',
    dataIndex: 'consumption',
    key: 'consumption',
    width: 130,
    render: (_text: unknown, record: ContainerRecord) => {
      if (!isContainerOffline(record?.last?.snap || {})) {
        return formatValueUnit(unitToKilo((record?.last?.snap as Snap)?.stats?.power_w ?? 0), 'kW')
      }
      return ''
    },
    sorter: (a: ContainerRecord, b: ContainerRecord) => {
      const aPower = (a?.last?.snap as Snap)?.stats?.power_w || 0
      const bPower = (b?.last?.snap as Snap)?.stats?.power_w || 0
      return aPower - bPower
    },
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    width: 80,
    render: (_text: unknown, record: ContainerRecord) => {
      if (isContainerOffline(record?.last?.snap || {})) {
        return null
      }

      const detailsSlug = appendContainerToTag(record?.info?.container || '')

      const detailsTab = 'home'

      const backPath = `${ROUTE.OPERATIONS_MINING_EXPLORER}?${TAB}=${CROSS_THING_TYPES.CONTAINER}`

      return (
        <BorderedLink
          to={`${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${detailsSlug}/${detailsTab}?backUrl=${backPath}`}
        >
          <RightNavigateToIcon />
        </BorderedLink>
      )
    },
  },
]

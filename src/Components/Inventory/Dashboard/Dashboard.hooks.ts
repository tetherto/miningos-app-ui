import _countBy from 'lodash/countBy'
import _find from 'lodash/find'
import _fromPairs from 'lodash/fromPairs'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _reduce from 'lodash/reduce'
import _reject from 'lodash/reject'
import _size from 'lodash/size'
import _startsWith from 'lodash/startsWith'
import _sum from 'lodash/sum'
import _sumBy from 'lodash/sumBy'
import _uniq from 'lodash/uniq'
import _values from 'lodash/values'

import {
  useGetListThingsQuery,
  useGetMultiTailLogQuery,
  useGetSiteQuery,
  useGetTailLogQuery,
} from '../../../app/services/api'
import { formatNumber } from '../../../app/utils/format'
import { getLocationLabel } from '../../../app/utils/inventoryUtils'
import { TIME } from '../../../constants'
import { STAT_5_MINUTES, STAT_REALTIME } from '../../../constants/tailLogStatKeys.constants'
import { useHeaderStats } from '../../../hooks/useHeaderStats'
import useSubtractedTime from '../../../hooks/useSubtractedTime'
import { MINER_LOCATIONS, MINER_STATUS_NAMES, MINER_STATUSES } from '../Miners/Miners.constants'
import {
  SPARE_PART_STATUS_NAMES,
  SPARE_PART_STATUSES,
  SparePartTypes,
} from '../SpareParts/SpareParts.constants'

import {
  ALL_MINERS,
  MINER_LOCATION_PIE_CHART_COLORS,
  MINER_STATUS_PIE_CHART_COLORS,
  MINERS_MULTI_TAIL_LOG_QUERY_ORDER,
  SPARE_PART_STATUS_PIE_CHART_COLORS,
  SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER,
} from './Dashboard.constants'

import { SOCKET_STATUSES } from '@/app/utils/statusUtils'
import {
  getContainerMinersChartData,
  MinerTailLogItem,
} from '@/Views/ContainerWidgets/ContainerWidget.util'

interface Container {
  tags?: string[]
  info?: {
    container?: string
    nominalMinerCapacity?: number
  }
  [key: string]: unknown
}

const getInstalledMinerTypeFromContainer = (container: Container): string | undefined => {
  const minerTag = _find(container.tags || [], (tag: string) => _startsWith(tag, 'container_miner'))

  if (!minerTag || !_isString(minerTag)) {
    return undefined
  }

  // Pattern: container_miner-{container-type}_{miner-manufacturer}-{miner-model}
  // e.g. container_miner-mbt-kehua_wm-m53s -> miner-wm-m53s
  // e.g. container_miner-as-immersion_am-s19xp -> miner-am-s19xp
  const minerTagRegex = /container_miner-[^_]+_(.+)/
  const match = minerTag.match(minerTagRegex)

  if (!match) {
    return undefined
  }

  // match[1] contains the miner type part (e.g. "wm-m53s" or "am-s19xp")
  return `miner-${match[1]}`
}

interface MinerCapacityResult {
  [minerType: string]: {
    total: number
    available: number
  }
}

const getMinerCapacity = (
  containersData: Container[] | undefined,
  minerTailLogData: unknown[] | undefined,
): MinerCapacityResult =>
  _reduce(
    containersData || [],
    (result: MinerCapacityResult, container: Container) => {
      const containerMinerType = getInstalledMinerTypeFromContainer(container)
      if (!containerMinerType) {
        return result
      }

      const containerCapacityNum = _get(container, ['info', 'nominalMinerCapacity'], 0)
      const containerCapacity = _isNumber(containerCapacityNum)
        ? containerCapacityNum
        : parseInt(String(containerCapacityNum), 10)
      const minerData = getContainerMinersChartData(
        container.info?.container as string,
        _head(minerTailLogData as MinerTailLogItem[]) ?? ({} as MinerTailLogItem),
        container?.info?.nominalMinerCapacity as number,
      )
      const availableCapacity = _get(minerData, SOCKET_STATUSES.MINER_DISCONNECTED, 0)

      if (_isNil(result[containerMinerType])) {
        result[containerMinerType] = { total: 0, available: 0 }
      }

      result[containerMinerType].total = (result[containerMinerType].total || 0) + containerCapacity
      result[containerMinerType].available =
        (result[containerMinerType].available || 0) + availableCapacity

      return result
    },
    {} as MinerCapacityResult,
  )

export const useDashboardData = () => {
  const { minersAmount, isLoading: minersAmountLoading } = useHeaderStats()
  const { data: siteData } = useGetSiteQuery({})
  const currentSite = _get(siteData, ['site'])

  const startTime = useSubtractedTime(TIME.TEN_MINS, TIME.ONE_MIN)

  const { data: minersData, isLoading: isMinersDataLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      $and: [{ 'info.site': { $eq: currentSite } }, { tags: { $in: ['t-miner'] } }],
    }),
    fields: JSON.stringify({
      id: 1,
      type: 1,
    }),
  })

  const { data: minerStatsData, isLoading: isMinerStatsDataLoading } = useGetMultiTailLogQuery({
    keys: JSON.stringify(
      _map(_keys(MINERS_MULTI_TAIL_LOG_QUERY_ORDER), (type: string) => ({
        key: STAT_5_MINUTES,
        type: 'miner',
        tag: `t-${type}`,
      })),
    ),
    limit: 1,
    start: startTime,
    aggrFields: JSON.stringify({
      miner_inventory_status_group_cnt_aggr: 1,
      miner_inventory_location_group_cnt_aggr: 1,
    }),
  })

  const { data: sparePartsStatsData, isLoading: isSparePartsStatsDataLoading } =
    useGetMultiTailLogQuery({
      keys: JSON.stringify(
        _map(_keys(SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER), (type: string) => ({
          key: STAT_5_MINUTES,
          type: 'inventory',
          tag: `t-${type}`,
        })),
      ),
      limit: 1,
      start: startTime,
      aggrFields: JSON.stringify({
        spare_parts_cnt_aggr: 1,
        spare_part_inventory_status_group_cnt_aggr: 1,
      }),
    })

  const { data: containersData, isLoading: isContainersDataLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      tags: { $in: ['t-container'] },
    }),
    fields: JSON.stringify({
      tags: 1,
      'info.container': 1,
      'info.nominalMinerCapacity': 1,
    }),
  })

  const { data: minerTailLogData, isLoading: isMinerTailLogLoading } = useGetTailLogQuery({
    key: STAT_REALTIME,
    type: 'miner',
    tag: 't-miner',
    limit: 1,
    start: startTime,
  })

  const minersDataArray = Array.isArray(minersData) ? minersData : []
  const minersTotal = _size(_head(minersDataArray))
  const minersType = _uniq(
    _map(_head(minersDataArray) as Array<{ type?: string }> | undefined, 'type'),
  )

  const minerStatsDataArray = Array.isArray(minerStatsData) ? minerStatsData : []
  const knownStatusMinersTotal = _sum(
    _values(
      _omit(
        _get(
          _head(minerStatsDataArray) as Record<string, unknown> | undefined,
          [
            MINERS_MULTI_TAIL_LOG_QUERY_ORDER[ALL_MINERS],
            '0',
            'miner_inventory_status_group_cnt_aggr',
          ],
          {},
        ),
        [MINER_STATUSES.UNKNOWN],
      ),
    ),
  )

  const sparePartsStatsDataArray = Array.isArray(sparePartsStatsData) ? sparePartsStatsData : []
  const controlBoardTotal = _sum(
    _values(
      _omit(
        _get(
          _head(sparePartsStatsDataArray) as Record<string, unknown> | undefined,
          [
            SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER[SparePartTypes.CONTROLLER],
            '0',
            'spare_part_inventory_status_group_cnt_aggr',
          ],
          {},
        ),
        [SPARE_PART_STATUSES.UNKNOWN],
      ),
    ),
  )

  const psuTotal = _sum(
    _values(
      _omit(
        _get(
          _head(sparePartsStatsDataArray) as Record<string, unknown> | undefined,
          [
            SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER[SparePartTypes.PSU],
            '0',
            'spare_part_inventory_status_group_cnt_aggr',
          ],
          {},
        ),
        [SPARE_PART_STATUSES.UNKNOWN],
      ),
    ),
  )

  const hashboardTotal = _sum(
    _values(
      _omit(
        _get(
          _head(sparePartsStatsDataArray) as Record<string, unknown> | undefined,
          [
            SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER[SparePartTypes.HASHBOARD],
            '0',
            'spare_part_inventory_status_group_cnt_aggr',
          ],
          {},
        ),
        [SPARE_PART_STATUSES.UNKNOWN],
      ),
    ),
  )

  const getSparePartClassificationDataset = (sparePartType: string) =>
    _fromPairs(
      _map(
        _reject(_values(SPARE_PART_STATUSES), (status) => status === SPARE_PART_STATUSES.UNKNOWN),
        (status: string) => [
          SPARE_PART_STATUS_NAMES[status as keyof typeof SPARE_PART_STATUS_NAMES],
          {
            color:
              SPARE_PART_STATUS_PIE_CHART_COLORS[
                status as keyof typeof SPARE_PART_STATUS_PIE_CHART_COLORS
              ],
            value: _get(
              _head(sparePartsStatsDataArray) as Record<string, unknown> | undefined,
              [
                SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER[sparePartType],
                '0',
                'spare_part_inventory_status_group_cnt_aggr',
                status,
              ],
              0,
            ),
          },
        ],
      ),
    )

  const getMinerStatusClassificationDataset = () =>
    _fromPairs(
      _map(
        _reject(_values(MINER_STATUSES), (status) => status === MINER_STATUSES.UNKNOWN),
        (status: string) => [
          MINER_STATUS_NAMES[status as keyof typeof MINER_STATUS_NAMES],
          {
            color:
              MINER_STATUS_PIE_CHART_COLORS[status as keyof typeof MINER_STATUS_PIE_CHART_COLORS],
            value: _get(
              _head(minerStatsDataArray) as Record<string, unknown> | undefined,
              [
                MINERS_MULTI_TAIL_LOG_QUERY_ORDER[ALL_MINERS],
                '0',
                'miner_inventory_status_group_cnt_aggr',
                status,
              ],
              0,
            ),
          },
        ],
      ),
    )

  const getMinerLocationClassificationDataset = () =>
    _fromPairs(
      _map(
        _reject(_values(MINER_LOCATIONS), (loc) => loc === MINER_LOCATIONS.UNKNOWN),
        (location: string) => [
          getLocationLabel(location),
          {
            color:
              MINER_LOCATION_PIE_CHART_COLORS[
                location as keyof typeof MINER_LOCATION_PIE_CHART_COLORS
              ],
            value: _get(
              _head(minerStatsDataArray) as Record<string, unknown> | undefined,
              [
                MINERS_MULTI_TAIL_LOG_QUERY_ORDER[ALL_MINERS],
                '0',
                'miner_inventory_location_group_cnt_aggr',
                location,
              ],
              0,
            ),
          },
        ],
      ),
    )

  const minerLocationsTotal = _sumBy(_values(getMinerLocationClassificationDataset()), 'value')

  const inventoryClassification = [
    {
      label: 'Miner statuses',
      dataset: getMinerStatusClassificationDataset(),
      value: formatNumber(knownStatusMinersTotal),
    },
    {
      label: 'Miner locations',
      dataset: getMinerLocationClassificationDataset(),
      value: formatNumber(minerLocationsTotal),
    },
    {
      label: 'Control boards',
      dataset: getSparePartClassificationDataset(SparePartTypes.CONTROLLER),
      value: formatNumber(controlBoardTotal),
    },
    {
      label: 'PSUs',
      dataset: getSparePartClassificationDataset(SparePartTypes.PSU),
      value: formatNumber(psuTotal),
    },
    {
      label: 'Hashboards',
      dataset: getSparePartClassificationDataset(SparePartTypes.HASHBOARD),
      value: formatNumber(hashboardTotal),
    },
  ]

  const minersCapacity =
    isContainersDataLoading || isMinerTailLogLoading
      ? {}
      : (() => {
          // containersData is nested array [[containers...]], extract the first array
          const containersArray = _isArray(containersData) ? _head(containersData) : undefined
          const tailLogArray = _isArray(minerTailLogData) ? minerTailLogData : undefined
          return getMinerCapacity(containersArray as Container[] | undefined, tailLogArray)
        })()

  const minersCountByType = _countBy(
    _head(minersDataArray) as Array<{ type?: string }> | undefined,
    'type',
  )

  const minerDistribution =
    isMinerStatsDataLoading || isContainersDataLoading || isMinerTailLogLoading
      ? []
      : (() => {
          const knownLocations = _reject(
            _values(MINER_LOCATIONS),
            (loc) => loc === MINER_LOCATIONS.UNKNOWN,
          )

          return _map(minersType, (type: string) => {
            const locationCounts = _fromPairs(
              _map(knownLocations, (location: string) => [
                location,
                _get(
                  _head(minerStatsDataArray) as Record<string, unknown> | undefined,
                  [
                    (MINERS_MULTI_TAIL_LOG_QUERY_ORDER as Record<string, number>)[type] ?? type,
                    '0',
                    'miner_inventory_location_group_cnt_aggr',
                    location,
                  ],
                  0,
                ) as number,
              ]),
            )

            const knownLocationsSum = _sum(_values(locationCounts))
            const totalMinersOfType = _get(minersCountByType, type, 0)
            const unknownCount = Math.max(0, totalMinersOfType - knownLocationsSum)

            return {
              miner: type,
              totalPositions: _get(minersCapacity, [type, 'total']),
              freePositions: _get(minersCapacity, [type, 'available']),
              ...locationCounts,
              [MINER_LOCATIONS.UNKNOWN]: unknownCount,
            }
          })
        })()

  const isLoading =
    minersAmountLoading ||
    isMinerStatsDataLoading ||
    isSparePartsStatsDataLoading ||
    isMinerTailLogLoading ||
    isContainersDataLoading ||
    isMinersDataLoading

  return {
    isLoading,
    minersAmount,
    minersTotal,
    controlBoardTotal,
    psuTotal,
    hashboardTotal,
    minerLocationsTotal,
    inventoryClassification,
    minerDistribution,
    isMinersDataLoading,
  }
}

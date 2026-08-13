import _flatMap from 'lodash/flatMap'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _replace from 'lodash/replace'
import _toLower from 'lodash/toLower'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { MAINTENANCE_CONTAINER, NO_MAINTENANCE_CONTAINER } from '@/constants/containerConstants'

const THING_SEARCH_ATTRIBUTES = [
  'type',
  'info.site',
  'info.container',
  'info.pos',
  'info.serialNum',
  'info.serialNumber',
  'info.address',
  'info.macAddress',
  'info.location',
  'info.status',
  'id',
  'code',
]

const INVENTORY_SEARCH_ATTRIBUTES = [
  ...THING_SEARCH_ATTRIBUTES,
  'info.parentDeviceSN',
  'info.parentDeviceCode',
  'info.parentDeviceId',
  'info.parentDeviceModel',
  'info.parentDeviceType',
  'info.subType',
]

/**
 * @param filterTags - list of tags
 * @param allowEmptyArray - should filter if empty array.
 * @returns {String}
 */
export const getByTagsQuery = (filterTags: string[], allowEmptyArray?: boolean): string => {
  if (_isEmpty(filterTags) && !allowEmptyArray) {
    return '{}'
  }
  return JSON.stringify({ tags: { $in: filterTags } })
}

/**
 * @param filterTags - list of tags
 * @returns {String}
 */
export const getByTagsWithAlertsQuery = (
  filterTags: string[],
  allowEmptyArray?: boolean,
): string => {
  const hasTags = !_isEmpty(filterTags)

  let query: UnknownRecord = {
    'last.alerts': { $ne: null },
  }

  if (hasTags || allowEmptyArray) {
    query = {
      $or: [
        query,
        {
          'last.alerts.name': {
            $in: filterTags,
          },
        },
        getFiltersQuery(filterTags),
      ],
    }
  }

  return JSON.stringify(query)
}

/**
 * @param filterTags - list of tags
 * @returns {String}
 */
export const getByTagsWithCriticalAlertsQuery = (
  filterTags: string[],
  allowEmptyArray?: boolean,
): string => {
  if (_isEmpty(filterTags) && !allowEmptyArray) {
    return JSON.stringify({
      'last.alerts': {
        $elemMatch: {
          severity: 'critical',
        },
      },
    })
  }

  return JSON.stringify({
    tags: {
      $in: filterTags,
    },
    'last.alerts': {
      $elemMatch: {
        severity: 'critical',
      },
    },
  })
}

/**
 * @param filterTypes - list of types
 * @param allowEmptyArray - should filter if empty array.
 * @returns {String}
 */
export const getByTypesQuery = (filterTypes: string[], allowEmptyArray?: boolean): string => {
  if (_isEmpty(filterTypes) && !allowEmptyArray) {
    return '{}'
  }
  return JSON.stringify({ type: { $in: filterTypes } })
}

interface FilterAttribute {
  attribute: string
  values: (string | boolean)[]
}

/**
 * @param filterAttributes - list of objects having attribute and array of values to filter
 * @param selectedTypes - list of strings having types of selected devices to filter
 * @param allowEmptyArray - should filter if empty array.
 * @returns {Object}
 */
export const getByThingsAttributeQuery = (
  filterAttributes: FilterAttribute[],
  selectedTypes: string[],
  allowEmptyArray?: boolean,
): UnknownRecord => {
  if (_isEmpty(filterAttributes) && !allowEmptyArray) {
    return {}
  }

  const query = _map(filterAttributes, (filterAttribute: FilterAttribute) => {
    if (filterAttribute.attribute === 'last.alerts') {
      if (_head(filterAttribute.values)) {
        return { [`${filterAttribute.attribute}.0`]: { $exists: true } }
      }
      if (_head(filterAttribute.values) === false) {
        return { [`${filterAttribute.attribute}.0`]: { $exists: false } }
      }
      return {}
    }
    if (filterAttribute.attribute === 'info.container') {
      if ((filterAttribute.values?.length ?? 0) > 1) {
        return {}
      }
      if (_head(filterAttribute.values) === NO_MAINTENANCE_CONTAINER) {
        return { [filterAttribute.attribute]: { $ne: MAINTENANCE_CONTAINER } }
      }
    }
    if (filterAttribute.attribute === 'info.macAddress') {
      const macAddresses = filterAttribute.values as string[]
      const macRegexQuery = _map(macAddresses, (mac: string) => ({
        'info.macAddress': { $regex: `^${mac}$`, $options: 'i' },
      }))
      return { $or: macRegexQuery }
    }

    if (filterAttribute.attribute === 'tags') {
      const searchAttributes = [
        ...(_includes(selectedTypes, 't-miner') ||
        _includes(selectedTypes, 't-container') ||
        _includes(selectedTypes, 't-powermeter') ||
        _includes(selectedTypes, 't-sensor')
          ? THING_SEARCH_ATTRIBUTES
          : []),
        ...(_includes(selectedTypes, 't-inventory-miner_part') ? INVENTORY_SEARCH_ATTRIBUTES : []),
      ]
      const allAttributesRegexQuery = _flatMap(filterAttribute.values ?? [], (value: unknown) =>
        _map(searchAttributes, (attribute: string) => ({
          [attribute]: { $regex: `${value}`, $options: 'i' },
        })),
      )
      const fullOrQuery = [
        ...allAttributesRegexQuery,
        {
          [filterAttribute.attribute]: {
            $in: filterAttribute.values,
          },
        },
      ]

      return {
        $or: fullOrQuery,
      }
    }

    return { [filterAttribute.attribute]: { $in: filterAttribute.values } }
  })
  return { $and: query }
}

/**
 * @param ids - list of ids
 * @param allowEmptyArray - should filter if empty array.
 * @returns {String}
 */
export const getByIdsQuery = (ids: string[], allowEmptyArray?: boolean): string => {
  if (_isEmpty(ids) && !allowEmptyArray) {
    return '{}'
  }
  return JSON.stringify({ id: { $in: ids } })
}

/**
 * @param filterTags - list of tags
 * @param allowEmptyArray - should filter if empty array.
 * @returns {String}
 */
export const getContainerByContainerTagsQuery = (
  filterTags: string[],
  allowEmptyArray?: boolean,
): string => {
  if (_isEmpty(filterTags) && !allowEmptyArray) {
    return '{}'
  }
  return JSON.stringify({
    $and: [{ tags: { $in: filterTags } }, { tags: { $in: ['t-container'] } }],
  })
}

/**
 * @param filterTags - list of tags
 * @param allowEmptyArray - should filter if empty array.
 * @returns {String}
 */
export const getMinersByContainerTagsQuery = (
  filterTags: string[],
  allowEmptyArray?: boolean,
): string => {
  if (_isEmpty(filterTags) && !allowEmptyArray) {
    return ''
  }
  return JSON.stringify({
    $and: [{ tags: { $in: filterTags } }, { tags: { $in: ['t-miner'] } }],
  })
}

export const getSitePowerMeterQuery = (): string =>
  JSON.stringify({
    $and: [{ 'info.pos': { $eq: 'site' } }, { tags: { $in: ['t-powermeter'] } }],
  })

/**
 * @param root - root for lv cabinet
 * @returns {String}
 */
export const getLvCabinetDevicesByRoot = (root: string): string =>
  JSON.stringify({
    $and: [
      { 'info.pos': { $regex: `${root}` } },
      { tags: { $in: ['t-powermeter', 't-sensor-temp'] } },
    ],
  })

/**
 * @param uuid - Alert uuid for filter
 * @returns {String}
 */
export const getDeviceByAlertId = (uuid: string): string =>
  JSON.stringify({
    'last.alerts': {
      $elemMatch: {
        uuid: `${uuid}`,
      },
    },
  })

interface PartitionedTags {
  tags: string[]
  ip: string[]
  mac: string[]
  sn: string[]
  firmware: string[]
}

const partitionTagsIntoTagsAndAttributes = (filterTags: string[] = []): PartitionedTags => {
  const attributeRegexp = /^(ip|mac|sn|firmware)-/

  return _reduce<string, PartitionedTags>(
    filterTags,
    (groupedArrays: PartitionedTags, tag: string) => {
      const key = tag.match(attributeRegexp)?.[1]
      if (key) {
        groupedArrays[key as keyof Omit<PartitionedTags, 'tags'>].push(
          _replace(tag, attributeRegexp, ''),
        )
      } else {
        groupedArrays.tags.push(tag)
      }
      return groupedArrays
    },
    { tags: [], ip: [], mac: [], sn: [], firmware: [] } as PartitionedTags,
  )
}

export const getListQuery = (
  filterTags: string[],
  filters?: Record<string, string[]>,
  selectedTypes: string[] = ['t-container'],
): string => {
  const partitionedTags = partitionTagsIntoTagsAndAttributes(filterTags)
  const queryArray: FilterAttribute[] = []

  if (!_isEmpty(filters)) {
    _map(_keys(filters), (attribute: unknown) =>
      queryArray.push({ attribute: attribute as string, values: filters![attribute as string] }),
    )
  }

  if (!_isEmpty(partitionedTags.ip)) {
    queryArray.push({
      attribute: 'opts.address',
      values: partitionedTags.ip,
    })
  }
  if (!_isEmpty(partitionedTags.mac)) {
    const values = _map(partitionedTags.mac, (address: string) => _toLower(address))
    queryArray.push({
      attribute: 'info.macAddress',
      values,
    })
  }
  if (!_isEmpty(partitionedTags.sn)) {
    queryArray.push({
      attribute: 'info.serialNum',
      values: partitionedTags.sn,
    })
  }
  if (!_isEmpty(partitionedTags.firmware)) {
    queryArray.push({
      attribute: 'last.snap.config.firmware_ver',
      values: partitionedTags.firmware,
    })
  }
  if (!_isEmpty(partitionedTags.tags)) {
    queryArray.push({
      attribute: 'tags',
      values: partitionedTags.tags,
    })
  }

  return JSON.stringify({
    $and: [
      getByThingsAttributeQuery(queryArray, selectedTypes),
      {
        tags: {
          $in: selectedTypes,
        },
      },
    ],
  })
}

export const getFiltersQuery = (
  filterTags?: string[],
  filters?: Record<string, string[]>,
  selectedTypes: string[] = ['t-container'],
): UnknownRecord => {
  const query = JSON.parse(getListQuery(filterTags ?? [], filters, selectedTypes))
  return query ? query : {}
}

export const CONTAINER_LIST_THINGS_LIMIT = 1000

/**
 * @param filterTags - list of tags
 * @param allowEmptyArray - should filter if empty array.
 * @returns {String}
 */
export const getContainerMinersByContainerTagsQuery = (
  filterTags: string[],
  allowEmptyArray?: boolean,
): string => {
  if (_isEmpty(filterTags) && !allowEmptyArray) {
    return '{}'
  }
  return JSON.stringify({
    $and: [{ tags: { $in: filterTags } }, { tags: { $in: ['t-miner'] } }],
  })
}

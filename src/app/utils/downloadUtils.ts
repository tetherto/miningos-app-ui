import _assign from 'lodash/assign'
import _filter from 'lodash/filter'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import _join from 'lodash/join'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _replace from 'lodash/replace'
import _some from 'lodash/some'
import _startsWith from 'lodash/startsWith'
import _toPairs from 'lodash/toPairs'

import { notifyError } from './NotificationService'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const downloadFileFromData = (
  data: string | object,
  type: string,
  fileName: string,
): void => {
  const blobData = _isString(data) ? data : JSON.stringify(data)
  const blob = new Blob([blobData], { type })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)

  link.download = fileName

  document.body.appendChild(link)
  link.click()

  URL.revokeObjectURL(url)
  document.body.removeChild(link)
}

const flattenObject = (obj: UnknownRecord, parentKey = ''): UnknownRecord => {
  let result: UnknownRecord = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key

      if (_isObject(obj[key]) && !_isArray(obj[key])) {
        _assign(result, flattenObject(obj[key] as UnknownRecord, newKey))
      } else {
        result[newKey] = obj[key]
      }
    }
  }
  return result
}

/**
 * Convert a objects to a CSV string
 * @param {Array} collection - Collection of objects to convert to CSV
 * @param {Array} fieldsToIgnore - Array of field names to ignore in the CSV, also ignore any fields starting with the field name followed by a dot
 * @returns {String} CSV string
 */
export const collectionToCSV = (
  collection: UnknownRecord[],
  fieldsToIgnore: string[] = [],
): string => {
  let csv = ''

  try {
    // Collect keys from all records including nested objects
    const fields =
      collection.length > 0
        ? _filter(
            _keys(flattenObject(collection[0])),
            (item: string) =>
              !_some(
                fieldsToIgnore,
                (filterStr: string) => item === filterStr || _startsWith(item, `${filterStr}.`),
              ),
          )
        : []

    // order fields to start with id or ts
    fields.sort((a, b) => {
      if (a === 'id' || a === 'ts') return -1
      if (b === 'id' || b === 'ts') return 1
      return 0
    })

    const headers = _join(
      _map(fields, (key: string) => _replace(key, /"/g, '""')),
      ',',
    )

    const convertObjectToString = (object: UnknownRecord): string =>
      `{${_join(
        _map(_toPairs(object), ([k, v]) => `${k}: ${v}`),
        ', ',
      )}}`

    const extractKeyValues = (record: UnknownRecord): string => {
      const flatRecord = flattenObject(record)
      return _join(
        _map(fields, (key: string) => {
          let value = flatRecord[key]
          if (_isArray(value)) {
            value = _map(value, (item: number) => {
              if (_isObject(item)) {
                return convertObjectToString(item as UnknownRecord)
              }
              return item
            }).join('; ')
          } else if (_isObject(value)) {
            value = convertObjectToString(value as UnknownRecord)
          } else {
            value = value ? _replace(value.toString(), /"/g, '""') : ''
          }
          return `"${value}"`
        }),
        ',',
      )
    }

    csv = _reduce(
      collection,
      (acc: string, record: UnknownRecord) => `${acc}\n${extractKeyValues(record)}`,
      `${headers}`,
    )
  } catch (exception) {
    notifyError(
      'Export to CSV failed. Please, try again later.',
      (exception as { error?: string; message?: string })?.error ||
        (exception as { message?: string })?.message ||
        '',
    )
  } finally {
    // Return the CSV content
  }
  return csv
}

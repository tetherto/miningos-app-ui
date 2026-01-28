import _compact from 'lodash/compact'
import _filter from 'lodash/filter'
import _flatten from 'lodash/flatten'
import _groupBy from 'lodash/groupBy'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reject from 'lodash/reject'
import _slice from 'lodash/slice'
import _entries from 'lodash/toPairs'
import _uniqBy from 'lodash/uniqBy'
import _values from 'lodash/values'
import { nanoid } from 'nanoid'
import * as yup from 'yup'

import {
  CSV_PART_TYPE_TO_SPARE_PART_TYPE,
  SPARE_PART_STATUSES,
  SPARE_PART_TYPE_TO_CSV_PART_TYPE,
  SparePartTypes,
} from '../SpareParts.constants'
import {} from '../SpareParts.utils'

import { ACTION_TYPES, BATCH_ACTION_TYPES } from '@/constants/actions'
import { MINER_BRAND_NAMES } from '@/constants/deviceConstants'
import { INVALID_MAC_ADDRESS_ERROR } from '@/constants/errors'
import { isValidMacAddress } from '@/Views/Container/Tabs/PduTab/AddReplaceMinerDialog/helper'

export const MAX_CSV_ITEMS = 50

const csvRecordSchema = yup.object({
  partType: yup.string().required().trim().oneOf(_values(SPARE_PART_TYPE_TO_CSV_PART_TYPE)),
  parentDeviceModel: yup.string().required().trim().oneOf(_keys(MINER_BRAND_NAMES)),
  model: yup
    .string()
    .required()
    .trim()
    .test('valid-model', 'invalid model', (value, ctx) => {
      const partType = ctx.parent.partType as string
      const validModels = ctx.options.context?.subPartTypes?.[partType] ?? new Set()
      const valid = validModels.has(value)
      if (!valid) {
        throw ctx.createError({
          path: ctx.path,
          message: `${ctx.path} should be one of ${JSON.stringify([...validModels])}`,
        })
      }
      return true
    }),
  serialNum: yup.string().trim().required(),
  macAddress: yup
    .string()
    .trim()
    .when(['partType'], ([partType], schema) => {
      const isController =
        (partType as string) === SPARE_PART_TYPE_TO_CSV_PART_TYPE[SparePartTypes.CONTROLLER]
      return isController
        ? schema
            .required()
            .test(
              'is-valid-mac',
              '${path} ' + INVALID_MAC_ADDRESS_ERROR,
              (value: string | undefined) => !value || isValidMacAddress(value),
            )
        : schema
    }),
  status: yup
    .string()
    .trim()
    .required()
    .oneOf(
      _reject(
        _values(SPARE_PART_STATUSES),
        (value: string) => value === SPARE_PART_STATUSES.UNKNOWN,
      ),
    ),
  location: yup
    .string()
    .trim()
    .required()
    .test('valid-location', 'invalid location', (value, ctx) => {
      const locations = ctx.options.context?.locations ?? []
      const valid = _includes(locations, value)
      if (!valid) {
        throw ctx.createError({
          path: ctx.path,
          message: `${ctx.path} should be one of ${JSON.stringify(locations)}`,
        })
      }
      return true
    }),
  comment: yup.string().trim(),
})

export const validationSchema = yup
  .array()
  .of(
    csvRecordSchema.nullable().test('first-nullable', 'record can not be null', (value, ctx) => {
      if (ctx.path !== '[0]') {
        return !_isNil(value)
      }
      return _isNil(value)
    }),
  )
  .min(2, 'At least 1 record needed') // 1 for null to adjust index in error message, 1 actual record. Total 2
  .max(MAX_CSV_ITEMS + 1, 'Max items allowed in the CSV file is 50')
  .test('duplicate-sn', 'Duplicates detected in provided serial numbers', (value: unknown) => {
    const valueArray = value as Array<{ serialNum?: string } | null> | undefined
    if (!valueArray) return true
    const records = _slice(valueArray, 1) // Remove 1st null item
    return _uniqBy(records, 'serialNum').length === records.length
  })
  .test('duplicate-mac', 'Duplicates detected in provided mac addresses', (value: unknown) => {
    const valueArray = value as Array<{ partType?: string } | null> | undefined
    if (!valueArray) return true
    const controllers = _filter(valueArray, (item: { partType?: string } | null) =>
      item && item.partType
        ? (CSV_PART_TYPE_TO_SPARE_PART_TYPE as Record<string, string>)[item.partType] ===
          SparePartTypes.CONTROLLER
        : false,
    )
    return _uniqBy(controllers, 'macAddress').length === controllers.length
  })

export interface CSVRecord {
  partType?: string
  serialNum?: string
  macAddress?: string
  [key: string]: unknown
}

export class CsvDuplicateRecordError extends Error {
  constructor(...params: unknown[]) {
    super(...(params as [string?]))

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CsvDuplicateRecordError)
    }

    this.name = 'CsvDuplicateRecordError'
  }
}

interface ValidateCSVRecordsOptions {
  checkDuplicateDelegate: (params: {
    rackId: string
    serialNum: string[]
    macAddress?: string[]
  }) => Promise<unknown[]>
  rackIds: Record<string, string>
}

export async function validateCSVRecords(
  records: CSVRecord[],
  context: { subPartTypes?: Record<string, Set<string>>; locations?: string[] },
  { checkDuplicateDelegate, rackIds }: ValidateCSVRecordsOptions,
) {
  const validationPayload = [null, ...records] // To make validation errors start with idx 1
  await validationSchema.validate(validationPayload, {
    context,
  })
  const validatedRecords = _map(
    _slice(validationSchema.cast(validationPayload) as Array<CSVRecord | null>, 1),
    (record: CSVRecord | null) => ({
      ...(record as Record<string, unknown>),
      rackId: rackIds[record?.partType ?? ''],
    }),
  )

  const rackIdWiseRecords = _groupBy(validatedRecords, 'rackId')

  const checkDuplicateResults = await Promise.all(
    _map(_entries(rackIdWiseRecords), ([rackId, records]: [string, CSVRecord[]]) => {
      const isController = _includes(rackId, SparePartTypes.CONTROLLER)

      const serialNum = _map(records, ({ serialNum }: CSVRecord) => serialNum).filter(
        (s): s is string => s !== undefined,
      )
      const macAddress = _map(records, ({ macAddress }: CSVRecord) => macAddress).filter(
        (m): m is string => m !== undefined,
      )
      return checkDuplicateDelegate({
        rackId,
        serialNum,
        macAddress: isController ? macAddress : undefined,
      })
    }),
  )

  const duplicates = _flatten(checkDuplicateResults)

  if (!_isEmpty(_compact(duplicates))) {
    throw new CsvDuplicateRecordError(
      'CSV has conflicting serial numbers or MAC addresses with existing data',
    )
  }

  return validatedRecords
}

export const createBulkUploadAction = (records: CSVRecord[], currentSite: string) => {
  const sparePartActions = _map(records, (part: CSVRecord) => {
    const { rackId, parentDeviceModel, model, serialNum, macAddress, location, status, comment } =
      part

    const isController = rackId ? _includes(rackId as string, SparePartTypes.CONTROLLER) : false
    const siteTag = `site-${currentSite}`

    const action = {
      action: ACTION_TYPES.REGISTER_THING,
      params: [
        {
          rackId,
          info: {
            parentDeviceModel,
            site: currentSite,
            subType: model,
            serialNum,
            ...(isController ? { macAddress } : {}),
            location,
            status,
          },
          comment,
          tags: [siteTag],
        },
      ],
    }

    return action
  })

  return {
    action: BATCH_ACTION_TYPES.BULK_ADD_SPARE_PARTS,
    batchActionUID: nanoid(),
    batchActionsPayload: [...sparePartActions],
  }
}

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query/react'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import _constant from 'lodash/constant'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _split from 'lodash/split'
import PQueue from 'p-queue'
import qs from 'qs'

import { selectToken } from '../slices/authSlice'
import type { RootState } from '../store'

import {
  FEATURES_GET_API_ENDPOINT,
  FEATURE_CONFIG_GET_API_ENDPOINT,
  getFeaturesFromUrlParams,
  isSaveMockdataEnabled,
  isUseMockdataEnabled,
} from './api.utils'
import { Logger } from './logger'

const REPORTING_TOOLS_PATH = 'reporting-tool'
const USERINFO_QUERY = 'userinfo'
const highConcurrencyQueue = new PQueue({ concurrency: 25 })
const reportingToolsQueue = new PQueue({ concurrency: 10 })

/**
 * Get features from local storage
 * To set:
 * localStorage.setItem('features', JSON.stringify({isDevelopment: true}))
 * @returns {{}|any}
 */
const getFeaturesFromLocalStorage = () => {
  const features = localStorage.getItem('features')
  if (!features) return {}

  try {
    return JSON.parse(features) as Record<string, unknown>
  } catch (error) {
    Logger.error(String(error))
    return {}
  }
}

const getQueue = () => {
  const isReportingPage = _includes(_split(window.location.pathname, '/'), REPORTING_TOOLS_PATH)
  return isReportingPage ? reportingToolsQueue : highConcurrencyQueue
}

async function hashArgs(data: string | FetchArgs) {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(JSON.stringify(data))

  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)

  // Convert ArrayBuffer → hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return hashHex.slice(0, 12)
}

async function getMockdataKey(args: string | FetchArgs) {
  const rawUrl = typeof args === 'string' ? args : args.url
  const url = rawUrl.split('?')[0].replace('/', '-')
  const hash = await hashArgs(JSON.stringify(args).replace(/176\d{10}/g, '1767139200000'))
  return `${url}-${hash}`
}

function mockdataFetchBaseQuery() {
  return async (args: string | FetchArgs) => {
    const mockdataKey = await getMockdataKey(args)
    await import('../../mockdata/index')
    const mockData = window.__mockdata[mockdataKey]

    if (!mockData) {
      // Return proper RTK Query error format when mock data is missing
      return {
        error: {
          status: 404,
          data: { message: `Mock data not found for key: ${mockdataKey}` },
        },
      }
    }

    return mockData
  }
}

async function saveMockdata(args: string | FetchArgs, result: unknown) {
  if (!window.__mockdata) window.__mockdata = {}
  const mockdataKey = await getMockdataKey(args)
  if (mockdataKey.startsWith('ext-data')) {
    // Fix: Check that data[0] is array-like before slicing for lint safety.
    const newResult = result as unknown as { data: unknown[] }
    if (Array.isArray(newResult.data) && Array.isArray(newResult.data[0])) {
      // Reduce the size of the mockdata to 300 items
      newResult.data[0] = newResult.data[0].slice(0, 300)
    }
    window.__mockdata[mockdataKey] = newResult
    return
  }
  window.__mockdata[mockdataKey] = result
}

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Record<string, unknown>,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const queue = getQueue()
  const result = await queue.add(() =>
    isUseMockdataEnabled
      ? mockdataFetchBaseQuery()(args)
      : fetchBaseQuery({
          baseUrl: `${import.meta.env.VITE_API_BASE_URL}auth`,
          prepareHeaders: (headers, { getState, endpoint }) => {
            const authToken = selectToken(getState() as RootState)
            if (authToken && endpoint !== 'refresh') {
              headers.set('Authorization', `Bearer ${authToken}`)
            }
            return headers
          },
        })(args, api, extraOptions),
  )
  if (isSaveMockdataEnabled) {
    saveMockdata(args, result)
  }
  return result as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes: [
    'Features',
    'User',
    'GlobalConfig',
    'Reports',
    'Action',
    'Settings',
    'ProductionCosts',
    'ContainerSettings',
  ],
  // Performance optimization: Better cache management
  keepUnusedDataFor: 300, // Keep data for 5 minutes (stable data)
  refetchOnMountOrArgChange: 30, // Only refetch if data older than 30s
  refetchOnFocus: false, // Disable automatic refetch on window focus
  refetchOnReconnect: true, // Refetch when connection restored
  endpoints: (builder) => ({
    getUserinfo: builder.query({
      query: () => USERINFO_QUERY,
      transformResponse: (value: unknown, meta: FetchBaseQueryMeta | undefined) => {
        const response = meta?.response as Response | undefined
        return {
          ...((value as Record<string, unknown>) || {}),
          isGeoLocationRestricted: response?.headers?.get?.('gloc') === '2',
        }
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),

    postToken: builder.query({
      /**
       * @param {Object} [payload]
       * @param {String[]} [payload.USER_ROLES]
       * @returns {Object}
       */
      query: (payload = {}) => ({ url: 'token', method: 'POST', body: payload }),
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getUserPermissions: builder.query({
      /**
       * @returns {Object}
       */
      query: () => ({ url: 'permissions', method: 'GET' }),
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getMultiTailLog: builder.query({
      /**
       * @param {Object} [payload]
       * @param {Number} [payload.limit]
       * @param {Array<Object>} [payload.keys] - Array of JSON format key objects
       * @param {Number} [payload.offset]
       * @param {Object} [payload.aggrFields]
       * @param {Object} [payload.fields]
       * @param {Object} [payload.aggrTimes]
       * @returns {String}
       */
      query: (payload = {}) => `tail-log/multi?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getTailLogRangeAggr: builder.query({
      /**
       * @param {Object} [payload]
       * @param {Array<Object>} [payload.keys] - Array of JSON format key objects
       * @param {boolean} [payload.overwriteCache] - Option to overwrite cache
       * @returns {String}
       */
      query: (payload = {}) => {
        const queryString = qs.stringify(payload, { arrayFormat: 'brackets', indices: false })
        return `tail-log/range-aggr?${queryString}`
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getTailLog: builder.query({
      /**
       * @param {Object} [payload]
       * @param {Number} [payload.limit]
       * @param {Number} [payload.offset]
       * @param {('stat-5m'|'stat-30m'|'stat-3h'|'stat-1d')} payload.key
       * @param {('miner'|'container')} [payload.type]
       * @param {('t-miner'|'container-<id>')} [payload.tag]
       * @param {Object} [payload.aggrFields]
       * @param {Object} [payload.aggrTimes]
       * @returns {String}
       */
      query: (payload = {}) => `tail-log?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getListThings: builder.query({
      /**
       * @param {Object} [payload]
       * @param {Number} [payload.limit]
       * @param {Number} [payload.offset]
       * @param {Object} [payload.query] - object of JSON format mongo query
       * @param {Object} [payload.fields] - object of JSON format mongo projection
       * @param {(0|1)} [payload.status=0] - 1 returns also the last status of the thing
       * @returns {String}
       */
      query: (payload = {}) => `list-things?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getActions: builder.query({
      /**
       * @param {Object} payload
       * @param {Array<Object>} [payload.queries] - Array of JSON format mongo query objects
       * @param {String} payload.queries[].type - Type of query
       * @param {Object} payload.queries[].opts - Options for the query
       * @param {boolean} [payload.queries[].opts.reverse] - Whether to reverse the query results
       * @param {number} [payload.queries[].opts.limit] - Limit for the query results
       * @param {Object} payload.queries[].filter - Filter for the query
       * @param {number} [payload.queries[].filter.gte] - Greater than or equal to value
       * @param {number} [payload.queries[].filter.lte] - Less than or equal to value
       * @param {number} [payload.queries[].filter.lt] - Less than value
       * @param {number} [payload.queries[].filter.gt] - Greater than value
       * @returns {String}
       */
      query: (payload = {}) => {
        const queryString = _isEmpty(payload)
          ? ''
          : `?${qs.stringify(payload, { arrayFormat: 'comma' })}`
        return `actions${queryString}`
      },
      providesTags: ['Action'],
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getBatchActions: builder.query({
      /**
       * @param {Object} payload
       * @param {Object} [payload.query] - object of JSON format mongo query
       * @returns {String}
       */
      query: (payload = {}) => {
        const queryString = _isEmpty(payload)
          ? ''
          : `?${qs.stringify(payload, { arrayFormat: 'comma' })}`
        return `actions/batch${queryString}`
      },
      providesTags: ['Action'],
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getAction: builder.query({
      /**
       * @param {Object} payload
       * @param {String} payload.type
       * @param {Number} payload.id
       * @returns {String}
       */
      query: (payload = {}) => {
        const { type, id } = payload
        return `actions/${type}/${id}`
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),

    addNewAction: builder.mutation({
      /**
       * @param {Object} payload
       * @param {String} payload.type
       * @param {String} payload.action
       * @param {Array} [payload.params]
       * @param {String[]} payload.tags
       * @returns {Object}
       */
      query: (payload = {}) => {
        const { type, ...body } = payload
        return { url: `actions/${type}`, method: 'POST', body }
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),

    addNewBatchAction: builder.mutation({
      /**
       * @param {Object} payload
       * @param {String} payload.type
       * @param {String} payload.batchActionUID
       * @param {Array} [payload.batchActionsPayload]
       * @returns {Object}
       */
      query: (payload = {}) => {
        const { type, ...body } = payload
        return { url: `actions/${type}/batch`, method: 'POST', body }
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),

    voteForAction: builder.mutation({
      /**
       * @param {Object} payload
       * @param {String} payload.type
       * @param {String} payload.id
       * @returns {Object}
       */
      query: (payload = {}) => {
        const { approve, id } = payload
        return {
          url: `actions/voting/${id}/vote`,
          method: 'PUT',
          body: { approve },
        }
      },
      invalidatesTags: ['Action'],
      extraOptions: {
        maxRetries: 3,
      },
    }),

    cancelActions: builder.mutation({
      /**
       * @param {Object} payload
       * @param {String} payload.type
       * @param {Array<String>} payload.ids
       * @returns {Object}
       */
      query: (payload = {}) => {
        const { type, ids } = payload
        return {
          url: `actions/${type}/cancel?${qs.stringify({ ids }, { arrayFormat: 'comma' })}`,
          method: 'DELETE',
        }
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),

    addThingComment: builder.mutation({
      /**
       * @param {Object} payload
       * @param {String} payload.rackId
       * @param {String} payload.thingId
       * @param {String} payload.comment
       * @returns {Object}
       */
      query: (payload = {}) => ({ url: 'thing/comment', method: 'POST', body: payload }),
      extraOptions: {
        maxRetries: 3,
      },
    }),

    editThingComment: builder.mutation({
      /**
       * @param {Object} payload
       * @param {String} payload.id
       * @param {String} payload.rackId
       * @param {String} payload.thingId
       * @param {String} payload.ts
       * @param {String} payload.comment
       */
      query: (payload = {}) => ({ url: 'thing/comment', method: 'PUT', body: payload }),
      extraOptions: {
        maxRetries: 3,
      },
    }),

    deleteThingComment: builder.mutation({
      /**
       * @param {Object} payload
       * @param {String} payload.id
       * @param {String} payload.rackId
       * @param {String} payload.thingId
       * @param {String} payload.ts
       * @returns {Object}
       */
      query: (payload = {}) => ({ url: 'thing/comment', method: 'DELETE', body: payload }),
      extraOptions: {
        maxRetries: 3,
      },
    }),

    getListRacks: builder.query({
      /**
       * @param {Object} [payload]
       * @param {('container'|'miner'|'powermeter')} [payload.type] - type of rack
       * @returns {String}
       */
      query: (payload = {}) => `list-racks?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),

    /**
     * @param {Object} payload
     * @param {('mempool'|'weather')} [payload.type] - type of rack
     */
    getExtData: builder.query({
      query: (payload) => `ext-data?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),

    /**
     * @param {Object} payload
     */
    getMinersOverview: builder.query({
      query: (payload) => `miners?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),

    /**
     * @param {Object} payload
     * @param {('productionCosts')} [payload.type] - data name
     * @param {String} [payload.query] - filter data query
     */
    getGlobalData: builder.query({
      query: (payload) => `global/data?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} [payload]
     * @param {Number} [payload.year]
     * @param {Number} [payload.month]
     * @param {String} [payload.site]
     * @param {Number} [payload.consumedEnergy]
     * @param {Number} [payload.nonConsumedAvailableEnergy]
     * @param {Number} [payload.nonAvailableConsumedEnergy]
     * @param {Number} [payload.excessDemandedPower]
     * @param {Number} [payload.tolls]
     * @param {Number} [payload.reactiveEnergy]
     * @param {Number} [payload.grossHRCost]
     * @param {Number} [payload.securityCost]
     * @param {Number} [payload.maintenanceCost]
     * @param {Number} [payload.hSServicesCost]
     * @param {Number} [payload.otherCosts]
     * @returns {Object}
     */
    postProductionData: builder.mutation({
      query: (payload) => {
        const url = 'global/data?type=productionCosts'
        return {
          url,
          method: 'POST',
          body: payload,
        }
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),
    setSiteEnergyGlobalData: builder.mutation({
      /**
       * @param {Object} [payload]
       * @param {Object} [payload.data]
       * @param {Object} [payload.data.energyExclusionThresholdMwh]
       * @param {Object} [payload.data.site]
       * @returns {Object}
       */
      query: (payload) => {
        const url = 'global/data?type=siteEnergy'
        return {
          url,
          method: 'POST',
          body: payload,
        }
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),
    setContainerSettings: builder.mutation({
      /**
       * @param {Object} [payload]
       * @param {Object} [payload.data]
       * @param {String} [payload.data.model] - Container model (e.g., "Bitmain Immersion", "MicroBT 1 Wonder", "Bitdeer 4b A1346")
       * @param {Object} [payload.data.parameters] - Container operational parameters
       * @param {Number} [payload.data.parameters.runningSpeed] - Cooling fan running speed (RPM)
       * @param {Number} [payload.data.parameters.startTemp] - Cooling fan start temperature (°C)
       * @param {Number} [payload.data.parameters.stopTemp] - Cooling fan stop temperature (°C)
       * @param {Number} [payload.data.parameters.coolOilAlarmTemp] - Cool oil alarm temperature (°C)
       * @param {Number} [payload.data.parameters.coolWaterAlarmTemp] - Cool water alarm temperature (°C)
       * @param {Number} [payload.data.parameters.coolOilSetTemp] - Cool oil setting temperature (°C)
       * @param {Number} [payload.data.parameters.hotOilAlarmTemp] - Hot oil alarm temperature (°C)
       * @param {Number} [payload.data.parameters.hotWaterAlarmTemp] - Hot water alarm temperature (°C)
       * @param {Number} [payload.data.parameters.exhaustFansRunTemp] - Exhaust fans run temperature (°C)
       * @param {Number} [payload.data.parameters.alarmPressure] - Alarm pressure (bar)
       * @param {Number} [payload.data.parameters.miner1CoolingConsumptionW] - Miner 1 cooling consumption (W)
       * @param {Number} [payload.data.parameters.miner1MinPowerW] - Miner 1 minimum power needed (W)
       * @param {Number} [payload.data.parameters.miner2CoolingConsumptionW] - Miner 2 cooling consumption (W)
       * @param {Number} [payload.data.parameters.miner2MinPowerW] - Miner 2 minimum power needed (W)
       * @param {Object} [payload.data.thresholds] - Container threshold settings (editable values)
       * @param {Object} [payload.data.thresholds.waterTemperature] - Water temperature thresholds (editable values)
       * @param {Number} [payload.data.thresholds.waterTemperature.criticalLow] - Critical low threshold value (°C)
       * @param {Number} [payload.data.thresholds.waterTemperature.alarmLow] - Alarm low threshold value (°C)
       * @param {Number} [payload.data.thresholds.waterTemperature.normal] - Normal range start value (°C)
       * @param {Number} [payload.data.thresholds.waterTemperature.alarmHigh] - Alarm high threshold value (°C)
       * @param {Number} [payload.data.thresholds.waterTemperature.criticalHigh] - Critical high threshold value (°C)
       * @param {Object} [payload.data.thresholds.oilTemperature] - Oil temperature thresholds (editable values)
       * @param {Number} [payload.data.thresholds.oilTemperature.criticalLow] - Critical low threshold value (°C)
       * @param {Number} [payload.data.thresholds.oilTemperature.alert] - Alert threshold value (°C)
       * @param {Number} [payload.data.thresholds.oilTemperature.normal] - Normal range start value (°C)
       * @param {Number} [payload.data.thresholds.oilTemperature.alarm] - Alarm threshold value (°C)
       * @param {Number} [payload.data.thresholds.oilTemperature.criticalHigh] - Critical high threshold value (°C)
       * @param {Object} [payload.data.thresholds.tankPressure] - Tank pressure thresholds (editable values)
       * @param {Number} [payload.data.thresholds.tankPressure.criticalLow] - Critical low threshold value (bar)
       * @param {Number} [payload.data.thresholds.tankPressure.alarmLow] - Alarm low threshold value (bar)
       * @param {Number} [payload.data.thresholds.tankPressure.normal] - Normal range start value (bar)
       * @param {Number} [payload.data.thresholds.tankPressure.alarmHigh] - Alarm high threshold value (bar)
       * @param {Number} [payload.data.thresholds.tankPressure.criticalHigh] - Critical high threshold value (bar)
       * @param {Object} [payload.data.thresholds.supplyLiquidPressure] - Supply liquid pressure thresholds (editable values)
       * @param {Number} [payload.data.thresholds.supplyLiquidPressure.criticalLow] - Critical low threshold value (bar)
       * @param {Number} [payload.data.thresholds.supplyLiquidPressure.alarmLow] - Alarm low threshold value (bar)
       * @param {Number} [payload.data.thresholds.supplyLiquidPressure.normal] - Normal range start value (bar)
       * @param {Number} [payload.data.thresholds.supplyLiquidPressure.alarmHigh] - Alarm high threshold value (bar)
       * @param {Number} [payload.data.thresholds.supplyLiquidPressure.criticalHigh] - Critical high threshold value (bar)
       * @returns {Object}
       */
      query: (payload) => {
        const url = 'global/data?type=containerSettings'
        return {
          url,
          method: 'POST',
          body: payload,
        }
      },
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getContainerSettings: builder.query<
      unknown,
      { model?: string; overwriteCache?: boolean } | undefined
    >({
      /**
       * @param {Object} [payload]
       * @param {String} [payload.model] - Container model (e.g., "Bitmain Immersion", "MicroBT 1 Wonder", "Bitdeer 4b A1346")
       * @param {Boolean} [payload.overwriteCache] - Option to bypass backend cache
       * @returns {Object} - Container settings including parameters and thresholds
       */
      query: (payload) => {
        const { model, overwriteCache } = payload || {}
        const queryParams: Record<string, string | boolean> = { type: 'containerSettings' }

        if (model) queryParams.model = model
        if (overwriteCache) queryParams.overwriteCache = true

        return `global/data?${qs.stringify(queryParams)}`
      },
      extraOptions: {
        maxRetries: 3,
      },
      providesTags: ['ContainerSettings'],
    }),
    addFeatureFlags: builder.mutation({
      /**
       * @param {Object} payload
       * @returns {Object}
       */
      query: (payload = {}) => ({ url: 'features', method: 'POST', body: payload }),
      invalidatesTags: ['Features'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getSite: builder.query({
      query: _constant('site'),
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getGlobalConfig: builder.query({
      query: (payload) => `global-config?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      providesTags: ['GlobalConfig'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getHistoricalLogs: builder.query({
      /**
       * @param {Object} [payload]
       * @param {('alerts'|'info')} [payload.logType]
       * @param {Number} [payload.limit]
       * @param {Number} [payload.offset]
       * @param {Number} [payload.start]
       * @param {Number} [payload.end]
       * @param {Number} [payload.startExcl]
       * @param {Number} [payload.endExcl]
       * @returns {String}
       */
      query: (payload = {}) => `history-log?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getUsers: builder.query({
      query: _constant('users'),
      providesTags: ['User'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
    updateUser: builder.mutation({
      /**
       * @param {Object} [payload]
       * @param {Object} [payload.data]
       * @param {String} [payload.data.email]
       * @param {Number} [payload.data.id]
       * @param {String} [payload.data.role]
       * @returns {Object}
       */
      query: (payload) => ({
        url: 'users',
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['User'],
      extraOptions: {
        maxRetries: 0,
      },
    }),
    deleteUser: builder.mutation({
      /**
       * @param {Object} [payload]
       * @param {Object} [payload.data]
       * @param {Number} [payload.data.id]
       * @returns {Object}
       */
      query: (payload) => ({
        url: 'users/delete',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User'],
      extraOptions: {
        maxRetries: 0,
      },
    }),
    createUser: builder.mutation({
      /**
       * @param {Object} [payload]
       * @param {Object} [payload.data]
       * @param {Number} [payload.data.email]
       * @param {Number} [payload.data.role]
       * @returns {Object}
       */
      query: (payload) => ({
        url: 'users',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User'],
      extraOptions: {
        maxRetries: 0,
      },
    }),
    getWorkerConfig: builder.query({
      /**
       * @param {Object} [payload]
       * @param {Object} [payload.fields] - object of JSON format mongo projection
       * @param {string} [payload.type] - type of the config to return
       * @returns {String}
       */
      query: (payload = {}) => `worker-config?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} [payload]
     * @param {Object} [payload.type] - string - type of the miner
     * @param {string} [payload.requestType] - type of the config to return
     */
    getThingConfig: builder.query({
      query: (payload = {}) => `thing-config?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     */
    getOperationsHashrate: builder.query({
      query: (payload) => `operations/hashrate?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     * @param {String} payload.startDate - start date
     * @param {String} payload.endDate - end date
     * @param {String} payload.regions - regions
     */
    getRevenue: builder.query({
      query: (payload) => `revenue?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} [payload]
     * @param {String} [payload.startDate] - start date
     * @param {String} [payload.endDate] - end date
     * @param {String} [payload.regions] - regions
     */
    getCosts: builder.query({
      query: (payload) => `costs?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} [payload]
     * @param {String} [payload.startDate] - start date
     * @param {String} [payload.endDate] - end date
     * @param {String} [payload.regions] - regions
     */
    getCostOperationalEnergy: builder.query({
      query: (payload) =>
        `costs/operational-energy?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} [payload]
     * @param {String} [payload.startDate] - start date
     * @param {String} [payload.endDate] - end date
     * @param {String} [payload.regions] - regions
     * @param {String} [payload.groupByRegions] - boolean
     */
    getCostEnergy: builder.query({
      query: (payload) => `costs/energy?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),

    /**
     * @param {Object} [payload]
     * @param {String} [payload.startDate] - start date
     * @param {String} [payload.endDate] - end date
     * @param {String} [payload.regions] - regions
     * @param {String} [payload.groupByRegions] - boolean
     */
    getCostProduction: builder.query({
      query: (payload) =>
        `costs/production-price?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     * @param {String} payload.startDate - start date
     * @param {String} payload.endDate - end date
     * @param {String} payload.regions - regions
     */
    getDowntimeCurtailment: builder.query({
      query: (payload) => `downtime/curtailment?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     * @param {String} payload.startDate - start date
     * @param {String} payload.endDate - end date
     * @param {String} payload.regions - regions
     */
    getDowntimeOperationalIssues: builder.query({
      query: (payload) => ({
        url: 'downtime/operationalIssues',
        params: payload,
      }),
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     * @param {String} payload.startDate - start date
     * @param {String} payload.endDate - end date
     * @param {String} payload.regions - regions
     */
    getDowntime: builder.query({
      query: (payload) => `downtime?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     * @param {String} payload.startDate - start date
     * @param {String} payload.endDate - end date
     * @param {String} payload.regions - regions
     */
    getBTCDataHashrate: builder.query({
      query: (payload) => `btcData/hashrate?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     */
    getOperationsConsumption: builder.query({
      query: (payload) =>
        `operations/consumption?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     */
    getOperationsMiners: builder.query({
      query: (payload) => `operations/workers?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     */
    getOperationsEfficiency: builder.query({
      query: (payload) =>
        `operations/efficiency?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    /**
     * @param {Object} payload
     */
    getBtcDataCurrent: builder.query({
      query: (payload = {}) => `btcData/current?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getBtcDataPrice: builder.query({
      query: (payload = {}) => `btcData/price?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getBtcDataHashrate: builder.query({
      query: (payload = {}) =>
        `btcData/hashrate?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getBtcDataHashPrice: builder.query({
      query: (payload = {}) =>
        `btcData/hashprice?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getSettings: builder.query({
      query: (payload) => `settings?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      providesTags: ['Settings'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
    updateSettings: builder.mutation({
      /**
       * @param {Object} [payload]
       * @param {Object} [payload.data]
       * @param {Number} [payload.data.spotPriceMargin]
       * @returns {Object}
       */
      query: (payload) => ({
        url: 'settings',
        method: 'PUT',
        body: payload,
      }),
      extraOptions: {
        maxRetries: 0,
      },
      invalidatesTags: ['Settings'],
    }),
    setGlobalConfig: builder.mutation({
      /**
       * @param {Object} payload
       * @returns {Object}
       */
      query: (payload = {}) => ({ url: 'global-config', method: 'POST', body: payload }),
      invalidatesTags: ['GlobalConfig'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getProductionCosts: builder.query({
      /**
       * @param {Object} [payload]
       * @param {String} [payload.region]
       * @param {Boolean} [payload.overwriteCache]
       * @returns {Object}
       */
      query: (payload = {}) =>
        `production-costs?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      providesTags: ['ProductionCosts'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
    setProductionCosts: builder.mutation({
      /**
       * @param {Object} [payload]
       * @param {String} [payload.region]
       * @param {integer} [payload.month]
       * @param {integer} [payload.energyCostsUSD]
       * @param {integer} [payload.operationalCostsUSD]
       * @returns {Object}
       */
      query: (payload = {}) => ({ url: 'production-costs', method: 'POST', body: payload }),
      invalidatesTags: ['ProductionCosts'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getFeatureConfig: builder.query<Record<string, unknown>, void | Record<string, unknown>>({
      query: (payload?: Record<string, unknown>) =>
        `${FEATURE_CONFIG_GET_API_ENDPOINT}?${qs.stringify(payload || { overwriteCache: true }, { arrayFormat: 'comma' })}`,
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getFeatures: builder.query({
      query: (payload = { overwriteCache: true }) =>
        `${FEATURES_GET_API_ENDPOINT}?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
      transformResponse: (response) => {
        const urlFeatures = getFeaturesFromUrlParams(window.location.search)
        const localStorageFeatures = getFeaturesFromLocalStorage()

        return { ...response, ...urlFeatures, ...localStorageFeatures }
      },
      providesTags: ['Features'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
    getReports: builder.query({
      /**
       * @param {Object} payload
       * @param {string[]} payload.regions
       * @param {string}   payload.startDate
       * @param {string}   payload.endDate
       * @param {string}   [payload.period]
       * @param {boolean}  [payload.overwriteCache]
       */
      query: (payload) =>
        `reports?${qs.stringify({
          ...payload,
          regions: JSON.stringify(payload.regions),
        })}`,
      providesTags: ['Reports'],
      extraOptions: {
        maxRetries: 3,
      },
    }),
  }),
})

export const {
  useGetUserinfoQuery,
  usePostTokenQuery,
  useGetTailLogQuery,
  useGetMultiTailLogQuery,
  useLazyGetTailLogQuery,
  useLazyGetMultiTailLogQuery,
  useGetTailLogRangeAggrQuery,
  useGetListThingsQuery,
  useLazyGetListThingsQuery,
  useGetActionsQuery,
  useLazyGetActionsQuery,
  useGetBatchActionsQuery,
  useGetActionQuery,
  useAddNewActionMutation,
  useAddNewBatchActionMutation,
  useVoteForActionMutation,
  useCancelActionsMutation,
  useAddThingCommentMutation,
  useEditThingCommentMutation,
  useDeleteThingCommentMutation,
  useGetListRacksQuery,
  useGetExtDataQuery,
  useLazyGetExtDataQuery,
  useGetMinersOverviewQuery,
  useGetGlobalDataQuery,
  usePostProductionDataMutation,
  useAddFeatureFlagsMutation,
  useGetSiteQuery,
  useGetGlobalConfigQuery,
  useGetHistoricalLogsQuery,
  useLazyGetHistoricalLogsQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
  useLazyGetUserPermissionsQuery,
  useGetWorkerConfigQuery,
  useGetThingConfigQuery,
  useGetSettingsQuery,
  useGetOperationsHashrateQuery,
  useGetRevenueQuery,
  useGetCostsQuery,
  useGetCostEnergyQuery,
  useGetCostProductionQuery,
  useGetDowntimeQuery,
  useGetDowntimeCurtailmentQuery,
  useGetDowntimeOperationalIssuesQuery,
  useGetOperationsMinersQuery,
  useGetOperationsConsumptionQuery,
  useGetOperationsEfficiencyQuery,
  useUpdateSettingsMutation,
  useSetGlobalConfigMutation,
  useGetBtcDataCurrentQuery,
  useGetBtcDataPriceQuery,
  useGetBtcDataHashPriceQuery,
  useGetBtcDataHashrateQuery,
  useGetProductionCostsQuery,
  useGetCostOperationalEnergyQuery,
  useLazyGetProductionCostsQuery,
  useSetProductionCostsMutation,
  useSetSiteEnergyGlobalDataMutation,
  useSetContainerSettingsMutation,
  useGetContainerSettingsQuery,
  useLazyGetContainerSettingsQuery,
  useGetFeatureConfigQuery,
  useGetFeaturesQuery,
  useGetReportsQuery,
  useLazyGetReportsQuery,
} = api

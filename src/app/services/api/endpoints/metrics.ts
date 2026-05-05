import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type {
  MetricsConsumptionGroupedResponse,
  MetricsConsumptionQueryParams,
  MetricsConsumptionResponse,
  MetricsEfficiencyResponse,
  MetricsHashrateGroupedResponse,
  MetricsHashrateQueryParams,
  MetricsHashrateResponse,
  MetricsMinerStatusResponse,
  MetricsPowerModeQueryParams,
  MetricsPowerModeResponse,
  MetricsPowerModeTimelineQueryParams,
  MetricsPowerModeTimelineResponse,
  MetricsQueryParams,
  MetricsTemperatureQueryParams,
  MetricsTemperatureResponse,
} from '@/types/api'

export const metricsEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getMetricsHashrate: builder.query<MetricsHashrateResponse, MetricsQueryParams>({
    query: (payload) => `metrics/hashrate?${qs.stringify(payload)}`,
  }),

  getMetricsHashrateGrouped: builder.query<
    MetricsHashrateGroupedResponse,
    MetricsHashrateQueryParams & { groupBy: NonNullable<MetricsHashrateQueryParams['groupBy']> }
  >({
    query: (payload) => `metrics/hashrate?${qs.stringify(payload)}`,
  }),

  getMetricsConsumption: builder.query<MetricsConsumptionResponse, MetricsQueryParams>({
    query: (payload) => `metrics/consumption?${qs.stringify(payload)}`,
  }),

  getMetricsConsumptionGrouped: builder.query<
    MetricsConsumptionGroupedResponse,
    MetricsConsumptionQueryParams & {
      groupBy: NonNullable<MetricsConsumptionQueryParams['groupBy']>
    }
  >({
    query: (payload) => `metrics/consumption?${qs.stringify(payload)}`,
  }),

  getMetricsEfficiency: builder.query<MetricsEfficiencyResponse, MetricsQueryParams>({
    query: (payload) => `metrics/efficiency?${qs.stringify(payload)}`,
  }),

  getMetricsMinerStatus: builder.query<MetricsMinerStatusResponse, MetricsQueryParams>({
    query: (payload) => `metrics/miner-status?${qs.stringify(payload)}`,
  }),

  getMetricsPowerMode: builder.query<MetricsPowerModeResponse, MetricsPowerModeQueryParams>({
    query: (payload) => `metrics/power-mode?${qs.stringify(payload)}`,
  }),

  getMetricsPowerModeTimeline: builder.query<
    MetricsPowerModeTimelineResponse,
    MetricsPowerModeTimelineQueryParams
  >({
    query: (payload) => `metrics/power-mode/timeline?${qs.stringify(payload)}`,
  }),

  getMetricsTemperature: builder.query<MetricsTemperatureResponse, MetricsTemperatureQueryParams>({
    query: (payload) => `metrics/temperature?${qs.stringify(payload)}`,
  }),
})

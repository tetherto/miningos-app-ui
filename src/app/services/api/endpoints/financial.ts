import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type {
  CostOperationalEnergyData,
  CostSummaryResponse,
  EbitdaResponse,
  EnergyBalanceResponse,
  FinanceQueryParams,
  FinanceRevenueQueryParams,
  FinanceRevenueResponse,
  HashRevenueResponse,
  RevenueData,
  RevenueSummaryResponse,
  SubsidyFeesResponse,
} from '@/types/api'

export const financialEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getRevenue: builder.query<RevenueData, UnknownRecord>({
    query: (payload: UnknownRecord) => `revenue?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getCosts: builder.query({
    query: (payload: UnknownRecord) => `costs?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getCostOperationalEnergy: builder.query<CostOperationalEnergyData, UnknownRecord>({
    query: (payload: UnknownRecord) =>
      `costs/operational-energy?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getCostEnergy: builder.query({
    query: (payload: UnknownRecord) =>
      `costs/energy?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getCostProduction: builder.query({
    query: (payload: UnknownRecord) =>
      `costs/production-price?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getProductionCosts: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `production-costs?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
    providesTags: ['ProductionCosts'],
  }),

  setProductionCosts: builder.mutation({
    query: (payload: UnknownRecord = {}) => ({
      url: 'production-costs',
      method: 'POST',
      body: payload,
    }),
    invalidatesTags: ['ProductionCosts'],
  }),

  getFinanceRevenueSummary: builder.query<RevenueSummaryResponse, FinanceQueryParams>({
    query: (payload) => `finance/revenue-summary?${qs.stringify(payload)}`,
  }),

  getFinanceEbitda: builder.query<EbitdaResponse, FinanceQueryParams>({
    query: (payload) => `finance/ebitda?${qs.stringify(payload)}`,
  }),

  getFinanceEnergyBalance: builder.query<EnergyBalanceResponse, FinanceQueryParams>({
    query: (payload) => `finance/energy-balance?${qs.stringify(payload)}`,
  }),

  getFinanceCostSummary: builder.query<CostSummaryResponse, FinanceQueryParams>({
    query: (payload) => `finance/cost-summary?${qs.stringify(payload)}`,
  }),

  getFinanceSubsidyFees: builder.query<SubsidyFeesResponse, FinanceQueryParams>({
    query: (payload) => `finance/subsidy-fees?${qs.stringify(payload)}`,
  }),

  getFinanceRevenue: builder.query<FinanceRevenueResponse, FinanceRevenueQueryParams>({
    query: (payload) => `finance/revenue?${qs.stringify(payload)}`,
  }),

  getFinanceHashRevenue: builder.query<HashRevenueResponse, FinanceQueryParams>({
    query: (payload) => `finance/hash-revenue?${qs.stringify(payload)}`,
  }),
})

// API and Service type definitions

import { UnknownRecord } from '@/app/utils/deviceUtils'

declare global {
  var __mockdata: Record<string, unknown>
}

// ============================================================================
// Logger Service Types
// ============================================================================

export type LogLevel = 'info' | 'warn' | 'error' | 'log'

export interface LoggerService {
  init: (isDev: boolean) => void
  log: (level: LogLevel, message: string, extra?: unknown, devOnly?: boolean) => void
  info: (msg: string, extra?: unknown, devOnly?: boolean) => void
  warn: (msg: string, extra?: unknown, devOnly?: boolean) => void
  error: (msg: string, extra?: unknown, devOnly?: boolean) => void
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T
  success: boolean
  message?: string
  isLoading?: boolean
  refetch?: VoidFunction
  isFetching?: boolean
  isError?: boolean
  error?: string | ApiError | unknown
}

export interface ApiError {
  message: string
  code?: string | number
  details?: unknown
  timestamp?: string
  data?: {
    message?: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ============================================================================
// User & Auth Types
// ============================================================================

export interface UserInfo {
  id?: string
  username?: string
  email?: string
  roles?: string[]
  isGeoLocationRestricted?: boolean
  [key: string]: unknown
}

export interface TokenRequest {
  USER_ROLES?: string[]
  [key: string]: unknown
}

export interface TokenResponse {
  token: string
  expiresIn?: number
  refreshToken?: string
}

export interface PermissionsResponse {
  permissions: string[]
  [key: string]: unknown
}

// ============================================================================
// Device & Miner Types
// ============================================================================

// Base Device interface - matches actual usage in codebase
export interface Device {
  id: string
  type: string
  tags?: string[]
  rack?: string
  last?: {
    err?: string
    snap?: {
      stats?: Record<string, unknown> & {
        miner_specific?: { power_pct?: number }
      }
      config?: Record<string, unknown>
    }
    alerts?: unknown[]
    [key: string]: unknown
  }
  username?: string
  info?: {
    container?: string
    pos?: string
    [key: string]: unknown
  }
  containerId?: string
  address?: string
  // Legacy fields for compatibility
  name?: string
  status?: 'online' | 'offline' | 'error' | 'maintenance'
  siteId?: string
  hashRate?: number
  temperature?: number
  power?: number
  [key: string]: unknown
}

type DeviceResponse = ApiResponse<Device[]>

export interface Miner extends Device {
  mac: string
  model?: string
  firmware?: string
  pools?: Pool[]
  code?: string
  [key: string]: unknown
}

export interface Pool {
  url: string
  user: string
  status?: string
  [key: string]: unknown
}

export interface ContainerData {
  id?: string
  type?: string
  container?: string
  last?: {
    snap?: {
      stats?: {
        status?: string
        container_specific?: {
          pdu_data?: Array<{
            pdu: string
            sockets?: Array<{
              socket: string | number
              enabled?: boolean
              cooling?: boolean
              current_a?: number | string
              power_w?: number | string
              offline?: boolean
              [key: string]: unknown
            }>
            power_w?: number | string
            current_a?: number | string
            offline?: boolean
            [key: string]: unknown
          }>
          [key: string]: unknown
        }
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  info?: {
    container?: string
    [key: string]: unknown
  }
  connectedMiners?: unknown
  [key: string]: unknown
}

// Legacy Container interface for compatibility
export interface Container {
  id: string
  name: string
  devices?: Device[]
  type?: string
  info?: {
    container?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface PDU {
  id: string
  name: string
  sockets?: Socket[]
  [key: string]: unknown
}

export interface Socket {
  index: number
  status: string
  power?: number
  socket?: string | number
  enabled?: boolean
  cooling?: boolean
  current_a?: number | string
  power_w?: number | string
  offline?: boolean
  [key: string]: unknown
}

export interface SocketInfo {
  pduIndex: string | number
  socketIndex: string | number
  miner?: Device | null
  current_a?: number
  enabled?: boolean
  power_w?: number
  socket?: number
  coolingEnabled?: boolean
  [key: string]: unknown
}

export interface MinerResponse {
  id?: string
  type?: string
  [key: string]: unknown
}

export interface DeviceData {
  id: string
  type: string
  tags?: string[]
  rack?: string
  snap: {
    stats?: Record<string, unknown>
    config?: Record<string, unknown>
  }
  alerts?: unknown[]
  username?: string
  info?: {
    container?: string
    pos?: string
    [key: string]: unknown
  }
  containerId?: string
  address?: string
  err?: string
  [key: string]: unknown
}

// ============================================================================
// Site Types
// ============================================================================

export interface Site {
  id: string
  name: string
  location?: string
  capacity?: number
  status: 'active' | 'inactive' | 'maintenance'
  devices?: Device[]
  totalHashRate?: number
  [key: string]: unknown
}

export interface Farm {
  id: string
  name: string
  sites?: Site[]
  [key: string]: unknown
}

// ============================================================================
// Reporting & Analytics Types
// ============================================================================

export interface ReportRequest {
  siteId?: string
  startDate: string | number
  endDate: string | number
  reportType?: string
  [key: string]: unknown
}

export interface ReportResponse {
  data: unknown
  generatedAt: string
  [key: string]: unknown
}

export interface TailLogKey {
  site?: string
  container?: string
  device?: string
  [key: string]: unknown
}

export interface MultiTailLogRequest {
  limit?: number
  keys?: TailLogKey[]
  [key: string]: unknown
}

// ============================================================================
// Feature Flags Types
// ============================================================================

export interface FeatureFlags {
  isDevelopment?: boolean
  alertsHistoricalLogEnabled?: boolean
  userManagement?: boolean
  inventory?: boolean
  [key: string]: boolean | undefined
}

interface FeatureFlagsData {
  data?: FeatureFlags
}

type FeatureFlagsResponse = ApiResponse<FeatureFlagsData>

export interface FeatureConfig {
  enabled: boolean
  config?: unknown
  settings?: boolean
  [key: string]: unknown
}

type FeatureConfigResponse = ApiResponse<FeatureConfig>

// ============================================================================
// Chart Data Types
// ============================================================================

export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
  [key: string]: unknown
}

export interface ChartDataset {
  label?: string
  data: ChartDataPoint[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  [key: string]: unknown
}

export interface ChartData {
  labels?: string[]
  datasets: ChartDataset[]
}

// ============================================================================
// Action Types
// ============================================================================

export interface ActionRequest {
  deviceId?: string
  deviceIds?: string[]
  action: string
  parameters?: Record<string, unknown>
  [key: string]: unknown
}

export interface ActionResponse {
  success: boolean
  message?: string
  results?: unknown[]
  [key: string]: unknown
}

// CardAction is defined in ActionCard component but exported here for shared use
// See: src/Components/ActionsSidebar/ActionCard/ActionCard.tsx
export interface CardActionCall {
  id: string
  tags?: string[]
  result?: { success: boolean }
  error?: string
  [key: string]: unknown
}

export interface CardAction {
  id: string
  action: string
  tags?: string[]
  targets?: Record<string, { calls: Array<CardActionCall> }>
  minerId?: string
  batchActionsPayload?: Array<Record<string, unknown>>
  batchActionUID?: string
  metadata?: {
    from?: { location?: string; status?: string }
    to?: { location?: string; status?: string }
  }
  cancelled?: boolean
  status?: string
  isLoading?: boolean
  votesPos?: number
  params?: unknown[][]
  deviceId?: string
  deviceIds?: string[]
  createdAt?: number
  [key: string]: unknown
}

// SetupPoolsAction extends the base Action interface from hooks.types
// This matches the interface defined in ActionCardHeaderButtons.util.ts
export interface SetupPoolsAction {
  id: string
  type: string
  status: string
  action?: string
  tags?: string[]
  actionId?: string
  targets?: Record<string, { calls: Array<{ id: string }> }>
  deviceId?: string
  deviceIds?: string[]
  createdAt?: number
  updatedAt?: number
  success?: boolean
  message?: string
  remove?: string
  create?: {
    tags?: string[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

// ============================================================================
// Inventory Types
// ============================================================================

export interface SparePart {
  id: string
  name: string
  quantity: number
  location?: string
  [key: string]: unknown
}

export interface InventoryItem {
  id: string
  type: string
  status: string
  [key: string]: unknown
}

// ============================================================================
// Alert Types
// ============================================================================

export interface Alert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: number
  deviceId?: string
  siteId?: string
  [key: string]: unknown
}

// ============================================================================
// RTK Query Endpoint Parameter Types
// ============================================================================

export type QueryParams = Record<string, string | number | boolean | undefined>

export interface BaseQueryArgs {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: QueryParams
  headers?: Record<string, string>
}

// ============================================================================
// Revenue Types
// ============================================================================
export interface RevenueLogEntry {
  ts?: number
  timeKey?: string
  period?: string
  totalRevenueBTC?: number
  totalFeesBTC?: number
  curtailmentRate?: number
  [key: string]: unknown
}

export interface RevenueRegion {
  region: string
  log?: RevenueLogEntry[]
}

export interface RevenueSummary {
  sum: {
    [key: string]: unknown
  }
  avg: {
    [key: string]: unknown
  }
}

export interface RevenueData {
  regions?: RevenueRegion[] | null
  log?: RevenueLogEntry[] | null
  logs?: RevenueLogEntry[] | null
  data?: {
    summary?: RevenueSummary
  }
}

// ============================================================================
// Efficiency Types
// ============================================================================
export interface EfficiencyRegion {
  [key: string]: number | string | null
}

interface EfficiencyData {
  data: Record<string, unknown>[]
  regions: EfficiencyRegion[]
  nominalEfficiency?: number
}

type EfficiencyResponse = ApiResponse<EfficiencyData>

// ============================================================================
// Miner pool data
// ============================================================================
export interface MinerPoolData {
  adjustments: {
    progressToDifficulty: number
    nextAdjustmentTs: number
    nextAdjustmentExp: number
    prevAdjustment: number
    avgBlockTime: number
  }
  blockHeight: number
  blockRewardAvgs: {
    '24h': number
    '3d': number
    '1w': number
    '1m': number
    '3m': number
    [key: string]: number
  }
  currentDifficulty: number
  currentHashrate: number
  currentPrice: number
  priceChange24Hrs: number
  transactionFees: {
    fastest: number
    halfHour: number
    hour: number
  }
}

type MinerPoolResponse = ApiResponse<MinerPoolData[][]>

// ============================================================================
// Production cost data
// ============================================================================
export interface ProductionCostData {
  energyCost: number
  operationalCost: number
  month: number
  site: string
  year: number
}

type ProductionCostResponse = ApiResponse<ProductionCostData[]>

// ============================================================================
// Miner transaction
// ============================================================================

export interface MinerTransaction {
  blocksData: UnknownRecord
  stats: unknown[]
  transactions: {
    id: number
    username: string
    type: string
    changed_balance: number
    created_at: number
    satoshis_net_earned: number | unknown
    fees_colected_satoshis: number | unknown
    mining_extra: {
      mining_date: number
      settle_date: number
      pps: number
      pps_fee_rate: number
      tx_fee: number
      tx_fee_rate: number
      hash_rate: number
    }
    payout_extra: unknown | null
  }[]
  workers: unknown[]
  workersCount: number
  ts: string
}

type MinerTransactionResponse = ApiResponse<MinerTransaction[][]>

// ============================================================================
// Miner Historical Block Sizes
// ============================================================================
export interface MinerHistoricalBlockSizes {
  blockHash: string
  blockReward: number
  blockSize: number
  blockTotalFees: number
  ts: number
}

type MinerHistoricalBlockSizesResponse = ApiResponse<MinerHistoricalBlockSizes[][]>

// ============================================================================
// Miner Historical Price Types
// ============================================================================
export interface MinerHistoricalPrice {
  priceUSD: number
  ts: number
  currentPrice?: number
}

type MinerHistoricalPriceResponse = ApiResponse<MinerHistoricalPrice[][]>

// ============================================================================
// Hashrate Aggregate Types
// ============================================================================

export interface HashratePowermeter {
  ts: number
  val: {
    site_power_w: number
  }
}
export interface HashrateAggregate {
  ts: number
  val: {
    hashrate_mhs_5m_sum_aggr: number
  }
}

export interface HashrateAggregateData {
  type: string
  data: Array<HashrateAggregate | HashratePowermeter>
}

type HashrateAggregateResponse = ApiResponse<HashrateAggregateData[][]>
// ============================================================================
// Miner Historical HashRate Types
// ============================================================================
export interface MinerHistoricalHashRate {
  avgHashrateMHs: number
  ts: number
}

type MinerHistoricalHashRateResponse = ApiResponse<MinerHistoricalHashRate[][]>

// ============================================================================
// Miner Pool Rack List Types
// ============================================================================
export interface MinerPoolRackListData {
  id: string
  info: Record<string, unknown>
  type: string
}

type MinerPoolRackListResponse = ApiResponse<MinerPoolRackListData[][]>

// ============================================================================
// Miner Pool Extended Data Types
// ============================================================================

export interface MinerPoolExtDataStats {
  active_workers_count: number
  balance: number
  estimated_today_income: number
  hashrate: number
  hashrate_1h: number
  hashrate_24h: number
  hashrate_stale_1h: number
  hashrate_stale_24h: number
  poolType: string
  revenue_24h: number
  timestamp: number
  unsettled: number
  username: string
  worker_count: number
}

export interface MinerPoolExtData {
  blocksData: UnknownRecord
  stats: MinerPoolExtDataStats[]
  transactions: unknown[]
  workers: unknown[]
  workersCount: number
  ts: string
}

type MinerPoolExtDataResponse = ApiResponse<MinerPoolExtData[][]>
// ============================================================================
// Hashrate Types
// ============================================================================

export interface RegionLog {
  ts?: number
  hashrate?: number
  [key: string]: unknown
}

export interface RegionData {
  region?: string
  summary?: {
    avg?: {
      hashrate?: number
    }
  }
  log?: RegionLog[]
  [key: string]: unknown
}

interface HashrateData {
  data?: Record<string, unknown>[]
  regions?: RegionData[]
  log?: RegionLog[]
  nominalHashrate?: number
}

export interface HashpriceLog {
  ts: number
  hashprice: number
  [key: string]: unknown
}

export interface HashpriceData {
  log?: HashpriceLog[]
}

type HashpriceResponse = ApiResponse<HashrateData>
type HashrateResponse = ApiResponse<HashrateData>

// ------------------------------
// PowerData Types
// -----------------------------
interface PowerData {
  availablePower?: number
  data?: ChartData[]
}

type PowerResponse = ApiResponse<PowerData>

// ------------------------------
// WorkersData Types
// ------------------------------

interface WorkersData {
  nominalMinerCapacity?: number
  data?: ChartData[]
}
type WorkersResponse = ApiResponse<WorkersData>

// --------------------------------------------
// ConsumptionData Types
// ------------------------------
export interface ConsumptionLog {
  ts: number
  consumption: number
}

export interface ConsumptionRegion {
  [key: string]: number
}

export interface ConsumptionData {
  availablePower?: number
  regions?: ConsumptionRegion[]
  data?: {
    log?: ConsumptionLog[]
  }
}
type ConsumptionResponse = ApiResponse<ConsumptionData>

// ============================================================================
// Electricity Data Types
// ============================================================================

export interface ElectricityDataEnergy {
  usedEnergy: number
  availableEnergy: number
  label: number
  count: number
  ts: number
}

export interface ElectricityDataEntry {
  ts: number
  energy: ElectricityDataEnergy
}

// ============================================================================
// Cost Operational Energy Types
// ============================================================================

export interface CostOperationalEntry {
  allInCostsUSD?: number
  energyCostsUSD?: number
  operationalCostsUSD?: number
  avgAllInCostsUSD?: number
  avgEnergyCostsUSD?: number
  avgOperationalCostsUSD?: number
  [key: string]: number | undefined
}

export type CostOperationalEnergyData = Record<string, CostOperationalEntry> & {
  summary?: Record<string, CostOperationalEntry>
}

// ============================================================================
// Pool Stats Types
// ============================================================================

export interface ContainerPoolStat {
  container: string
  overriddenConfig: number
}

// ============================================================================
// Finance v2 API Types (/auth/finance/*)
// ============================================================================

export type FinancePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface FinanceQueryParams {
  start: number
  end: number
  period?: FinancePeriod
  overwriteCache?: boolean
}

export interface FinanceResponse<Log, Summary> {
  log: Log[]
  summary: Summary
}

// ============================================================================
// v2 Operational Metrics Types — /auth/metrics/*
// ============================================================================

export interface MetricsQueryParams {
  start: number
  end: number
  overwriteCache?: boolean
}

export interface MetricsResponse<Log, Summary> {
  log: Log[]
  summary: Summary
}

// /auth/metrics/hashrate
export type MetricsHashrateGroupBy = 'container' | 'miner'

export interface MetricsHashrateQueryParams extends MetricsQueryParams {
  groupBy?: MetricsHashrateGroupBy
}

export interface MetricsHashrateLogEntry {
  ts: number
  hashrateMhs: number
}

export interface MetricsHashrateGroupedLogEntry {
  ts: number
  hashrateMhs: Record<string, number>
}

export interface MetricsHashrateSummary {
  avgHashrateMhs: number | null
  totalHashrateMhs: number
}

export type MetricsHashrateResponse = MetricsResponse<
  MetricsHashrateLogEntry,
  MetricsHashrateSummary
>

export interface MetricsHashrateGroupedSummary {
  avgHashrateMhs: number | null
  totalHashrateMhs: number
  groupedBy?: Record<string, MetricsHashrateSummary>
}

export type MetricsHashrateGroupedResponse = MetricsResponse<
  MetricsHashrateGroupedLogEntry,
  MetricsHashrateGroupedSummary
>

// /auth/metrics/consumption
export type MetricsConsumptionGroupBy = 'container' | 'miner'

export interface MetricsConsumptionQueryParams extends MetricsQueryParams {
  groupBy?: MetricsConsumptionGroupBy
}

export interface MetricsConsumptionLogEntry {
  ts: number
  powerW: number
  consumptionMWh: number
}

export interface MetricsConsumptionGroupedLogEntry {
  ts: number
  powerW: Record<string, number>
  consumptionMWh: Record<string, number> | null
}

export interface MetricsConsumptionSummary {
  avgPowerW: number | null
  totalConsumptionMWh: number
}

export interface MetricsConsumptionGroupSummary {
  avgPowerW: number | null
  totalConsumptionMWh: number
}

export interface MetricsConsumptionGroupedSummary {
  avgPowerW: number | null
  totalConsumptionMWh: number
  groupedBy?: Record<string, MetricsConsumptionGroupSummary>
}

export type MetricsConsumptionResponse = MetricsResponse<
  MetricsConsumptionLogEntry,
  MetricsConsumptionSummary
>

export type MetricsConsumptionGroupedResponse = MetricsResponse<
  MetricsConsumptionGroupedLogEntry,
  MetricsConsumptionGroupedSummary
>

// /auth/metrics/efficiency
export interface MetricsEfficiencyLogEntry {
  ts: number
  efficiencyWThs: number
}

export interface MetricsEfficiencySummary {
  avgEfficiencyWThs: number | null
}

export type MetricsEfficiencyResponse = MetricsResponse<
  MetricsEfficiencyLogEntry,
  MetricsEfficiencySummary
>

// /auth/metrics/miner-status
export interface MetricsMinerStatusLogEntry {
  ts: number
  online: number
  offline: number
  sleep: number
  maintenance: number
}

export interface MetricsMinerStatusSummary {
  avgOnline: number | null
  avgOffline: number | null
  avgSleep: number | null
  avgMaintenance: number | null
}

export type MetricsMinerStatusResponse = MetricsResponse<
  MetricsMinerStatusLogEntry,
  MetricsMinerStatusSummary
>

// /auth/metrics/power-mode
export type MetricsInterval = '1h' | '1d' | '1w'

export interface MetricsPowerModeQueryParams extends MetricsQueryParams {
  interval?: MetricsInterval
}

export interface MetricsPowerModeLogEntry {
  ts: number
  low: number
  normal: number
  high: number
  sleep: number
  offline: number
  notMining: number
  maintenance: number
  error: number
}

export interface MetricsPowerModeSummary {
  avgLow: number | null
  avgNormal: number | null
  avgHigh: number | null
  avgSleep: number | null
  avgOffline: number | null
  avgNotMining: number | null
  avgMaintenance: number | null
  avgError: number | null
}

export type MetricsPowerModeResponse = MetricsResponse<
  MetricsPowerModeLogEntry,
  MetricsPowerModeSummary
>

// /auth/metrics/power-mode/timeline
export interface MetricsPowerModeTimelineQueryParams {
  start?: number
  end?: number
  container?: string
  overwriteCache?: boolean
}

export interface MetricsPowerModeTimelineSegment {
  from: number
  to: number
  powerMode: string
  status: string
}

export interface MetricsPowerModeTimelineLogEntry {
  minerId: string
  container: string
  segments: MetricsPowerModeTimelineSegment[]
}

export interface MetricsPowerModeTimelineResponse {
  log: MetricsPowerModeTimelineLogEntry[]
}

// /auth/metrics/temperature
export interface MetricsTemperatureQueryParams extends MetricsQueryParams {
  interval?: MetricsInterval
  container?: string
}

export interface MetricsTemperatureContainerStats {
  maxC: number
  avgC: number
}

export interface MetricsTemperatureLogEntry {
  ts: number
  containers: Record<string, MetricsTemperatureContainerStats>
  siteMaxC: number | null
  siteAvgC: number | null
}

export interface MetricsTemperatureSummary {
  avgMaxTemp: number | null
  avgAvgTemp: number | null
  peakTemp: number | null
}

export type MetricsTemperatureResponse = MetricsResponse<
  MetricsTemperatureLogEntry,
  MetricsTemperatureSummary
>

// Revenue Summary: /auth/finance/revenue-summary
export interface RevenueSummaryLogEntry {
  ts: number
  revenueBTC: number
  feesBTC: number
  revenueUSD: number
  feesUSD: number
  btcPrice: number
  powerW: number
  consumptionMWh: number
  hashrateMhs: number
  energyCostsUSD: number
  operationalCostsUSD: number
  totalCostsUSD: number
  ebitdaSelling: number
  ebitdaHodl: number
  btcProductionCost: number | null
  energyRevenuePerMWh: number | null
  allInCostPerMWh: number | null
  hashRevenueBTCPerPHsPerDay: number | null
  hashRevenueUSDPerPHsPerDay: number | null
  blockReward: number
  blockTotalFees: number
  curtailmentMWh: number | null
  curtailmentRate: number | null
  operationalIssuesRate: number | null
  powerUtilization: number | null
}

export interface RevenueSummaryTotals {
  totalRevenueBTC: number
  totalRevenueUSD: number
  totalFeesBTC: number
  totalFeesUSD: number
  totalCostsUSD: number
  totalConsumptionMWh: number
  avgCostPerMWh: number | null
  avgRevenuePerMWh: number | null
  avgBtcPrice: number | null
  avgCurtailmentRate: number | null
  avgPowerUtilization: number | null
  totalEbitdaSelling: number
  totalEbitdaHodl: number
  currentBtcPrice: number
}

export type RevenueSummaryResponse = FinanceResponse<RevenueSummaryLogEntry, RevenueSummaryTotals>

// EBITDA: /auth/finance/ebitda
export interface EbitdaLogEntry {
  ts: number
  revenueBTC: number
  revenueUSD: number
  btcPrice: number
  powerW: number
  hashrateMhs: number
  consumptionMWh: number
  energyCostsUSD: number
  operationalCostsUSD: number
  totalCostsUSD: number
  ebitdaSelling: number
  ebitdaHodl: number
  btcProductionCost: number | null
}

export interface EbitdaTotals {
  totalRevenueBTC: number
  totalRevenueUSD: number
  totalCostsUSD: number
  totalEbitdaSelling: number
  totalEbitdaHodl: number
  avgBtcProductionCost: number | null
  currentBtcPrice: number
}

export type EbitdaResponse = FinanceResponse<EbitdaLogEntry, EbitdaTotals>

// Energy Balance: /auth/finance/energy-balance
export interface EnergyBalanceLogEntry {
  ts: number
  powerW: number
  consumptionMWh: number
  revenueBTC: number
  revenueUSD: number
  btcPrice: number
  energyCostUSD: number
  totalCostUSD: number
  energyRevenuePerMWh: number | null
  allInCostPerMWh: number | null
  profitUSD: number
  curtailmentMWh: number | null
  curtailmentRate: number | null
  operationalIssuesRate: number | null
  powerUtilization: number | null
}

export interface EnergyBalanceTotals {
  totalRevenueBTC: number
  totalRevenueUSD: number
  totalCostUSD: number
  totalProfitUSD: number
  avgCostPerMWh: number | null
  avgRevenuePerMWh: number | null
  totalConsumptionMWh: number
  avgCurtailmentRate: number | null
  avgOperationalIssuesRate: number | null
  avgPowerUtilization: number | null
}

export type EnergyBalanceResponse = FinanceResponse<EnergyBalanceLogEntry, EnergyBalanceTotals>

// Cost Summary: /auth/finance/cost-summary
export interface CostSummaryLogEntry {
  ts: number
  consumptionMWh: number
  energyCostsUSD: number
  operationalCostsUSD: number
  totalCostsUSD: number
  allInCostPerMWh: number | null
  energyCostPerMWh: number | null
  btcPrice: number
}

export interface CostSummaryTotals {
  totalEnergyCostsUSD: number
  totalOperationalCostsUSD: number
  totalCostsUSD: number
  totalConsumptionMWh: number
  avgAllInCostPerMWh: number | null
  avgEnergyCostPerMWh: number | null
  avgBtcPrice: number | null
}

export type CostSummaryResponse = FinanceResponse<CostSummaryLogEntry, CostSummaryTotals>

// Subsidy & Fees: /auth/finance/subsidy-fees
export interface SubsidyFeesLogEntry {
  ts: number
  blockReward: number
  blockTotalFees: number
}

export interface SubsidyFeesTotals {
  totalBlockReward: number
  totalBlockTotalFees: number
  avgBlockReward: number | null
  avgBlockTotalFees: number | null
}

export type SubsidyFeesResponse = FinanceResponse<SubsidyFeesLogEntry, SubsidyFeesTotals>

// Revenue: /auth/finance/revenue
export interface FinanceRevenueQueryParams extends FinanceQueryParams {
  pool?: string
}

export interface FinanceRevenueLogEntry {
  ts: number
  revenueBTC: number
  feesBTC: number
  netRevenueBTC: number
}

export interface FinanceRevenueTotals {
  totalRevenueBTC: number
  totalFeesBTC: number
  totalNetRevenueBTC: number
}

export type FinanceRevenueResponse = FinanceResponse<FinanceRevenueLogEntry, FinanceRevenueTotals>

// Hash Revenue & Cost: /auth/finance/hash-revenue
export interface HashRevenueLogEntry {
  ts: number
  revenueBTC: number
  feesBTC: number
  revenueUSD: number
  feesUSD: number
  btcPrice: number
  hashrateMhs: number
  hashRevenueBTCPerPHsPerDay: number | null
  hashRevenueUSDPerPHsPerDay: number | null
  hashCostBTCPerPHsPerDay: number | null
  hashCostUSDPerPHsPerDay: number | null
  networkHashPriceBTCPerPHsPerDay: number | null
  networkHashPriceUSDPerPHsPerDay: number | null
  networkHashrateMhs: number
}

export interface HashRevenueTotals {
  avgHashRevenueBTCPerPHsPerDay: number | null
  avgHashRevenueUSDPerPHsPerDay: number | null
  avgHashCostBTCPerPHsPerDay: number | null
  avgHashCostUSDPerPHsPerDay: number | null
  avgNetworkHashPriceBTCPerPHsPerDay: number | null
  avgNetworkHashPriceUSDPerPHsPerDay: number | null
  totalRevenueBTC: number
  totalRevenueUSD: number
  totalFeesBTC: number
  totalFeesUSD: number
}

export type HashRevenueResponse = FinanceResponse<HashRevenueLogEntry, HashRevenueTotals>

import type { Device } from '@/hooks/hooks.types'

export type PoolEndpoint = {
  role?: string | null
  region?: string | null
  host: string
  port: string
  pool: string
  url?: string
  [key: string]: unknown
}

export type PoolEndpointFormValues = Omit<PoolEndpoint, 'role' | 'region'>

export type PoolSummary = {
  id?: string
  name: string
  description: string
  units: number
  miners: number
  endpoints: Array<PoolEndpoint>
  workerName: string
  workerPassword: string
  validation?: {
    status: string
  }
  credentialsTemplate?: {
    workerName: string
    suffixType: string
  }
  updatedAt: Date
}

export interface MinerRecord {
  id: string
  code: string
  status?: string
  unit?: string
  hashrate?: number
  lastSyncedAt: Date
  tags?: string[]
  pool?: string
  raw: Device
}

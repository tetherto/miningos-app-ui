// Redux type definitions
import type { Store } from '@reduxjs/toolkit'
import type { TypedUseSelectorHook } from 'react-redux'

// ============================================================================
// Slice State Interfaces
// ============================================================================

export interface ThemeState {
  value: 'light' | 'dark'
  sidebar: boolean
  isAlertEnabled: boolean
}

export interface TimezoneState {
  timezone: string
}

export interface AuthState {
  token: string | null
  permissions: unknown | null
}

export interface UserInfoMetadata {
  email: string
  id: number
  roles: string
  password: string | null
}
export interface UserInfoState extends Partial<UserInfoMetadata> {
  created?: number
  ips?: string[]
  metadata?: UserInfoMetadata | null
  token?: string
  ttl?: number
  userId?: number
}

export interface DeviceTag {
  isPosTag: boolean
  minerId: string
}

export interface DeviceTagPayload {
  id: string
  info: {
    container?: string
    pos?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface SocketData {
  containerId: string
  minerId: string
  pduIndex: number | string
  socketIndex: number | string
  socket?: string
  enabled?: boolean
  power_w?: number
  current_a?: number
  miner: {
    id: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface ContainerSockets {
  sockets: SocketData[]
}

export interface DevicesState {
  selectedDevices: Array<{ id: string; [key: string]: unknown }>
  selectedSockets: Record<string, ContainerSockets>
  filterTags: string[]
  selectedDevicesTags: Record<string, Record<string, DeviceTag>>
  selectedContainers: Record<string, unknown>
  selectedLvCabinets: Record<string, unknown>
}

export interface MinerEntity {
  mac?: string
  selected: boolean
  collapsed: boolean
  [key: string]: unknown
}

export interface MinersState {
  entities: Record<string, MinerEntity>
  visibleColumns: Record<string, boolean>
}

export interface PduState {
  isPduLayout: boolean
}

export interface NotificationState {
  count: number
}

export interface MultiSiteDateRange {
  start: number
  end: number
  period: string
}

export type TimeframeType = 'year' | 'month' | 'week'

export interface MultiSiteState {
  selectedSites: string[]
  isManualSelection: boolean
  dateRange: MultiSiteDateRange | null
  timeframeType: TimeframeType | null
}

export interface ActionsSidebarData {
  type: string
  actions: unknown[]
}

export interface ActionsSidebarState {
  isActionsSidebarOpen: boolean
  currentActionsData: ActionsSidebarData
  isActionsSidebarPinned: boolean
}

export interface PendingSubmissionAction {
  id: number
  tags?: string[]
  [key: string]: unknown
}

export interface ActionsState {
  pendingSubmissions: PendingSubmissionAction[]
}

export interface SidebarState {
  isExpanded: boolean
}

// ============================================================================
// Root State Interface
// ============================================================================

export interface RootState {
  theme: ThemeState
  timezone: TimezoneState
  auth: AuthState
  devices: DevicesState
  miners: MinersState
  pdu: PduState
  notifications: NotificationState
  multiSite: MultiSiteState
  actionsSidebar: ActionsSidebarState
  actions: ActionsState
  sidebar: SidebarState
  userInfo: UserInfoState
  api: unknown // RTK Query state - typed by RTK Query
}

// ============================================================================
// Redux Store Types
// ============================================================================

export type AppStore = Store<RootState>
export type AppDispatch = AppStore['dispatch']

// ============================================================================
// Typed Redux Hooks
// ============================================================================

export type AppSelector<TSelected = unknown> = (state: RootState) => TSelected
export type TypedUseAppSelector = TypedUseSelectorHook<RootState>

// ============================================================================
// Action Types
// ============================================================================

export interface BaseAction<TPayload = unknown> {
  type: string
  payload?: TPayload
}

export interface AsyncActionState<T = unknown> {
  data: T | null
  loading: boolean
  error: string | null
}

// ============================================================================
// Redux Persist Types
// ============================================================================

export interface PersistConfig {
  key: string
  storage: unknown
  whitelist: string[]
}

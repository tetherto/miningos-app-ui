/**
 * Redux Store Type Definitions
 */

import type { store } from './index';

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
}

export interface ThemeState {
  value: 'dark' | 'light';
  isAlertEnabled: boolean;
}

export interface TimezoneState {
  timezone: string;
  offset: number;
}

export interface UserInfoState {
  email: string | null;
  name: string | null;
  picture: string | null;
  roles: string[];
}

export interface SidebarState {
  isExpanded: boolean;
}

export interface MultiSiteState {
  isEnabled: boolean;
  currentSite: string | null;
  sites: string[];
}

export interface DevicesState {
  selectedDevices: string[];
  cachedDevices: Record<string, unknown>;
}

export interface ActionsState {
  pendingActions: unknown[];
  processingActions: string[];
}

export interface MinersState {
  selectedMiners: string[];
}

export interface PduState {
  selectedPdus: string[];
}

export interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
}

export interface ActionsSidebarState {
  isPinned: boolean;
  isOpen: boolean;
}

export interface RootState {
  auth: AuthState;
  theme: ThemeState;
  timezone: TimezoneState;
  userInfo: UserInfoState;
  sidebar: SidebarState;
  multiSite: MultiSiteState;
  devices: DevicesState;
  actions: ActionsState;
  miners: MinersState;
  pdu: PduState;
  notifications: NotificationState;
  actionsSidebar: ActionsSidebarState;
}

export type AppDispatch = typeof store.dispatch;

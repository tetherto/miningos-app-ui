/**
 * Navigation Type Definitions
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack Navigator
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<DrawerParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  SignIn: undefined;
};

// Drawer Navigator
export type DrawerParamList = {
  DashboardTab: NavigatorScreenParams<DashboardTabParamList>;
  OperationsTab: NavigatorScreenParams<OperationsTabParamList>;
  ReportsTab: NavigatorScreenParams<ReportsTabParamList>;
  InventoryTab: NavigatorScreenParams<InventoryTabParamList>;
  PoolManagerTab: NavigatorScreenParams<PoolManagerTabParamList>;
  AlertsTab: NavigatorScreenParams<AlertsTabParamList>;
  SettingsTab: NavigatorScreenParams<SettingsTabParamList>;
};

// Dashboard Tab Stack
export type DashboardTabParamList = {
  Dashboard: undefined;
};

// Operations Tab Stack
export type OperationsTabParamList = {
  OperationsHome: undefined;
  MiningExplorer: { tab?: string };
  EnergyOperations: undefined;
  ContainerWidgets: undefined;
  ContainerCharts: undefined;
  Cabinet: { id: string };
  Thing: { tag: string; id: string; tab?: string };
  Things: { tag: string };
};

// Reports Tab Stack
export type ReportsTabParamList = {
  ReportsHome: undefined;
  OperationsDashboard: undefined;
  HashrateReport: undefined;
  EnergyReport: undefined;
  MinersReport: undefined;
  EfficiencyReport: undefined;
  RevenueSummary: undefined;
  CostSummary: undefined;
  EBITDA: undefined;
  SubsidyFee: undefined;
  EnergyRevenue: undefined;
  HashBalance: undefined;
  CostInput: undefined;
  EnergyBalance: undefined;
};

// Inventory Tab Stack
export type InventoryTabParamList = {
  InventoryDashboard: undefined;
  SpareParts: undefined;
  Miners: undefined;
  Repairs: undefined;
  HistoricalMovements: { deviceId?: string };
};

// Pool Manager Tab Stack
export type PoolManagerTabParamList = {
  PoolManagerDashboard: undefined;
  PoolEndpoints: undefined;
  SitesOverview: undefined;
  SiteOverviewDetails: { unit: string };
  MinerExplorer: undefined;
};

// Alerts Tab Stack
export type AlertsTabParamList = {
  AlertsHome: undefined;
  AlertDetails: { id: string };
};

// Settings Tab Stack
export type SettingsTabParamList = {
  SettingsDashboard: undefined;
  UserManagement: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type DrawerScreenPropsType<T extends keyof DrawerParamList> =
  DrawerScreenProps<DrawerParamList, T>;

export type DashboardTabScreenProps<T extends keyof DashboardTabParamList> =
  NativeStackScreenProps<DashboardTabParamList, T>;

export type OperationsTabScreenProps<T extends keyof OperationsTabParamList> =
  NativeStackScreenProps<OperationsTabParamList, T>;

export type ReportsTabScreenProps<T extends keyof ReportsTabParamList> =
  NativeStackScreenProps<ReportsTabParamList, T>;

export type InventoryTabScreenProps<T extends keyof InventoryTabParamList> =
  NativeStackScreenProps<InventoryTabParamList, T>;

export type PoolManagerTabScreenProps<T extends keyof PoolManagerTabParamList> =
  NativeStackScreenProps<PoolManagerTabParamList, T>;

export type AlertsTabScreenProps<T extends keyof AlertsTabParamList> =
  NativeStackScreenProps<AlertsTabParamList, T>;

export type SettingsTabScreenProps<T extends keyof SettingsTabParamList> =
  NativeStackScreenProps<SettingsTabParamList, T>;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

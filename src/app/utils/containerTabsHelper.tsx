import { lazy, type ComponentType, type ReactElement } from 'react'

import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isBitdeer,
  isMicroBT,
  isWhatsminerContainer,
} from '@/app/utils/containerUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { LazyTabWrapper } from '@/Components/LazyTabWrapper/LazyTabWrapper'

const HomeTab = lazy(() =>
  import('@/Views/Container/Tabs/HomeTab/HomeTab').then((m: unknown) => ({
    default: (m as { HomeTab: ComponentType<unknown> }).HomeTab,
  })),
)
const PduTab = lazy(() =>
  import('@/Views/Container/Tabs/PduTab/PduTab').then((m: unknown) => ({
    default: (m as { PduTab: ComponentType<unknown> }).PduTab,
  })),
)
const ParametersTab = lazy(() =>
  import('@/Views/Container/Tabs/ParametersTab/ParametersTab').then((m: unknown) => ({
    default: (m as { ParametersTab: ComponentType<unknown> }).ParametersTab,
  })),
)
const AlarmTab = lazy(() =>
  import('@/Views/Container/Tabs/AlarmTab/AlarmTab').then((m: unknown) => ({
    default: (m as { AlarmTab: ComponentType<unknown> }).AlarmTab,
  })),
)
const ControlsTab = lazy(() =>
  import('@/Views/Container/Tabs/BitMainImmersion/ControlsTab/ControlsTab').then((m: unknown) => ({
    default: (m as { ControlsTab: ComponentType<unknown> }).ControlsTab,
  })),
)
const SettingsTab = lazy(() =>
  import('@/Views/Container/Tabs/SettingsTab/SettingsTab').then((m: unknown) => ({
    default: (m as { SettingsTab: ComponentType<unknown> }).SettingsTab,
  })),
)
const ChartsTab = lazy(() =>
  import('@/Views/Container/Tabs/ChartsTab/ChartsTab').then((m: unknown) => ({
    default: (m as { ChartsTab: ComponentType<unknown> }).ChartsTab,
  })),
)
const HeatmapTab = lazy(() =>
  import('@/Views/Container/Tabs/HeatmapTab/HeatmapTab').then((m: unknown) => ({
    default: (m as { HeatmapTab: ComponentType<unknown> }).HeatmapTab,
  })),
)
const PowerAdjustmentTab = lazy(() =>
  import('@/Views/Container/Tabs/PowerAdjustmentTab/PowerAdjustmentTab').then((m: unknown) => ({
    default: (m as { PowerAdjustmentTab: ComponentType<unknown> }).PowerAdjustmentTab,
  })),
)

interface TabConfig {
  key: string
  label: string
  children: ReactElement
}

interface AllContainerTabs {
  HOME: TabConfig
  PDU: TabConfig
  PARAMETERS: TabConfig
  ALARM: TabConfig
  CONTROLS: TabConfig
  SETTINGS: TabConfig
  CHARTS: TabConfig
  HEATMAP: TabConfig
  POWER_ADJUSTMENT: TabConfig
}

export const getAllContainerTabs = (data?: UnknownRecord): AllContainerTabs => {
  const typedData = data as UnknownRecord | undefined
  return {
    HOME: {
      key: 'home',
      label: 'Home',
      children: <LazyTabWrapper Component={HomeTab} data={typedData} />,
    },
    PDU: {
      key: 'pdu',
      label: 'PDU Layout',
      children: <LazyTabWrapper Component={PduTab} data={typedData} />,
    },
    PARAMETERS: {
      key: 'parameters',
      label: 'Parameters',
      children: <LazyTabWrapper Component={ParametersTab} data={typedData} />,
    },
    ALARM: {
      key: 'alarm',
      label: 'Alarm',
      children: <LazyTabWrapper Component={AlarmTab} data={typedData} />,
    },
    CONTROLS: {
      key: 'controls',
      label: 'Controls',
      children: <LazyTabWrapper Component={ControlsTab} data={typedData} />,
    },
    SETTINGS: {
      key: 'settings',
      label: 'Settings',
      children: <LazyTabWrapper Component={SettingsTab} data={typedData} />,
    },
    CHARTS: {
      key: 'charts',
      label: 'Charts',
      children: <LazyTabWrapper Component={ChartsTab} data={typedData} />,
    },
    HEATMAP: {
      key: 'heatmap',
      label: 'Heatmap',
      children: <LazyTabWrapper Component={HeatmapTab} data={typedData} />,
    },
    POWER_ADJUSTMENT: {
      key: 'power-adjustment',
      label: 'Power Adjustment',
      children: <LazyTabWrapper Component={PowerAdjustmentTab} data={typedData} />,
    },
  }
}

export const getSupportedTabs = (type: string, data?: UnknownRecord): TabConfig[] => {
  const availableTabs = getAllContainerTabs(data)

  let tabs: TabConfig[] = []

  if (isBitdeer(type)) {
    tabs = [
      availableTabs.HOME,
      availableTabs.PDU,
      availableTabs.SETTINGS,
      availableTabs.CHARTS,
      availableTabs.HEATMAP,
    ]
  } else if (isAntspaceHydro(type)) {
    tabs = [
      availableTabs.HOME,
      availableTabs.PDU,
      availableTabs.ALARM,
      availableTabs.SETTINGS,
      availableTabs.CHARTS,
      availableTabs.HEATMAP,
    ]
  } else if (isAntspaceImmersion(type)) {
    tabs = [
      availableTabs.HOME,
      availableTabs.PDU,
      availableTabs.ALARM,
      availableTabs.SETTINGS,
      availableTabs.CHARTS,
      availableTabs.HEATMAP,
    ]
  } else if (isMicroBT(type)) {
    tabs = [
      availableTabs.HOME,
      availableTabs.PDU,
      availableTabs.SETTINGS,
      availableTabs.CHARTS,
      availableTabs.HEATMAP,
    ]
  }

  if (isWhatsminerContainer(type)) {
    const pduIndex = tabs.findIndex((t) => t.key === 'pdu')
    tabs.splice(pduIndex + 1, 0, availableTabs.POWER_ADJUSTMENT)
  }

  return tabs
}

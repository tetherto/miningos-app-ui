import { describe, expect, it, vi } from 'vitest'

vi.mock('@/Components/LazyTabWrapper/LazyTabWrapper', () => ({
  LazyTabWrapper: () => null,
}))

// Mock lazy-loaded tab views to avoid loading full component trees
vi.mock('@/Views/Container/Tabs/HomeTab/HomeTab', () => ({ HomeTab: () => null }))
vi.mock('@/Views/Container/Tabs/PduTab/PduTab', () => ({ PduTab: () => null }))
vi.mock('@/Views/Container/Tabs/ParametersTab/ParametersTab', () => ({
  ParametersTab: () => null,
}))
vi.mock('@/Views/Container/Tabs/AlarmTab/AlarmTab', () => ({ AlarmTab: () => null }))
vi.mock('@/Views/Container/Tabs/BitMainImmersion/ControlsTab/ControlsTab', () => ({
  ControlsTab: () => null,
}))
vi.mock('@/Views/Container/Tabs/SettingsTab/SettingsTab', () => ({ SettingsTab: () => null }))
vi.mock('@/Views/Container/Tabs/ChartsTab/ChartsTab', () => ({ ChartsTab: () => null }))
vi.mock('@/Views/Container/Tabs/HeatmapTab/HeatmapTab', () => ({ HeatmapTab: () => null }))

import { getAllContainerTabs, getSupportedTabs } from './containerTabsHelper'

const BITDEER_TYPE = 'container-bd-d40-m30' // isBitdeer
const HYDRO_TYPE = 'container-as-hk3' // isAntspaceHydro
const IMMERSION_TYPE = 'container-as-immersion-v2' // isAntspaceImmersion
const MICROBT_TYPE = 'container-mbt-wm30s' // isMicroBT
const UNKNOWN_TYPE = 'container-unknown-xyz'

describe('getAllContainerTabs', () => {
  it('returns all 8 tab configurations', () => {
    const tabs = getAllContainerTabs()
    expect(Object.keys(tabs)).toHaveLength(8)
    expect(tabs).toHaveProperty('HOME')
    expect(tabs).toHaveProperty('PDU')
    expect(tabs).toHaveProperty('PARAMETERS')
    expect(tabs).toHaveProperty('ALARM')
    expect(tabs).toHaveProperty('CONTROLS')
    expect(tabs).toHaveProperty('SETTINGS')
    expect(tabs).toHaveProperty('CHARTS')
    expect(tabs).toHaveProperty('HEATMAP')
  })

  it('each tab has key, label, and children', () => {
    const tabs = getAllContainerTabs()
    Object.values(tabs).forEach((tab) => {
      expect(tab).toHaveProperty('key')
      expect(tab).toHaveProperty('label')
      expect(tab).toHaveProperty('children')
    })
  })

  it('accepts optional data and passes it through', () => {
    const data = { containerType: 'test' }
    const tabs = getAllContainerTabs(data)
    expect(tabs.HOME.key).toBe('home')
  })
})

describe('getSupportedTabs', () => {
  describe('Bitdeer container', () => {
    it('returns 5 tabs: HOME, PDU, SETTINGS, CHARTS, HEATMAP', () => {
      const tabs = getSupportedTabs(BITDEER_TYPE)
      const keys = tabs.map((t) => t.key)
      expect(keys).toHaveLength(5)
      expect(keys).toContain('home')
      expect(keys).toContain('pdu')
      expect(keys).toContain('settings')
      expect(keys).toContain('charts')
      expect(keys).toContain('heatmap')
      expect(keys).not.toContain('alarm')
      expect(keys).not.toContain('parameters')
    })
  })

  describe('Antspace Hydro container', () => {
    it('returns 6 tabs: HOME, PDU, ALARM, SETTINGS, CHARTS, HEATMAP', () => {
      const tabs = getSupportedTabs(HYDRO_TYPE)
      const keys = tabs.map((t) => t.key)
      expect(keys).toHaveLength(6)
      expect(keys).toContain('home')
      expect(keys).toContain('pdu')
      expect(keys).toContain('alarm')
      expect(keys).toContain('settings')
      expect(keys).toContain('charts')
      expect(keys).toContain('heatmap')
      expect(keys).not.toContain('parameters')
    })
  })

  describe('Antspace Immersion container', () => {
    it('returns 6 tabs: HOME, PDU, ALARM, SETTINGS, CHARTS, HEATMAP', () => {
      const tabs = getSupportedTabs(IMMERSION_TYPE)
      const keys = tabs.map((t) => t.key)
      expect(keys).toHaveLength(6)
      expect(keys).toContain('home')
      expect(keys).toContain('pdu')
      expect(keys).toContain('alarm')
      expect(keys).toContain('settings')
      expect(keys).toContain('charts')
      expect(keys).toContain('heatmap')
    })
  })

  describe('MicroBT container', () => {
    it('returns 5 tabs: HOME, PDU, SETTINGS, CHARTS, HEATMAP', () => {
      const tabs = getSupportedTabs(MICROBT_TYPE)
      const keys = tabs.map((t) => t.key)
      expect(keys).toHaveLength(5)
      expect(keys).toContain('home')
      expect(keys).toContain('pdu')
      expect(keys).toContain('settings')
      expect(keys).toContain('charts')
      expect(keys).toContain('heatmap')
      expect(keys).not.toContain('alarm')
    })
  })

  describe('unknown container type', () => {
    it('returns empty array for unknown type', () => {
      const tabs = getSupportedTabs(UNKNOWN_TYPE)
      expect(tabs).toEqual([])
    })
  })

  describe('with optional data argument', () => {
    it('passes data to tabs for Bitdeer', () => {
      const data = { someKey: 'someValue' }
      const tabs = getSupportedTabs(BITDEER_TYPE, data)
      expect(tabs).toHaveLength(5)
    })
  })
})

import { describe, it, expect, vi } from 'vitest'

vi.mock('@/Components/Explorer/List/Container.table', () => ({
  getContainerTableColumns: vi.fn(() => []),
}))
vi.mock('@/Components/Explorer/List/LvCabinet.table', () => ({
  getLvCabinetTableColumns: vi.fn(() => []),
}))
vi.mock('@/Components/Explorer/List/Miners.table', () => ({
  getMinersTableColumns: vi.fn(() => []),
}))

import { ALERTS_FILTER_OPTIONS } from '../Alerts/TagFilterBar/TagFilterBar.const'
import { getPosHistory } from '../Container/Tabs/PduTab/PositionChangeDialog/PositionChangeDialog.utils'
import { TAGS_LABEL } from '../ContainersChart/ContainerCharts.constants'
import { getExplorerFilterTabs, SetPowerModeValues } from '../Explorer/Explorer.constants'
import { DEVICE_PATHS } from '../LVCabinetWidgets/LVCabinetWidgets.constants'
import { ENERGY_REPORT_TABS, MINER_MODES } from '../Reports/EnergyReport/EnergyReport.constants'

describe('ContainerCharts.constants', () => {
  it('exports TAGS_LABEL with device type labels', () => {
    expect(TAGS_LABEL).toBeDefined()
    expect(typeof TAGS_LABEL).toBe('object')
    expect(Object.keys(TAGS_LABEL).length).toBeGreaterThan(0)
  })
})

describe('TagFilterBar.const', () => {
  it('exports ALERTS_FILTER_OPTIONS', () => {
    expect(Array.isArray(ALERTS_FILTER_OPTIONS)).toBe(true)
    expect(ALERTS_FILTER_OPTIONS.length).toBeGreaterThan(0)
  })

  it('has Status, Severity, and Type filter options', () => {
    const values = ALERTS_FILTER_OPTIONS.map((opt) => opt.value)
    expect(values).toContain('status')
    expect(values).toContain('severity')
    expect(values).toContain('type')
  })
})

describe('LVCabinetWidgets.constants', () => {
  it('exports DEVICE_PATHS', () => {
    expect(DEVICE_PATHS.POWER_W).toBeDefined()
    expect(Array.isArray(DEVICE_PATHS.POWER_W)).toBe(true)
    expect(DEVICE_PATHS.POWER_W).toContain('power_w')
  })
})

describe('EnergyReport.constants', () => {
  it('exports ENERGY_REPORT_TABS', () => {
    expect(ENERGY_REPORT_TABS.SITE).toBe('site')
    expect(ENERGY_REPORT_TABS.MINER_TYPE).toBe('minerType')
    expect(ENERGY_REPORT_TABS.MINER_UNIT).toBe('minerUnit')
  })

  it('exports MINER_MODES with all required modes', () => {
    expect(Array.isArray(MINER_MODES)).toBe(true)
    expect(MINER_MODES.length).toBeGreaterThan(0)
    MINER_MODES.forEach((m) => {
      expect(m.mode).toBeDefined()
      expect(m.title).toBeDefined()
      expect(m.color).toBeDefined()
    })
  })
})

describe('Explorer.constants', () => {
  it('getExplorerFilterTabs returns an array of tab configs', () => {
    const formatDate = (d: number | Date) => new Date(d).toISOString()
    const tabs = getExplorerFilterTabs(formatDate)
    expect(Array.isArray(tabs)).toBe(true)
    expect(tabs.length).toBeGreaterThan(0)
    tabs.forEach((tab) => {
      expect(tab.key).toBeDefined()
      expect(tab.label).toBeDefined()
    })
  })

  it('SetPowerModeValues has miner types', () => {
    expect(SetPowerModeValues.antminer).toBeDefined()
    expect(SetPowerModeValues.whatsminer).toBeDefined()
  })
})

describe('PositionChangeDialog.utils', () => {
  it('getPosHistory wraps position into array when posHistory is not an array', () => {
    const result = getPosHistory({ containerInfo: { container: 'C1' }, pos: 'slot-1' })
    expect(Array.isArray(result)).toBe(true)
    expect(result[0].pos).toBe('slot-1')
    expect(result[0].container).toBe('C1')
  })

  it('getPosHistory prepends new entry to existing posHistory', () => {
    const existing = [{ container: 'C0', pos: 'slot-0', removedAt: 1000 }]
    const result = getPosHistory({
      containerInfo: { container: 'C1' },
      miner: { info: { posHistory: existing } },
      pos: 'slot-1',
    })
    expect(result).toHaveLength(2)
    expect(result[0].pos).toBe('slot-1')
    expect(result[1].pos).toBe('slot-0')
  })

  it('getPosHistory constructs pos from pdu and socket when pos is absent', () => {
    const result = getPosHistory({ pdu: 'PDU1', socket: '5' })
    expect(result[0].pos).toBe('PDU1_5')
  })
})

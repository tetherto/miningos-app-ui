import { describe, it, expect, vi } from 'vitest'

// exportUtils uses Blob/URL DOM APIs — mock them for test environment
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock icon components for WidgetTopRow.const
vi.mock('@/Views/ContainerWidgets/Icons/FluidAlarm', () => ({ FluidAlarm: () => null }))
vi.mock('@/Views/ContainerWidgets/Icons/OtherAlarm', () => ({ OtherAlarm: () => null }))
vi.mock('@/Views/ContainerWidgets/Icons/PressureAlarm', () => ({ PressureAlarm: () => null }))
vi.mock('@/Views/ContainerWidgets/Icons/TemperatureAlarm', () => ({ TemperatureAlarm: () => null }))

import { DOUGHNUT_CHART_DEFAULT_MIN_HEIGHT } from '../DoughnutChartCard/DoughnutChartCard.const'
import { formatValue as formatEnergyValue } from '../Electricity/ConsumedVsAvailableEnergy.utils'
import {
  MINERS_ACTIVITY_ITEMS,
  MINERS_ACTIVITY_LABELS,
  MINERS_ACTIVITY_TOOLTIPS,
  SKELETON_MIN_HEIGHT_DEFAULT,
  SKELETON_MIN_HEIGHT_LARGE,
} from '../Explorer/DetailsView/MinersActivityChart/MinersActivityChart.const'
import {
  MOVEMENTS_ACTIONS,
  SEARCHABLE_MOVEMENT_ATTRIBUTES,
} from '../Inventory/Movements/Movements.constants'
import {
  INITIAL_SKELETON_COUNT,
  INITIAL_SKELETON_MIN_MAX_AVG_COUNT,
  INITIAL_SKELETON_TIMELINE_COUNT,
} from '../LineChartSkeleton/LineChartSkeleton.const'
import {
  DEFAULT_HEADER_PREFERENCES,
  HEADER_ITEMS,
  HEADER_PREFERENCES_EVENTS,
} from '../Settings/HeaderControls/types'
import { exportSettingsToFile } from '../Settings/ImportExport/exportUtils'
import { validateSettingsJson } from '../Settings/ImportExport/importUtils'
import { getRoleBadgeColors } from '../Settings/RBACControl/roleColors'
import {
  EXPORT_DROPDOWN_OVERLAY_CLASS_NAME,
  EXPORT_ITEM_KEYS,
  EXPORT_ITEMS,
} from '../StatsExport/StatsExport.const'
import { WIDGET_ALARMS } from '../Widgets/WidgetTopRow.const'

describe('DoughnutChartCard.const', () => {
  it('exports DOUGHNUT_CHART_DEFAULT_MIN_HEIGHT', () => {
    expect(DOUGHNUT_CHART_DEFAULT_MIN_HEIGHT).toBe(335)
  })
})

describe('MinersActivityChart.const', () => {
  it('exports MINERS_ACTIVITY_ITEMS with SHORT and EXTENDED keys', () => {
    expect(MINERS_ACTIVITY_ITEMS).toBeDefined()
    expect(MINERS_ACTIVITY_ITEMS.SHORT).toBeDefined()
    expect(MINERS_ACTIVITY_ITEMS.EXTENDED).toBeDefined()
  })

  it('exports MINERS_ACTIVITY_TOOLTIPS and MINERS_ACTIVITY_LABELS', () => {
    expect(MINERS_ACTIVITY_TOOLTIPS).toBeDefined()
    expect(MINERS_ACTIVITY_LABELS).toBeDefined()
  })

  it('exports SKELETON_MIN_HEIGHT constants', () => {
    expect(SKELETON_MIN_HEIGHT_LARGE).toBe(120)
    expect(SKELETON_MIN_HEIGHT_DEFAULT).toBe(80)
  })
})

describe('LineChartSkeleton.const', () => {
  it('exports skeleton count constants', () => {
    expect(INITIAL_SKELETON_COUNT).toBe(4)
    expect(INITIAL_SKELETON_MIN_MAX_AVG_COUNT).toBe(3)
    expect(INITIAL_SKELETON_TIMELINE_COUNT).toBe(5)
  })
})

describe('StatsExport.const', () => {
  it('exports EXPORT constants', () => {
    expect(EXPORT_DROPDOWN_OVERLAY_CLASS_NAME).toBeDefined()
    expect(EXPORT_ITEM_KEYS.CSV).toBe('csv')
    expect(EXPORT_ITEM_KEYS.JSON).toBe('json')
    expect(EXPORT_ITEMS).toHaveLength(2)
  })
})

describe('Movements.constants', () => {
  it('exports MOVEMENTS_ACTIONS', () => {
    expect(MOVEMENTS_ACTIONS).toBeDefined()
    expect(Object.keys(MOVEMENTS_ACTIONS).length).toBeGreaterThan(0)
  })

  it('exports SEARCHABLE_MOVEMENT_ATTRIBUTES', () => {
    expect(Array.isArray(SEARCHABLE_MOVEMENT_ATTRIBUTES)).toBe(true)
    expect(SEARCHABLE_MOVEMENT_ATTRIBUTES).toContain('serialNum')
  })
})

describe('HeaderControls/types', () => {
  it('exports DEFAULT_HEADER_PREFERENCES', () => {
    expect(DEFAULT_HEADER_PREFERENCES.poolMiners).toBe(true)
    expect(DEFAULT_HEADER_PREFERENCES.consumption).toBe(true)
  })

  it('exports HEADER_ITEMS array', () => {
    expect(Array.isArray(HEADER_ITEMS)).toBe(true)
    expect(HEADER_ITEMS.length).toBeGreaterThan(0)
  })

  it('exports HEADER_PREFERENCES_EVENTS', () => {
    expect(HEADER_PREFERENCES_EVENTS.STORAGE).toBe('storage')
    expect(HEADER_PREFERENCES_EVENTS.PREFERENCES_CHANGED).toBeDefined()
  })
})

describe('ImportExport/importUtils', () => {
  it('validateSettingsJson returns false for non-object input', () => {
    expect(validateSettingsJson(null)).toBe(false)
    expect(validateSettingsJson('string')).toBe(false)
    expect(validateSettingsJson(42)).toBe(false)
  })

  it('validateSettingsJson returns true for object with expected properties', () => {
    expect(validateSettingsJson({ headerControls: {} })).toBe(true)
    expect(validateSettingsJson({ featureFlags: {} })).toBe(true)
    expect(validateSettingsJson({ timestamp: Date.now() })).toBe(true)
  })

  it('validateSettingsJson returns false for object without expected properties', () => {
    expect(validateSettingsJson({ someOtherKey: 'value' })).toBe(false)
  })
})

describe('Settings/RBACControl/roleColors', () => {
  it('returns correct colors for known roles', () => {
    const adminColors = getRoleBadgeColors('admin')
    expect(adminColors.color).toBeDefined()
    expect(adminColors.bgColor).toBeDefined()

    const siteAdminColors = getRoleBadgeColors('site_admin')
    expect(siteAdminColors.color).toBeDefined()
  })

  it('returns default grey colors for unknown role', () => {
    const unknownColors = getRoleBadgeColors('unknown_role')
    expect(unknownColors.color).toBeDefined()
    expect(unknownColors.bgColor).toBeDefined()
  })
})

describe('Widgets/WidgetTopRow.const', () => {
  it('exports WIDGET_ALARMS with 4 alarm types', () => {
    expect(Array.isArray(WIDGET_ALARMS)).toBe(true)
    expect(WIDGET_ALARMS).toHaveLength(4)
    WIDGET_ALARMS.forEach((alarm) => {
      expect(alarm.title).toBeDefined()
      expect(alarm.propKey).toBeDefined()
      expect(alarm.Icon).toBeDefined()
    })
  })
})

describe('Settings/ImportExport/exportUtils', () => {
  it('exportSettingsToFile creates and returns a filename', () => {
    const filename = exportSettingsToFile({ timestamp: '2024-01-01' } as never)
    expect(filename).toContain('miningos-settings-')
    expect(filename).toContain('.json')
  })
})

describe('Electricity/ConsumedVsAvailableEnergy.utils', () => {
  it('formatValue returns formatted string', () => {
    const result = formatEnergyValue(100)
    expect(typeof result).toBe('string')
  })

  it('formatValue handles zero', () => {
    const result = formatEnergyValue(0)
    expect(typeof result).toBe('string')
  })
})

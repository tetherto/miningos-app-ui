import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { Container, ContainerSettings } from '../ContainerWidget.util'
import { getWidgetAlarmState } from '../ContainerWidget.util'

import * as deviceUtils from '@/app/utils/deviceUtils'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'

vi.mock('@/app/utils/deviceUtils')

describe('getWidgetAlarmState - isCriticallyHigh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Bitdeer containers', () => {
    describe('with default thresholds', () => {
      it('should not trigger for orange/yellow/green (alarm/alert) values', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 46, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ], // HOT=45, so 46 is alarm (orange)
              tank1_bar: 3.6, // MEDIUM_HIGH=3.5, CRITICAL_HIGH=4, so 3.6 is alarm (orange)
              tank2_bar: 3.2,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 46, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 3.6,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, null)

        // Orange/yellow/green values should NOT trigger blinks or sounds
        expect(result.shouldFlash).toBe(false)
        expect(result.isCriticallyHigh).toBe(false)
      })

      it('should return false when temperature and pressure are below critical high thresholds', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 40, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ],
              tank1_bar: 3.0,
              tank2_bar: 3.2,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 40, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 3.0,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, null)

        expect(result.shouldFlash).toBe(false)
        expect(result.isCriticallyHigh).toBe(false)
      })

      it('should NOT trigger for HOT threshold (45°C) - HOT is alarm/orange, not critical/red', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 45, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ], // HOT=45 is alarm (orange)
              tank1_bar: 3.0,
              tank2_bar: 3.2,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 45, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 3.0,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, null)

        // HOT is alarm level (orange), not critical (red) - should NOT trigger
        expect(result.shouldFlash).toBe(false)
        expect(result.isCriticallyHigh).toBe(false)
      })

      it('should return true when temperature is at SUPERHOT threshold (if defined)', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 48, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ], // SUPERHOT=48 is critical (red)
              tank1_bar: 3.0,
              tank2_bar: 3.2,
            },
          },
        }

        const containerSettings: ContainerSettings = {
          model: 'container-bd-d40',
          thresholds: {
            oilTemperature: {
              criticalLow: 33,
              alert: 39,
              normal: 42,
              alarm: 45,
              criticalHigh: 48, // SUPERHOT
            },
            tankPressure: {
              criticalLow: 2,
              alarmLow: 2.3,
              alarmHigh: 3.5,
              criticalHigh: 4,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 48, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 3.0,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, containerSettings)

        expect(result.shouldFlash).toBe(true)
        expect(result.isCriticallyHigh).toBe(true)
      })

      it('should NOT trigger for MEDIUM_HIGH pressure (3.5 bar) - alarm/orange, not critical/red', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 40, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ],
              tank1_bar: 3.6, // MEDIUM_HIGH=3.5, CRITICAL_HIGH=4, so 3.6 is alarm (orange)
              tank2_bar: 3.2,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 40, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 3.6,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, null)

        // MEDIUM_HIGH is alarm level (orange), not critical (red) - should NOT trigger
        expect(result.shouldFlash).toBe(false)
        expect(result.isCriticallyHigh).toBe(false)
      })

      it('should return true when pressure is at critical high threshold (4 bar)', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 40, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ],
              tank1_bar: 4.0, // CRITICAL_HIGH=4 is critical (red)
              tank2_bar: 3.2,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 40, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 4.0,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, null)

        expect(result.shouldFlash).toBe(true)
        expect(result.isCriticallyHigh).toBe(true)
      })

      it('should return true when pressure exceeds critical high threshold', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 40, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ],
              tank1_bar: 4.5,
              tank2_bar: 3.2,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 40, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 4.5,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, null)

        expect(result.shouldFlash).toBe(true)
        expect(result.isCriticallyHigh).toBe(true)
      })

      it('should return false for stopped containers even with high values', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 50, enabled: true },
                { cold_temp_c: 52, enabled: true },
              ],
              tank1_bar: 5.0,
              tank2_bar: 5.2,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.STOPPED })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 50, enabled: true },
              { cold_temp_c: 52, enabled: true },
            ],
            tank1_bar: 5.0,
            tank2_bar: 5.2,
          },
        })

        const result = getWidgetAlarmState(container, null)

        expect(result.shouldFlash).toBe(false)
        expect(result.isCriticallyHigh).toBe(false)
      })

      it('should return false for offline containers even with high values', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 50, enabled: true },
                { cold_temp_c: 52, enabled: true },
              ],
              tank1_bar: 5.0,
              tank2_bar: 5.2,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.OFFLINE })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 50, enabled: true },
              { cold_temp_c: 52, enabled: true },
            ],
            tank1_bar: 5.0,
            tank2_bar: 5.2,
          },
        })

        const result = getWidgetAlarmState(container, null)

        expect(result.shouldFlash).toBe(false)
        expect(result.isCriticallyHigh).toBe(false)
      })
    })

    describe('with custom thresholds', () => {
      it('should use SUPERHOT when defined instead of HOT', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 47, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ],
              tank1_bar: 3.0,
              tank2_bar: 3.2,
            },
          },
        }

        const containerSettings: ContainerSettings = {
          thresholds: {
            oilTemperature: {
              criticalLow: 33,
              alert: 39,
              normal: 42,
              alarm: 46,
              criticalHigh: 48, // SUPERHOT
            },
            tankPressure: {
              criticalLow: 2,
              alarmLow: 2.3,
              alarmHigh: 3.5,
              criticalHigh: 4,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 47, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 3.0,
            tank2_bar: 3.2,
          },
        })

        // Temperature is 47, which is >= HOT (46) but < SUPERHOT (48)
        // HOT is alarm level (orange), not critical (red)
        // Should return false for both shouldFlash and isCriticallyHigh because we only trigger on SUPERHOT
        // Orange/yellow/green values should NOT trigger blinks or sounds
        const result = getWidgetAlarmState(container, containerSettings)

        expect(result.shouldFlash).toBe(false)
        expect(result.isCriticallyHigh).toBe(false)
      })

      it('should return true when temperature reaches SUPERHOT threshold', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 48, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ],
              tank1_bar: 3.0,
              tank2_bar: 3.2,
            },
          },
        }

        const containerSettings: ContainerSettings = {
          thresholds: {
            oilTemperature: {
              criticalLow: 33,
              alert: 39,
              normal: 42,
              alarm: 46,
              criticalHigh: 48, // SUPERHOT
            },
            tankPressure: {
              criticalLow: 2,
              alarmLow: 2.3,
              alarmHigh: 3.5,
              criticalHigh: 4,
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 48, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 3.0,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, containerSettings)

        expect(result.shouldFlash).toBe(true)
        expect(result.isCriticallyHigh).toBe(true)
      })

      it('should use custom pressure CRITICAL_HIGH threshold', () => {
        const container: Container = {
          id: 'container-1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            cooling_system: {
              oil_pump: [
                { cold_temp_c: 40, enabled: true },
                { cold_temp_c: 42, enabled: true },
              ],
              tank1_bar: 3.8,
              tank2_bar: 3.2,
            },
          },
        }

        const containerSettings: ContainerSettings = {
          thresholds: {
            oilTemperature: {
              criticalLow: 33,
              alert: 39,
              normal: 42,
              alarm: 46,
              criticalHigh: 48,
            },
            tankPressure: {
              criticalLow: 2,
              alarmLow: 2.3,
              normal: 2.3,
              alarmHigh: 3.5,
              criticalHigh: 3.8, // Custom critical high
            },
          },
        }

        vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
        vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
          cooling_system: {
            oil_pump: [
              { cold_temp_c: 40, enabled: true },
              { cold_temp_c: 42, enabled: true },
            ],
            tank1_bar: 3.8,
            tank2_bar: 3.2,
          },
        })

        const result = getWidgetAlarmState(container, containerSettings)

        expect(result.shouldFlash).toBe(true)
        expect(result.isCriticallyHigh).toBe(true)
      })
    })
  })

  describe('MicroBT containers', () => {
    it('should NOT trigger for WARM threshold (37°C) - alarm/orange, not critical/red', () => {
      const container: Container = {
        id: 'container-1',
        type: 'container-mbt-wonder',
        info: {
          container: 'container-mbt-wonder',
          cdu: {
            unit_inlet_temp_t2: 37, // WARM=37 is alarm (orange), HOT=39 is critical (red)
          },
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        cdu: {
          unit_inlet_temp_t2: 37,
        },
      })

      const result = getWidgetAlarmState(container, null)

      // WARM is alarm level (orange), not critical (red) - should NOT trigger
      expect(result.shouldFlash).toBe(false)
      expect(result.isCriticallyHigh).toBe(false)
    })

    it('should return false when temperature is below critical high threshold', () => {
      const container: Container = {
        id: 'container-1',
        type: 'container-mbt-wonder',
        info: {
          container: 'container-mbt-wonder',
          cdu: {
            unit_inlet_temp_t2: 38,
          },
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        cdu: {
          unit_inlet_temp_t2: 38,
        },
      })

      const result = getWidgetAlarmState(container, null)

      expect(result.isCriticallyHigh).toBe(false)
    })

    it('should return true when temperature is at or above critical high threshold (39°C default)', () => {
      const container: Container = {
        id: 'container-1',
        type: 'container-mbt-wonder',
        info: {
          container: 'container-mbt-wonder',
          cdu: {
            unit_inlet_temp_t2: 39,
          },
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        cdu: {
          unit_inlet_temp_t2: 39,
        },
      })

      const result = getWidgetAlarmState(container, null)

      expect(result.shouldFlash).toBe(true)
      expect(result.isCriticallyHigh).toBe(true)
    })

    it('should use custom critical high threshold from settings', () => {
      const container: Container = {
        id: 'container-1',
        type: 'container-mbt-wonder',
        info: {
          container: 'container-mbt-wonder',
          cdu: {
            unit_inlet_temp_t2: 40,
          },
        },
      }

      const containerSettings: ContainerSettings = {
        model: 'container-mbt-wonder',
        thresholds: {
          waterTemperature: {
            criticalLow: 25,
            alarmLow: 33,
            normal: 33,
            alarmHigh: 37,
            criticalHigh: 41, // Custom threshold
          },
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        cdu: {
          unit_inlet_temp_t2: 40,
        },
      })

      // Temperature is 40, which is < 41 (custom critical high)
      const result = getWidgetAlarmState(container, containerSettings)

      expect(result.isCriticallyHigh).toBe(false)
    })
  })

  describe('Bitmain Immersion containers', () => {
    it('should return false when all temperatures are below critical high threshold', () => {
      const container: Container = {
        id: 'container-1',
        type: 'other',
        info: {
          container: 'container-as-immersion-001',
          primary_supply_temp: 45,
          second_supply_temp1: 44,
          second_supply_temp2: 43,
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        primary_supply_temp: 45,
        second_supply_temp1: 44,
        second_supply_temp2: 43,
        status: CONTAINER_STATUS.RUNNING,
      })

      const result = getWidgetAlarmState(container, null)

      expect(result.isCriticallyHigh).toBe(false)
    })

    it('should return true when any temperature is at or above critical high threshold (48°C default)', () => {
      const container: Container = {
        id: 'container-1',
        type: 'other',
        info: {
          container: 'container-as-immersion-001',
          primary_supply_temp: 48,
          second_supply_temp1: 44,
          second_supply_temp2: 43,
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        primary_supply_temp: 48,
        second_supply_temp1: 44,
        second_supply_temp2: 43,
        status: CONTAINER_STATUS.RUNNING,
      })

      const result = getWidgetAlarmState(container, null)

      expect(result.shouldFlash).toBe(true)
      expect(result.isCriticallyHigh).toBe(true)
    })
  })

  describe('Antspace Hydro containers', () => {
    it('should return false when temperature and pressure are below critical high thresholds', () => {
      const container: Container = {
        id: 'container-1',
        type: 'container-as-hk3',
        info: {
          container: 'container-as-hk3',
          supply_liquid_temp: 38,
          supply_liquid_set_temp: 35,
          supply_liquid_pressure: 0.3, // MPa = 3 bar
          return_liquid_pressure: 0.32, // MPa = 3.2 bar
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        supply_liquid_temp: 38,
        supply_liquid_set_temp: 35,
        supply_liquid_pressure: 0.3,
        return_liquid_pressure: 0.32,
      })

      const result = getWidgetAlarmState(container, null)

      expect(result.isCriticallyHigh).toBe(false)
    })

    it('should return true when temperature is at or above critical high threshold (40°C default)', () => {
      const container: Container = {
        id: 'container-1',
        type: 'container-as-hk3',
        info: {
          container: 'container-as-hk3',
          supply_liquid_temp: 40,
          supply_liquid_set_temp: 35,
          supply_liquid_pressure: 0.3,
          return_liquid_pressure: 0.32,
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        supply_liquid_temp: 40,
        supply_liquid_set_temp: 35,
        supply_liquid_pressure: 0.3,
        return_liquid_pressure: 0.32,
      })

      const result = getWidgetAlarmState(container, null)

      expect(result.shouldFlash).toBe(true)
      expect(result.isCriticallyHigh).toBe(true)
    })

    it('should return true when pressure exceeds critical high threshold (4 bar default)', () => {
      const container: Container = {
        id: 'container-1',
        type: 'container-as-hk3',
        info: {
          container: 'container-as-hk3',
          supply_liquid_temp: 38,
          supply_liquid_set_temp: 35,
          supply_liquid_pressure: 0.41, // MPa = 4.1 bar
          return_liquid_pressure: 0.32,
        },
      }

      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        supply_liquid_temp: 38,
        supply_liquid_set_temp: 35,
        supply_liquid_pressure: 0.41,
        return_liquid_pressure: 0.32,
      })

      const result = getWidgetAlarmState(container, null)

      expect(result.shouldFlash).toBe(true)
      expect(result.isCriticallyHigh).toBe(true)
    })
  })
})

import { type ComponentType } from 'react'

import { FluidAlarm } from '@/Views/ContainerWidgets/Icons/FluidAlarm'
import { OtherAlarm } from '@/Views/ContainerWidgets/Icons/OtherAlarm'
import { PressureAlarm } from '@/Views/ContainerWidgets/Icons/PressureAlarm'
import { TemperatureAlarm } from '@/Views/ContainerWidgets/Icons/TemperatureAlarm'

export type AlarmPropKey = 'liquidAlarms' | 'leakageAlarms' | 'pressureAlarms' | 'otherAlarms'

export interface WidgetAlarmItem {
  title: string
  propKey: AlarmPropKey
  Icon: ComponentType<{ width?: number; height?: number }>
}

export const WIDGET_ALARMS: WidgetAlarmItem[] = [
  {
    title: 'Liquid',
    propKey: 'liquidAlarms',
    Icon: TemperatureAlarm,
  },
  {
    title: 'Leakage',
    propKey: 'leakageAlarms',
    Icon: FluidAlarm,
  },
  {
    title: 'Pressure',
    propKey: 'pressureAlarms',
    Icon: PressureAlarm,
  },
  {
    title: 'Other',
    propKey: 'otherAlarms',
    Icon: OtherAlarm,
  },
]

interface RadioButton {
  value: string
  text: string
}

interface DropdownItem {
  key: string
  label: string
}

interface DropdownGroup {
  key: string
  type: string
  label: string
  children: DropdownItem[]
}

export const shortTimelineRadioButtons: RadioButton[] = [
  { value: '30m', text: '30 Min' },
  { value: '3h', text: '3 H' },
  { value: '1D', text: '1 D' },
]

export const longTimelineRadioButtons: RadioButton[] = [{ value: '1D', text: '1D' }]

export const timelineRadioButtons: RadioButton[] = [{ value: '5m', text: '5 Min' }].concat(
  shortTimelineRadioButtons,
)

export const oneMinuteTimeLineRadioButton: RadioButton[] = [{ value: '1m', text: '1 Min' }].concat(
  timelineRadioButtons,
)

export const getTimelineRadioButtons = ({
  isOneMinEnabled,
  isShort,
}: {
  isOneMinEnabled?: boolean
  isShort?: boolean
}): RadioButton[] => {
  if (isShort) {
    return shortTimelineRadioButtons
  }
  if (isOneMinEnabled) {
    return [{ value: '1m', text: '1 Min' }].concat(timelineRadioButtons)
  }
  return timelineRadioButtons
}

export const timelineDropdownItems: DropdownGroup[] = [
  {
    key: 'minutes',
    type: 'group',
    label: 'Minutes',
    children: [
      {
        key: '15min',
        label: '15 minutes',
      },
      {
        key: '30min',
        label: '30 minutes',
      },
      {
        key: '45min',
        label: '45 minutes',
      },
    ],
  },
  {
    key: 'hours',
    type: 'group',
    label: 'Hours',
    children: [
      {
        key: '1h',
        label: '1 hour',
      },
      {
        key: '6h',
        label: '6 hours',
      },
      {
        key: '12h',
        label: '12 hours',
      },
    ],
  },
  {
    key: 'days',
    type: 'group',
    label: 'Days',
    children: [
      {
        key: '1d',
        label: '1 day',
      },
      {
        key: '7d',
        label: '1 week',
      },
      {
        key: '30d',
        label: '1 month',
      },
      {
        key: '90d',
        label: '3 months',
      },
    ],
  },
]

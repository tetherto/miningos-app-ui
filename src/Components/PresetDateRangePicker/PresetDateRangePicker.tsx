import Button from 'antd/es/button'
import { differenceInDays } from 'date-fns/differenceInDays'
import { endOfDay } from 'date-fns/endOfDay'
import { format } from 'date-fns/format'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _size from 'lodash/size'
import type { ReactNode } from 'react'
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react'

import { FULFILLED_DRAFT_SIZE, SUMMARY_DATE_FORMAT } from './PresetDateRangePicker.const'
import {
  PresetDateRangePickerRoot,
  PresetDateRangePickerPanel,
  PresetDateRangePickerModal,
  PresetDateRangePickerSummary,
  PresetDateRangePickerSummaryTitle,
  PresetDateRangePickerSummarySelection,
  PresetDateRangePickerSummarySelectionPart,
  PresetDateRangePickerMeta,
  PresetDateRangePickerPresets,
} from './PresetDateRangePicker.styles'
import {
  getRangePresets,
  isPresetActive,
  toggleRootInteractivityMode,
  valueToDatesPair,
  type PresetItem as UtilsPresetItem,
} from './PresetDateRangePicker.utils'

import { withErrorBoundary } from '@/Components/ErrorBoundary'
import { DATE_FORMAT_SLASHED } from '@/constants/dates'

type DateRange = [Date, Date] | null
type DateRangeValue = Date[] | null

interface PresetItem {
  label: string
  value: DateRange
}

interface PresetDateRangePickerProps {
  onRangeChange?: (range: DateRange) => void
  defaultValue?: DateRangeValue
  currentValue?: DateRangeValue
  enableFutureDates?: boolean
  disabled?: boolean
  getDisabledDates?: (current: Date) => boolean
  showTime?: boolean
  presetsDisabled?: boolean
  isEmptyValueTriggerable?: boolean
  dateFormat?: string
  isActive?: boolean
}

const PresetDateRangePicker = withErrorBoundary(
  ({
    onRangeChange,
    defaultValue: defaultValueInit,
    currentValue: currentValueInit,
    enableFutureDates,
    disabled,
    getDisabledDates,
    showTime,
    presetsDisabled,
    isEmptyValueTriggerable = false,
    dateFormat = DATE_FORMAT_SLASHED,
    isActive = false,
  }: PresetDateRangePickerProps) => {
    // Memoize to prevent new array references on every render
    // DO NOT REMOVE THIS MEMOIZATION
    const currentValue = useMemo(
      () => valueToDatesPair(currentValueInit ?? null),
      [
        currentValueInit?.[0]?.getTime?.() ?? currentValueInit?.[0],
        currentValueInit?.[1]?.getTime?.() ?? currentValueInit?.[1],
      ],
    )
    // DO NOT REMOVE THIS MEMOIZATION
    const defaultValue = useMemo(
      () => valueToDatesPair(defaultValueInit ?? null),
      [
        defaultValueInit?.[0]?.getTime?.() ?? defaultValueInit?.[0],
        defaultValueInit?.[1]?.getTime?.() ?? defaultValueInit?.[1],
      ],
    )

    const [pickerValue, setPickerValue] = useState<DateRange>(currentValue || defaultValue || null)

    const [isOpen, setIsOpen] = useState(false)

    // Sync pickerValue when currentValue changes externally (e.g., reset button)
    // Use timestamps for comparison to avoid infinite loops from new Date object references
    const currentStartTime = currentValue?.[0]?.getTime()
    const currentEndTime = currentValue?.[1]?.getTime()
    useEffect(() => {
      if (currentValue) {
        setPickerValue(currentValue)
      }
    }, [currentStartTime, currentEndTime])

    const [draft, setDraft] = useState<DateRange>(null)

    const prev = useRef<DateRange | null>(null)

    const showPanel = () => {
      prev.current = currentValue || defaultValue

      toggleRootInteractivityMode()

      setIsOpen(true)
    }

    const hidePanel = () => {
      setIsOpen(false)

      toggleRootInteractivityMode()

      setDraft(null)
    }

    const handlePanelSubmit = (event: MouseEvent<HTMLElement>, range: DateRange = draft) => {
      hidePanel()

      setPickerValue(range)

      if (isEmptyValueTriggerable || !_isEmpty(range)) {
        onRangeChange?.(range)
      }
    }

    const handlePanelCancel = () => {
      handlePanelSubmit(null as unknown as MouseEvent<HTMLElement>, prev.current ?? null)

      prev.current = null
    }

    // 'isOpen' dependency was needed to keep presets' values relevant per picker opening
    const dateRangePresets: PresetItem[] | undefined = presetsDisabled
      ? undefined
      : getRangePresets()

    const isDraftFulfilled = draft && _size(draft) === FULFILLED_DRAFT_SIZE

    const isPickerValueSet = pickerValue && _size(pickerValue) === FULFILLED_DRAFT_SIZE

    const [startDate, endDate] = isDraftFulfilled ? draft : pickerValue || [null, null]

    return (
      <PresetDateRangePickerRoot
        $isActive={isActive}
        disabled={disabled}
        format={dateFormat}
        separator="-"
        onChange={(dates: unknown) => setDraft(dates as [Date, Date] | null)}
        allowClear={false}
        suffixIcon={pickerValue ? null : undefined}
        superPrevIcon={null}
        superNextIcon={null}
        inputReadOnly
        value={isDraftFulfilled ? draft : pickerValue}
        showTime={showTime}
        disabledDate={
          getDisabledDates ||
          ((current: Date) => !enableFutureDates && current && current > endOfDay(new Date()))
        }
        panelRender={(panelNode: ReactNode) => (
          <PresetDateRangePickerModal
            open
            title="Select Date Range"
            getContainer={() =>
              document.querySelector('.ant-picker-date-panel-container') || document.body
            }
            maskClosable={false}
            cancelText="Clear Selection"
            onCancel={handlePanelCancel}
            okText="Apply Range"
            okButtonProps={{
              className: 'marginless-action',
              disabled: !isDraftFulfilled,
            }}
            onOk={handlePanelSubmit}
          >
            <PresetDateRangePickerPanel>
              {panelNode}
              {(isDraftFulfilled || isPickerValueSet) && (
                <PresetDateRangePickerMeta>
                  <PresetDateRangePickerSummary>
                    <PresetDateRangePickerSummaryTitle>
                      Selected Range
                    </PresetDateRangePickerSummaryTitle>
                    <PresetDateRangePickerSummarySelection>
                      <PresetDateRangePickerSummarySelectionPart>
                        {format(startDate!, SUMMARY_DATE_FORMAT)}
                      </PresetDateRangePickerSummarySelectionPart>
                      to
                      <PresetDateRangePickerSummarySelectionPart>
                        {format(endDate!, SUMMARY_DATE_FORMAT)}
                      </PresetDateRangePickerSummarySelectionPart>
                    </PresetDateRangePickerSummarySelection>
                    <span>{differenceInDays(endDate!, startDate!)} days selected</span>
                  </PresetDateRangePickerSummary>
                  {!_isEmpty(dateRangePresets) && (
                    <PresetDateRangePickerPresets>
                      {_map(dateRangePresets, (item: UtilsPresetItem) => (
                        <Button
                          type={
                            startDate &&
                            endDate &&
                            isPresetActive(item, [startDate, endDate] as Date[] | null)
                              ? 'primary'
                              : 'default'
                          }
                          size="small"
                          key={item.label}
                          onClick={() => setDraft(item.value as DateRange)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </PresetDateRangePickerPresets>
                  )}
                </PresetDateRangePickerMeta>
              )}
            </PresetDateRangePickerPanel>
          </PresetDateRangePickerModal>
        )}
        open={isOpen}
        onClick={showPanel}
      />
    )
  },
  undefined,
  () => toggleRootInteractivityMode(true),
)

export default PresetDateRangePicker

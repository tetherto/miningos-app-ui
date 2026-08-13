import Table from 'antd/es/table'
import _includes from 'lodash/includes'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _replace from 'lodash/replace'
import _startCase from 'lodash/startCase'
import _trim from 'lodash/trim'
import { FC, ReactNode, ChangeEvent, FocusEvent, WheelEvent } from 'react'

import {
  SectionTitle,
  InputLabel,
  ColorBlock,
  ActionButtonsContainer,
  SaveButton,
  CancelButton,
  ResetButton,
  TableContainer,
  StyledAntdInput,
  FlexRow,
  FlexCol,
} from './EditableThresholdForm.styles'
import { getCommonColorMapping, getCommonTableColumns } from './helper'
import { FlashStatusIndicator, SoundStatusIndicator } from './StatusIndicatorComponents'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { UNITS } from '@/constants/units'
import { useContainerThresholds } from '@/hooks/useContainerThresholds'

interface ThresholdConfig {
  type: string
  title?: string
  unit?: string
  [key: string]: unknown
}

interface ParameterSetting {
  name: string
  value?: number | string
  suffix?: string
  type?: string
}

export interface BaseThresholdFormProps {
  data?: UnknownRecord
  thresholdConfigs?: ThresholdConfig[]
  onSave?: (thresholds: Record<string, Record<string, number>>) => void | Promise<void>
  getContainerParametersSettings?: (
    data: UnknownRecord,
  ) => Record<string, ParameterSetting> | undefined
  children?: ReactNode
}

const BaseThresholdForm: FC<BaseThresholdFormProps> = ({
  data = {},
  thresholdConfigs = [],
  onSave,
  children,
}) => {
  const wrappedOnSave = onSave
    ? async (params: { data: UnknownRecord }) => {
        await onSave(params.data.thresholds as Record<string, Record<string, number>>)
      }
    : undefined

  const {
    thresholds,
    isEditing,
    isSaving,
    isSiteLoading,
    isSettingsLoading,
    handleThresholdChange: _handleThresholdChange,
    handleThresholdBlur: _handleThresholdBlur,
    handleSave,
    handleReset,
  } = useContainerThresholds(data, wrappedOnSave)

  const handleThresholdChange = _handleThresholdChange
  const handleThresholdBlur = _handleThresholdBlur

  const handleCancel = () => {
    handleReset()
  }

  /**
   * Prevents scroll wheel from changing numeric input values
   * by blurring the input when wheel event occurs
   */
  const handleWheel = (e: WheelEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement
    input.blur()
  }

  // Generate table data for threshold visualization
  const generateTableData = ({
    thresholdType,
    config,
  }: {
    thresholdType: string
    config?: ThresholdConfig
  }) => {
    const thresholdValues =
      (thresholds[thresholdType as keyof typeof thresholds] as
        | Record<string, number>
        | undefined) || {}
    const thresholdKeys = _keys(thresholdValues)
    const data: Array<{
      key: number
      state: string
      range: string
      color: ReactNode
      flash: ReactNode
      sound: ReactNode
    }> = []

    for (let i = 0; i < thresholdKeys.length; i++) {
      const key = thresholdKeys[i]
      const currentValue = thresholdValues[key]
      const nextValue = thresholdValues[thresholdKeys[i + 1]]

      let range = ''
      // Get unit from config or determine based on threshold type
      let unit =
        config?.unit ||
        (_includes(thresholdType, 'Temperature') ? UNITS.TEMPERATURE_C : UNITS.PRESSURE_BAR)

      if (i === 0) {
        range = `< ${currentValue}${unit}`
      } else if (i === thresholdKeys.length - 1) {
        range = `> ${currentValue}${unit}`
      } else {
        range = `${currentValue} - ${nextValue}${unit}`
      }

      const fixedColors = [
        COLOR.RED, // Critical Low - Red
        COLOR.GOLD, // Alert - Gold/Yellow (changed for better distinction)
        COLOR.GREEN, // Normal - Green
        COLOR.ORANGE, // Alarm - Orange
        COLOR.RED, // Critical High - Red
      ]

      const color = fixedColors[i] || COLOR.WHITE
      // Override flash behavior to match desired table display
      // Based on threshold state, not actual temperature values:
      // - Critical Low (i === 0): flash ✓
      // - Alert (i === 1): no flash ✗
      // - Normal (i === 2): no flash ✗
      // - Alarm (i === 3): flash ✓
      // - Critical High (i === 4): flash ✓ and sound ✓
      const isFlashing = i === 0 || i === 3 || i === thresholdKeys.length - 1
      const isSuperflashing = i === thresholdKeys.length - 1 // Only Critical High has sound

      const colorMapping = getCommonColorMapping()

      // Get color info from mapping or use default
      const colorInfo = (colorMapping[color as keyof typeof colorMapping] || {
        text: 'Gray',
        background: COLOR.LIGHT_GREY || COLOR.DARK,
        textColor: COLOR.WHITE,
      }) as { text: string; background: string; textColor: string }

      data.push({
        key: i,
        state: _trim(_replace(key as string, /([A-Z])/g, ' $1')),
        range,
        color: (
          <ColorBlock $backgroundColor={colorInfo.background} $textColor={colorInfo.textColor}>
            {colorInfo.text}
          </ColorBlock>
        ),
        flash: <FlashStatusIndicator isFlashing={isFlashing} color={color} />,
        sound: <SoundStatusIndicator isSuperflashing={isSuperflashing} color={color} />,
      })
    }

    return data
  }

  const getThresholdInputs = (thresholdType: string, config?: ThresholdConfig) => {
    const thresholdValues =
      (thresholds[thresholdType as keyof typeof thresholds] as
        | Record<string, number>
        | undefined) || {}
    const thresholdKeys = _keys(thresholdValues)
    // Get unit from config or determine based on threshold type
    const unit =
      config?.unit ||
      (_includes(thresholdType, 'Temperature') ? UNITS.TEMPERATURE_C : UNITS.PRESSURE_BAR)

    return _map(thresholdKeys, (key: unknown, index: number) => {
      const keyStr = key as string
      const label = _startCase(keyStr)
      const isFirst = index === 0
      const isLast = index === thresholdKeys.length - 1

      let placeholder = ''
      if (isFirst) {
        placeholder = `< ${thresholdValues[keyStr]}`
      } else if (isLast) {
        placeholder = `> ${thresholdValues[keyStr]}`
      } else {
        const nextKey = thresholdKeys[index + 1] as string
        placeholder = `${thresholdValues[keyStr]} - ${thresholdValues[nextKey]}`
      }

      return (
        <FlexCol key={keyStr}>
          <InputLabel>{label} starts at:</InputLabel>
          <StyledAntdInput
            type="number"
            step="0.1"
            value={thresholdValues[keyStr]}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleThresholdChange(thresholdType, keyStr, e.target.value)
            }
            onBlur={(e: FocusEvent<HTMLInputElement>) =>
              handleThresholdBlur(thresholdType, keyStr, e.target.value)
            }
            onWheel={handleWheel}
            suffix={unit}
            placeholder={placeholder}
          />
        </FlexCol>
      )
    })
  }

  return (
    <>
      {children}

      {/* Show loading state while fetching settings */}
      {isSettingsLoading && <Spinner />}

      {/* Render threshold sections based on config */}
      {!isSettingsLoading &&
        _map(thresholdConfigs, (config: ThresholdConfig) => (
          <div key={config.type}>
            <SectionTitle>{config.title as string}</SectionTitle>

            {/* Input Fields */}
            <FlexRow>{getThresholdInputs(config.type, config)}</FlexRow>

            {/* Table */}
            <TableContainer>
              <Table
                dataSource={generateTableData({
                  thresholdType: config.type,
                  config,
                })}
                columns={getCommonTableColumns()}
                pagination={false}
                size="small"
                bordered
                style={{
                  backgroundColor: COLOR.DARK,
                }}
              />
            </TableContainer>
          </div>
        ))}

      {/* Action Buttons */}
      {isEditing && (
        <ActionButtonsContainer>
          <CancelButton onClick={handleCancel}>Cancel</CancelButton>
          <ResetButton onClick={handleReset}>Reset Values to Default</ResetButton>
          <SaveButton
            onClick={handleSave}
            disabled={isSaving || isSiteLoading || isSettingsLoading}
          >
            Save Settings
          </SaveButton>
        </ActionButtonsContainer>
      )}
    </>
  )
}

export default BaseThresholdForm

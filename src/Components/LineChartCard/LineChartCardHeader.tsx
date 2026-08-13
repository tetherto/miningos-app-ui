import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _isUndefined from 'lodash/isUndefined'
import _noop from 'lodash/noop'
import _size from 'lodash/size'

import CurrentValueLabel from './CurrentValueLabel'
import DetailLegendLabels from './DetailLegendLabels'
import LegendLabels from './LegendLabels'
import { HeaderLeftContainer, LegendsFlexCol, Row } from './LineChartCard.styles'
import LineChartCardToggle from './LineChartCardToggle'

interface RadioButton {
  value: string
  disabled?: boolean
  label?: string
}

interface Dataset {
  label?: string
  [key: string]: unknown
}

interface CurrentValueLabelData {
  value?: number
  unit?: string
  decimals?: number
}

interface ChartData {
  isDetailLegends?: boolean
  currentValueLabel?: CurrentValueLabelData
  datasets?: Dataset[]
  [key: string]: unknown
}

interface LineChartCardHeaderProps {
  data?: ChartData
  radioButtons?: RadioButton[]
  timeline?: string
  legendHidden?: Record<string, boolean>
  title?: string | null
  onChangeTimeline?: (timeline: string) => void
  onClickLegend?: (label: string) => void
}

const LineChartCardHeader = ({
  data,
  radioButtons = [],
  timeline = '',
  legendHidden = {},
  title = null,
  onChangeTimeline = _noop,
  onClickLegend = _noop,
}: LineChartCardHeaderProps) => {
  const { isDetailLegends, currentValueLabel, datasets } = data || {}
  const datasetLabel = _head(datasets)?.label
  const isMultipleLineChart = _size(datasets) > 1

  // @TODO - this should be refactored to get it dynamically
  const totalMinerConsumption = datasetLabel === 'Total Miner Consumption'
  const totalConsumption = datasetLabel === 'Total Consumption'

  const Legend = isDetailLegends ? DetailLegendLabels : LegendLabels
  const currentValueDecimalsMap =
    currentValueLabel?.value === 0 || _isUndefined(currentValueLabel?.value)
      ? 0
      : currentValueLabel?.decimals
  const valueDecimals = totalConsumption ? 2 : currentValueDecimalsMap
  const decimals = totalMinerConsumption ? 3 : valueDecimals

  return (
    <Row style={{ flex: 1 }}>
      <HeaderLeftContainer>
        <LineChartCardToggle
          title={title || undefined}
          timeline={timeline}
          radioButtons={radioButtons}
          onChangeTimeline={onChangeTimeline}
        />
        <LegendsFlexCol $expand>
          <Legend
            data={
              data as {
                datasets?: Array<{ label: string; borderColor?: string; [key: string]: unknown }>
                [key: string]: unknown
              }
            }
            hidden={legendHidden}
            onClick={onClickLegend}
          />
          {currentValueLabel &&
            !isDetailLegends &&
            !_isNil(currentValueLabel?.value) &&
            !isMultipleLineChart && (
              <CurrentValueLabel
                value={currentValueLabel?.value}
                unit={currentValueLabel?.unit}
                decimals={decimals}
              />
            )}
        </LegendsFlexCol>
      </HeaderLeftContainer>
    </Row>
  )
}

export default LineChartCardHeader

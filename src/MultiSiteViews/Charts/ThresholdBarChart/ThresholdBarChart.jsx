import Empty from 'antd/es/empty'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Bar } from 'react-chartjs-2'

import { LEGEND_PLACEMENT } from '../constants'
import CustomLegend from '../Legend/Legend'

import { buildBarOptions, getBarChartData } from './helper'

import { hasNonZeroSeriesValues, SafeChartDataLabels } from '@/app/utils/chartUtils'
import { CHART_EMPTY_DESCRIPTION } from '@/constants/charts'
import {
  ChartHeader,
  ChartTitle,
  ChartWrapper,
  InnerChartWrapper,
  NoDataWrapper,
  Unit,
} from '@/MultiSiteViews/Common.style'
import {
  BAR_PERCENTAGE,
  BAR_WIDTH,
  CATEGORY_PERCENTAGE,
} from '@/MultiSiteViews/Report/components/SiteDetails/SiteDetails.const'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  SafeChartDataLabels,
)

const ThresholdBarChart = ({
  chartTitle,
  data,
  unit,
  timeframeType = null,
  isHorizontal = false,
  isStacked = false,
  yTicksFormatter = (v) => v,
  yRightTicksFormatter = null,
  isLegendVisible = true,
  displayColors = true,
  legendPosition = 'top',
  legendAlign = 'end',
  legendPlacement = LEGEND_PLACEMENT.HEADER,
  barWidth = BAR_WIDTH,
  barPercentage = BAR_PERCENTAGE,
  categoryPercentage = CATEGORY_PERCENTAGE,
  showDataLabels = false,
  noBackgroundColor = false,
}) => {
  const [hiddenDatasets, setHiddenDatasets] = useState([])

  // Check if there's no data - either empty series, explicitly passed empty dataset, or all zeros
  const hasNoData =
    !data ||
    data?.dataset?.length === 0 ||
    !data?.series?.length ||
    !hasNonZeroSeriesValues(data.series)

  const defaultLineAxis = yRightTicksFormatter ? 'y1' : 'y'

  const toggleDataset = (datasetIndex) => {
    setHiddenDatasets((prev) => {
      if (_includes(prev, datasetIndex)) {
        return _filter(prev, (i) => i !== datasetIndex)
      }
      return [...prev, datasetIndex]
    })
  }

  const chartData = getBarChartData({
    ...data,
    barWidth,
    defaultLineAxis,
    categoryPercentage,
    barPercentage,
  })

  // Apply hidden datasets to chart data
  // Always explicitly set hidden property to ensure Chart.js updates correctly
  const visibleChartData = {
    ...chartData,
    datasets: _map(chartData.datasets, (dataset, index) => ({
      ...dataset,
      hidden: _includes(hiddenDatasets, index),
    })),
  }

  const options = buildBarOptions({
    isHorizontal,
    isStacked,
    yTicksFormatter,
    yRightTicksFormatter,
    isLegendVisible: false, // Disable Chart.js legend
    displayColors,
    legendPosition,
    legendAlign,
    showDataLabels,
    timeframeType,
  })

  const showLegendInHeader = isLegendVisible && legendPlacement === LEGEND_PLACEMENT.HEADER
  const showLegendAtBottom = isLegendVisible && legendPlacement === LEGEND_PLACEMENT.BOTTOM

  return (
    <ChartWrapper $noBackgroundColor={noBackgroundColor}>
      {chartTitle && showLegendInHeader ? (
        <ChartHeader>
          <ChartTitle>{chartTitle}</ChartTitle>
          {!hasNoData && (
            <CustomLegend
              datasets={chartData.datasets}
              hiddenDatasets={hiddenDatasets}
              onToggleDataset={toggleDataset}
              usePointStyle={false}
            />
          )}
        </ChartHeader>
      ) : (
        chartTitle && <ChartTitle>{chartTitle}</ChartTitle>
      )}
      {unit && !hasNoData && <Unit>{unit}</Unit>}
      {hasNoData ? (
        <NoDataWrapper>
          <Empty description={CHART_EMPTY_DESCRIPTION} />
        </NoDataWrapper>
      ) : (
        <InnerChartWrapper>
          <Bar data={visibleChartData} options={options} />
        </InnerChartWrapper>
      )}
      {showLegendAtBottom && !hasNoData && (
        <CustomLegend
          datasets={chartData.datasets}
          hiddenDatasets={hiddenDatasets}
          onToggleDataset={toggleDataset}
          usePointStyle={false}
          forceRow
        />
      )}
    </ChartWrapper>
  )
}

const valuesShape = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.number),
  PropTypes.objectOf(PropTypes.number),
])

ThresholdBarChart.propTypes = {
  chartTitle: PropTypes.string,
  data: PropTypes.shape({
    dataset: PropTypes.arrayOf(PropTypes.object),
    labels: PropTypes.arrayOf(PropTypes.string),
    series: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        values: valuesShape.isRequired,
        color: PropTypes.string,
        stack: PropTypes.string,
        gradient: PropTypes.shape({ top: PropTypes.number, bottom: PropTypes.number }),
        datalabels: PropTypes.object, // per-dataset override (optional)
      }),
    ).isRequired,
    lines: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        values: valuesShape.isRequired,
        color: PropTypes.string,
        yAxisID: PropTypes.string,
      }),
    ),
    constants: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        color: PropTypes.string,
        borderDash: PropTypes.arrayOf(PropTypes.number),
        yAxisID: PropTypes.string,
      }),
    ),
  }).isRequired,
  isHorizontal: PropTypes.bool,
  isStacked: PropTypes.bool,
  yTicksFormatter: PropTypes.func,
  yRightTicksFormatter: PropTypes.func,
  isLegendVisible: PropTypes.bool,
  displayColors: PropTypes.bool,
  legendPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  legendAlign: PropTypes.oneOf(['start', 'center', 'end']),
  legendPlacement: PropTypes.oneOf([LEGEND_PLACEMENT.HEADER, LEGEND_PLACEMENT.BOTTOM]),
  barWidth: PropTypes.number,
  categoryPercentage: PropTypes.number,
  barPercentage: PropTypes.number,
  showDataLabels: PropTypes.bool,
  unit: PropTypes.string,
  timeframeType: PropTypes.string,
  noBackgroundColor: PropTypes.bool,
}

export default ThresholdBarChart

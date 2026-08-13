import 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'

import { getChartOptions, getLineDatasetFromHashrate } from './helper'

import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { COLOR } from '@/constants/colors'
import { UNITS } from '@/constants/units'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

export const NetworkHashrate = ({
  data = [],
  timeframeType,
  isLoading = false,
  chartFullHeight = false,
  title = 'Network Hashrate',
  lineColor = COLOR.COLD_ORANGE,
  unit = UNITS.HASHRATE_EH_S,
}) => {
  const { labels, dataset } = getLineDatasetFromHashrate({
    data,
    label: title,
    color: lineColor,
  })

  const chartData = { labels, datasets: [dataset] }
  const chartOptions = getChartOptions({ yAxisLabel: unit, timeframeType })

  return (
    <ChartWrapper $heightFull={chartFullHeight}>
      <ChartTitle>{title}</ChartTitle>
      {unit && <Unit>{unit}</Unit>}
      <InnerChartWrapper>
        <ChartContainer data={chartData} isLoading={isLoading} minHeight={300}>
          <Line data={chartData} options={chartOptions} />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

NetworkHashrate.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  timeframeType: PropTypes.string.isRequired,
  chartFullHeight: PropTypes.bool,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  lineColor: PropTypes.string,
  unit: PropTypes.string,
  customFormatTemplate: PropTypes.string,
}

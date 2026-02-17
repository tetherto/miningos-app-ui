import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'

import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { UNITS } from '@/constants/units'
import { chartOptions, getChartData } from '@/MultiSiteViews/Charts/PowerChart/helper'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

export const PowerChart = ({
  data,
  isLoading = false,
  isDateShort = false,
  chartFullHeight = false,
}) => {
  const chartData = getChartData(data, isDateShort)

  return (
    <ChartWrapper $heightFull={chartFullHeight}>
      <ChartTitle>Power</ChartTitle>
      <Unit>{UNITS.ENERGY_MW}</Unit>
      <InnerChartWrapper>
        <ChartContainer data={chartData} isLoading={isLoading}>
          <Line data={chartData} options={chartOptions} />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

PowerChart.propTypes = {
  data: PropTypes.shape({
    consumption: PropTypes.arrayOf(
      PropTypes.shape({
        ts: PropTypes.string.isRequired,
        consumption: PropTypes.number.isRequired,
      }),
    ).isRequired,
    availablePower: PropTypes.number.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool,
  chartFullHeight: PropTypes.bool,
  isDateShort: PropTypes.bool,
}

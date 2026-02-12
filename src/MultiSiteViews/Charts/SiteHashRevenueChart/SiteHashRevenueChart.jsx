import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _some from 'lodash/some'
import PropTypes from 'prop-types'

import { getDataset } from './helper'

import { formatBTC, formatValueUnit } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { LABEL_TO_IGNORE } from '@/constants/charts'
import { UNITS } from '@/constants/units'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import {
  ChartHeader,
  ChartTitle,
  ChartWrapper,
  InnerChartWrapper,
  Unit,
} from '@/MultiSiteViews/Common.style'
import { CURRENCY } from '@/MultiSiteViews/constants'
import { CurrencyToggler } from '@/MultiSiteViews/SharedComponents/CurrencyToggler/CurrencyToggler'

export const SiteHashRevenueChart = ({
  data = [],
  isLoading = false,
  currency = CURRENCY.USD,
  setCurrency,
  customFormatTemplate = '',
  isDateShort = false,
}) => {
  const dataset = getDataset(data, currency, isDateShort, customFormatTemplate)
  const hasDataValues =
    dataset?.[0] &&
    _some(_keys(dataset[0]), (key) => {
      if (LABEL_TO_IGNORE.includes(key)) return false
      const entry = dataset[0][key]

      return !_isNil(entry?.value) && entry?.value !== 0
    })

  return (
    <ChartWrapper>
      <ChartHeader>
        <ChartTitle>Site Hash Revenue</ChartTitle>
        <CurrencyToggler value={currency} onChange={setCurrency} />
      </ChartHeader>
      <Unit>{`${currency}/${UNITS.HASHRATE_PH_S}/day`}</Unit>
      <InnerChartWrapper>
        <ChartContainer
          isLoading={isLoading}
          data={{ dataset: !hasDataValues ? undefined : dataset }}
          minHeight={CHART_HEIGHT}
        >
          <BarChart
            data={{ dataset: !hasDataValues ? undefined : dataset }}
            barWidth={BAR_WIDTH.THIN}
            chartHeight={CHART_HEIGHT}
            isLegendVisible
            yTicksFormatter={(val) =>
              currency === CURRENCY.BTC
                ? formatBTC(val, { maximumFractionDigits: 8 }).value
                : formatValueUnit(val)
            }
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

SiteHashRevenueChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
  setCurrency: PropTypes.func,
  currency: PropTypes.oneOf([CURRENCY.BTC, CURRENCY.USD]),
  isDateShort: PropTypes.bool,
  customFormatTemplate: PropTypes.string,
}

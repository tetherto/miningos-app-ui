import _map from 'lodash/map'
import _values from 'lodash/values'

import { Disclaimer, HashCostMetricsWrapper } from '../HashBalance.styles'
import { useHashCostChartData } from '../hooks/useHashCostChartData'

import { formatNumber } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { TIMEFRAME_TYPE } from '@/constants/ranges'
import { HashpriceChart } from '@/MultiSiteViews/Charts/HashpriceChart/HashpriceChart'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'
import type { Metric, MultiSiteDateRange, TimeframeType } from '@/types'

interface HashCostTabProps {
  dateRange: MultiSiteDateRange
  timeFrameType?: TimeframeType | null
}

const HashCostTab = ({ dateRange, timeFrameType }: HashCostTabProps) => {
  const { data, isLoading, metrics } = useHashCostChartData({ dateRange, timeFrameType })

  return (
    <>
      {timeFrameType === TIMEFRAME_TYPE.WEEK ? (
        <Disclaimer>Cost data is provided on a monthly base</Disclaimer>
      ) : (
        <HashCostMetricsWrapper>
          {_map(_values(metrics), (metric: Metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              unit={metric.unit}
              value={formatNumber(metric.value)}
              isHighlighted={metric.isHighlighted}
              bgColor={COLOR.BLACK_ALPHA_05}
            />
          ))}
        </HashCostMetricsWrapper>
      )}
      {timeFrameType === TIMEFRAME_TYPE.YEAR && (
        <HashpriceChart isLoading={isLoading} data={data} customFormatTemplate={'yyyy-MM'} />
      )}
    </>
  )
}

export default HashCostTab

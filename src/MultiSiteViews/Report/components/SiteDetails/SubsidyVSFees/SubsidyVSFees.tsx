import _round from 'lodash/round'

import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { CURRENCY, UNITS } from '@/constants/units'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { formatDataLabel, type BarChartData } from '@/MultiSiteViews/Report/lib/chart-builders'

interface SubsidyVSFeesProps {
  subsidyFees?: BarChartData
  avgFeesSats?: BarChartData
}

const SubsidyVSFees = ({ subsidyFees, avgFeesSats }: SubsidyVSFeesProps) => (
  <Mosaic template={['subsidy-fees', 'avg-fees']} gap="24px" rowHeight="1fr">
    <Mosaic.Item area="subsidy-fees">
      <ThresholdBarChart
        chartTitle="Subsidy/Fees"
        showDataLabels
        data={subsidyFees}
        isStacked
        displayColors={false}
        yTicksFormatter={formatDataLabel}
        // @ts-expect-error - JS component accepts function but TS doesn't know about PropTypes
        yRightTicksFormatter={(v) => `${_round(v * 100)}%`}
        unit={CURRENCY.BTC_LABEL}
      />
    </Mosaic.Item>

    <Mosaic.Item area="avg-fees">
      <ThresholdBarChart
        chartTitle="Average Fees in Sats/vByte"
        showDataLabels
        data={avgFeesSats}
        isLegendVisible={false}
        displayColors={false}
        yTicksFormatter={formatDataLabel}
        unit={`${UNITS.SATS}/${UNITS.VBYTE}`}
      />
    </Mosaic.Item>
  </Mosaic>
)

export default SubsidyVSFees

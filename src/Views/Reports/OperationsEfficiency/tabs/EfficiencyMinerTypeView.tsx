import { useEfficiencyMinerType } from '../hooks/useEfficiencyMinerType'
import { ChartHeader, ChartHeaderActions, ChartTitle } from '../OperationsEfficiency.styles'

import { formatUnit } from '@/app/utils/format'
import { BarSteppedLineChart } from '@/Components/BarSteppedLineChart/BarSteppedLineChart'
import ReportTimeFrameSelector, {
  useReportTimeFrameSelectorState,
} from '@/Components/Reports/ReportTimeFrameSelector/ReportTimeFrameSelector'
import { Spinner } from '@/Components/Spinner/Spinner'
import { UNITS } from '@/constants/units'

const EfficiencyMinerTypeView = () => {
  const reportTimeFrameState = useReportTimeFrameSelectorState()
  const { data, isLoading } = useEfficiencyMinerType(reportTimeFrameState)

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <ChartHeader>
            <ChartTitle>Site Efficiency</ChartTitle>
            <ChartHeaderActions>
              <ReportTimeFrameSelector {...reportTimeFrameState} />
            </ChartHeaderActions>
          </ChartHeader>
          <BarSteppedLineChart
            showDataLabels
            isLegendVisible={false}
            chartData={data}
            unit={UNITS.EFFICIENCY_W_PER_TH_S}
            yTicksFormatter={(value) =>
              formatUnit({
                value,
                unit: UNITS.EFFICIENCY_W_PER_TH_S,
              })
            }
          />
        </>
      )}
    </>
  )
}

export default EfficiencyMinerTypeView

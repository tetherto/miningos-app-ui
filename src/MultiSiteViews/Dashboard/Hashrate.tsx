import _map from 'lodash/map'
import _toUpper from 'lodash/toUpper'
import { useParams } from 'react-router'

import { MultisitePageWrapper } from '../MultiSite.styles'

import type { RegionItem } from './Dashboard.types'

import { useGetOperationsHashrateQuery } from '@/app/services/api'
import { getHashrateUnit } from '@/app/utils/deviceUtils'
import SiteOperationsChart from '@/Components/SiteOperationChart/SiteOperationChart'
import { CHART_COLORS } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { UNITS } from '@/constants/units'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useMultiSiteRTRequestParams } from '@/hooks/useMultiSiteRTRequestParams'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'

interface HashrateApiResponse {
  regions?: RegionItem[]
}

const Hashrate = () => {
  const { siteId } = useParams<{ siteId: string }>()
  const { getSiteById, selectedSites } = useMultiSiteMode()
  const site = getSiteById(siteId ?? '')
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { buildRequestParams } = useMultiSiteRTRequestParams()

  const { start = 0, end = 0, period = PERIOD.DAILY } = dateRange ?? {}

  const lineColors = [CHART_COLORS.METALLIC_BLUE, CHART_COLORS.red]

  const params = buildRequestParams({
    start,
    end,
    period: (period as 'daily' | 'weekly' | 'monthly') || PERIOD.DAILY,
    sites: siteId ? [siteId] : (selectedSites as string[]),
    groupByRegion: true,
  })

  const options = {
    skip: !dateRange?.start || !dateRange?.end || !(selectedSites as string[]).length,
  }

  const {
    data: hashrateData,
    isLoading: isLoadingHashrate,
    isFetching: isHashrateFetching,
  } = useGetOperationsHashrateQuery(params, options)

  const typedHashrateData = hashrateData as HashrateApiResponse | undefined

  const hashrateChartData = typedHashrateData?.regions
    ? { dataset: typedHashrateData.regions }
    : { dataset: [] }

  return (
    <MultisitePageWrapper>
      <Header
        pageTitle="Hashrate"
        hasBackButton
        backToDestination="dashboard"
        breadcrumbMiddleStep="Dashboard"
        selected={selectedSites as string[]}
        site={site}
        isExtended
        dateRange={dateRange ?? undefined}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <SiteOperationsChart
        title="Hashrate"
        propName="hashrate"
        unit={UNITS.HASHRATE_PH_S}
        data={hashrateChartData}
        isLoading={isLoadingHashrate || isHashrateFetching}
        legend={_map(
          siteId ? [siteId] : (selectedSites as string[]),
          (item: string, idx: number) => ({
            label: _toUpper(item),
            color: lineColors[idx],
          }),
        )}
        legendPosition="left"
        yTicksFormatter={(value: number) => (value ? String(getHashrateUnit(value).value) : '0')}
        customDateFormat={period === PERIOD.MONTHLY ? 'MM-dd' : undefined}
        uniformDistribution
      />
    </MultisitePageWrapper>
  )
}

export default Hashrate

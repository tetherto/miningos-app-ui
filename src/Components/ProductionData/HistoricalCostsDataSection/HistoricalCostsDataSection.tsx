import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _toLowerCase from 'lodash/toLower'

import {
  getOperationalCostsByMonth,
  getEnergyCostsByMonth,
  getTotalCostsByMonth,
  getSiteCostsDataset,
  getEnergyCostsDataset,
  getOperationalCostsDataset,
  getCostPerBtc,
} from './HistoricalCostsData.utils'
import { HISTORICAL_COSTS_DATA_SECTION_CHART_HEIGHT } from './HistoricalCostsDataSection.const'
import {
  HistoricalCostDataSectionRoot,
  HistoricalCostDataSectionItem,
  HistoricalCostDataSectionItemTitle,
  HistoricalCostDataSectionItemChart,
} from './HistoricalCostsDataSection.styles'

import { useGetGlobalDataQuery } from '@/app/services/api'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatValueUnit } from '@/app/utils/format'
import BarChart, { type BarChartDataset } from '@/Components/BarChart/BarChart'
import ChartLoadingSkeleton from '@/Components/ChartLoadingSkeleton/ChartLoadingSkeleton'

interface HistoricalCostsDataSectionProps {
  currentSite?: string
  yearlyData?: UnknownRecord[]
}

interface DatasetItem {
  title: string
  dataset: unknown[]
}

const HistoricalCostsDataSection = ({
  currentSite = '',
  yearlyData = [],
}: HistoricalCostsDataSectionProps) => {
  const { data, isLoading } = useGetGlobalDataQuery({
    type: 'productionCosts',
    query: JSON.stringify({ site: { $eq: currentSite } }),
  })

  const datasetsList = (() => {
    if (!Array.isArray(data)) return []

    const siteData = _filter(
      data,
      (item: { site?: string; [key: string]: unknown }) =>
        _toLowerCase(item.site) === _toLowerCase(currentSite),
    )

    const operationalCostsByMonth = getOperationalCostsByMonth(siteData)

    const energyCostsByMonth = getEnergyCostsByMonth(siteData)

    const totalCostsByMonth = getTotalCostsByMonth(operationalCostsByMonth)

    const firstSiteData = (_head(siteData) ?? {}) as UnknownRecord

    return _filter(
      [
        {
          title: 'Site Costs',
          dataset: getSiteCostsDataset([
            totalCostsByMonth,
            energyCostsByMonth,
            operationalCostsByMonth,
          ]),
        },
        {
          title: 'Energy Costs',
          dataset: getEnergyCostsDataset(_keys(firstSiteData.energyCostsUSD || {}), siteData),
        },
        {
          title: 'Operational Costs',
          dataset: getOperationalCostsDataset(
            _keys(firstSiteData.operationalCostsUSD || {}),
            siteData,
          ),
        },
        {
          title: 'Costs / BTC',
          dataset: getCostPerBtc(
            yearlyData as Array<
              Pick<import('./HistoricalCostsData.utils').CostsEntry, 'month' | 'balance'>
            >,
            totalCostsByMonth,
            energyCostsByMonth,
          ),
        },
      ],
      (item: DatasetItem) => !_isEmpty(item.dataset),
    )
  })()

  return (
    <HistoricalCostDataSectionRoot>
      {_map(datasetsList, (item: DatasetItem) => (
        <HistoricalCostDataSectionItem key={item.title}>
          <HistoricalCostDataSectionItemTitle>{item.title}</HistoricalCostDataSectionItemTitle>
          <HistoricalCostDataSectionItemChart>
            {isLoading ? (
              <ChartLoadingSkeleton />
            ) : (
              <BarChart
                yTicksFormatter={(value: number) => formatValueUnit(value, 'USD')}
                data={{ dataset: item.dataset as BarChartDataset[] }}
                chartHeight={HISTORICAL_COSTS_DATA_SECTION_CHART_HEIGHT}
              />
            )}
          </HistoricalCostDataSectionItemChart>
        </HistoricalCostDataSectionItem>
      ))}
    </HistoricalCostDataSectionRoot>
  )
}

export default HistoricalCostsDataSection

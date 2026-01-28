import _isString from 'lodash/isString'
import { useRef } from 'react'
import { useSelector } from 'react-redux'

import { MultisitePageWrapper } from '../MultiSite.styles'

import {
  getPeriodLabelPrefix,
  getSiteOperationConfigEnd,
  getSiteOperationConfigStart,
} from './SiteOperations.helper'
import { ChartsSection } from './SiteOperations.style'

import {
  useGetOperationsMinersQuery,
  useGetOperationsHashrateQuery,
  useGetOperationsEfficiencyQuery,
  useGetOperationsConsumptionQuery,
} from '@/app/services/api'
import { getSelectedSites } from '@/app/slices/multiSiteSlice'
import { formatPowerConsumption, getHashrateUnit } from '@/app/utils/deviceUtils'
import { formatNumber } from '@/app/utils/format'
import SiteOperationsChart from '@/Components/SiteOperationChart/SiteOperationChart'
import { CHART_COLORS } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { UNITS } from '@/constants/units'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import useMultiSiteRTRequestParams from '@/hooks/useMultiSiteRTRequestParams'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { EfficiencyResponse, HashrateResponse, PowerResponse, WorkersResponse } from '@/types'
import type { MultiSiteDateRange } from '@/types/redux'

const SiteOperations = () => {
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { site, siteId, siteList, isLoading: isLoadingSiteList } = useMultiSiteMode()
  const selectedSites = useSelector(getSelectedSites)

  // URL sync disabled
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const defaultDateRange: MultiSiteDateRange = { start: 0, end: 0, period: PERIOD.DAILY }
  const effectiveDateRange: MultiSiteDateRange = dateRange || defaultDateRange

  const startDate = getSiteOperationConfigStart(effectiveDateRange)
  const endStr = getSiteOperationConfigEnd(effectiveDateRange)

  let startValue: number
  if (startDate) {
    if (startDate instanceof Date) {
      startValue = startDate.getTime()
    } else {
      startValue = startDate
    }
  } else {
    startValue = Date.now()
  }
  const start = useRef(startValue).current

  let endValue: number
  if (endStr) {
    if (_isString(endStr)) {
      endValue = new Date(endStr).getTime()
    } else {
      endValue = endStr
    }
  } else {
    endValue = Date.now()
  }
  const end = useRef(endValue).current

  const requestParams = buildRequestParams({
    start: start as number | Date,
    end: end as number | Date,
    period: effectiveDateRange.period as 'daily' | 'weekly' | 'monthly',
    sites: selectedSites as string[],
  })

  const skip =
    !requestParams ||
    isLoadingSiteList ||
    siteList?.length === 0 ||
    (!siteId && (selectedSites as string[]).length === 0) ||
    isParamBuilderLoading

  const options = { skip }

  // Queries
  const {
    data: hashrateData,
    isLoading: isLoadingHashrate,
    isFetching: isHashrateFetching,
  } = useGetOperationsHashrateQuery<HashrateResponse>(requestParams, options)

  const {
    data: efficiencyData,
    isLoading: isLoadingEfficiency,
    isFetching: isEfficiencyFetching,
  } = useGetOperationsEfficiencyQuery<EfficiencyResponse>(requestParams, options)

  const {
    data: powerData,
    isLoading: isLoadingPower,
    isFetching: isPowerFetching,
  } = useGetOperationsConsumptionQuery<PowerResponse>(requestParams, options)

  const {
    data: minersData,
    isLoading: isLoadingMiners,
    isFetching: isMinersFetching,
  } = useGetOperationsMinersQuery<WorkersResponse>(requestParams, options)

  const timestampFormatTemplate = effectiveDateRange.period === PERIOD.MONTHLY ? 'MM-dd' : undefined

  return (
    <MultisitePageWrapper>
      <Header
        isExtended
        pageTitle="Operations Dashboard"
        site={site}
        hasSiteSelect
        dateRange={effectiveDateRange}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <ChartsSection>
        {/* Hashrate */}
        <SiteOperationsChart
          title="Hashrate"
          unit={UNITS.HASHRATE_PH_S}
          isLoading={isLoadingHashrate || isHashrateFetching}
          data={hashrateData as unknown[] | { log?: unknown[]; [key: string]: unknown } | undefined}
          propName="hashrate"
          nominalValue={hashrateData?.nominalHashrate}
          legend={[
            {
              color: CHART_COLORS.METALLIC_BLUE,
              label: `${getPeriodLabelPrefix(effectiveDateRange.period)} Average Hashrate`,
            },
            {
              color: CHART_COLORS.red,
              label: 'Installed Nominal Hashrate',
            },
          ]}
          redirectTo={`${siteId ? `/sites/${siteId}` : ''}/site-operations/hashrate`}
          yTicksFormatter={(value: number) =>
            String(value ? (getHashrateUnit(value).value as number) : 0)
          }
          customDateFormat={timestampFormatTemplate}
        />

        {/* Efficiency */}
        <SiteOperationsChart
          title="Efficiency"
          unit={`${UNITS.POWER_W}/${UNITS.HASHRATE_TH_S}`}
          isLoading={isLoadingEfficiency || isEfficiencyFetching}
          data={
            efficiencyData as unknown as
              | unknown[]
              | { log?: unknown[]; [key: string]: unknown }
              | undefined
          }
          propName="efficiency"
          nominalValue={efficiencyData?.nominalEfficiency}
          legend={[
            {
              color: CHART_COLORS.METALLIC_BLUE,
              label: 'Actual Sites Efficiency',
            },
            {
              color: CHART_COLORS.red,
              label: 'Nominal Miners Efficiency',
            },
          ]}
          redirectTo={`${siteId ? `/sites/${siteId}` : ''}/site-operations/efficiency`}
          yTicksFormatter={(value: number) =>
            String(value ? (getHashrateUnit(value).value as number) : 0)
          }
          customDateFormat={timestampFormatTemplate}
        />

        {/* Miners */}
        <SiteOperationsChart
          title="Miners"
          isLoading={isLoadingMiners || isMinersFetching}
          data={minersData as unknown[] | { log?: unknown[]; [key: string]: unknown } | undefined}
          propName="workers"
          nominalValue={minersData?.nominalMinerCapacity}
          legend={[
            {
              color: CHART_COLORS.METALLIC_BLUE,
              label: `${getPeriodLabelPrefix(effectiveDateRange.period)} Active Miners`,
            },
            {
              color: CHART_COLORS.red,
              label: 'Nominal Miner Capacity',
            },
          ]}
          redirectTo={`${siteId ? `/sites/${siteId}` : ''}/site-operations/miners`}
          yTicksFormatter={(value: number) =>
            value ? formatNumber(value, { maximumFractionDigits: 0 }) : '0'
          }
          customDateFormat={timestampFormatTemplate}
        />

        {/* Power Consumption */}
        <SiteOperationsChart
          legendPosition="center"
          title="Power Consumption"
          unit={UNITS.ENERGY_MW}
          isLoading={isLoadingPower || isPowerFetching}
          data={powerData as unknown[] | { log?: unknown[]; [key: string]: unknown } | undefined}
          propName="consumption"
          nominalValue={powerData?.availablePower}
          legend={[
            {
              color: CHART_COLORS.METALLIC_BLUE,
              label: `${getPeriodLabelPrefix(effectiveDateRange.period)} Average Power Consumption`,
            },
            {
              color: CHART_COLORS.red,
              label: `${getPeriodLabelPrefix(effectiveDateRange.period)} Average Power Availability`,
            },
          ]}
          redirectTo={`${siteId ? `/sites/${siteId}` : ''}/site-operations/power-consumption`}
          yTicksFormatter={(value: number) =>
            value
              ? formatNumber(formatPowerConsumption(value).value as number, {
                  maximumFractionDigits: 4,
                })
              : '0'
          }
          customDateFormat={timestampFormatTemplate}
        />
      </ChartsSection>
    </MultisitePageWrapper>
  )
}

export default SiteOperations

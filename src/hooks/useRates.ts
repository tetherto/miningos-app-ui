import { useParams } from 'react-router-dom'

import useMultiSiteRTRequestParams from './useMultiSiteRTRequestParams'

import {
  useGetDowntimeCurtailmentQuery,
  useGetDowntimeOperationalIssuesQuery,
} from '@/app/services/api'

interface DateRange {
  start?: number
  end?: number
  period?: string
}

export const useRates = (dateRange?: DateRange) => {
  const { siteId } = useParams<{ siteId: string }>()
  const { buildRequestParams } = useMultiSiteRTRequestParams()

  const { start, end, period } = dateRange ?? {}

  const params = buildRequestParams({
    start: start as number | Date,
    end: end as number | Date,
    period: period as 'daily' | 'weekly' | 'monthly' | undefined,
    sites: [siteId as string],
  })

  const { data: downtimeCurtailmentData } = useGetDowntimeCurtailmentQuery(params)
  const { data: downtimeOperationalIssuesData } = useGetDowntimeOperationalIssuesQuery(params)

  const curtailmentLog = (downtimeCurtailmentData as { log?: unknown })?.log
  const curtailmentSummary = (downtimeCurtailmentData as { summary?: unknown })?.summary
  const operationalIssuesLog = (downtimeOperationalIssuesData as { log?: unknown })?.log
  const operationalIssuesSummary = (downtimeOperationalIssuesData as { summary?: unknown })?.summary

  return {
    curtailmentLog,
    curtailmentSummary,
    operationalIssuesLog,
    operationalIssuesSummary,
  }
}

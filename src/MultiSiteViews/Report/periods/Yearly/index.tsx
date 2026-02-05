import _filter from 'lodash/filter'
import _map from 'lodash/map'
import _toLower from 'lodash/toLower'
import { useParams } from 'react-router'

import AllSites from '../../components/AllSites/AllSites'
import ReportPage from '../../components/ReportPage/ReportPage'
import SiteDetails from '../../components/SiteDetails'
import { DateRangeString, ReportApiResponse } from '../../Report.types'

import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

interface AnnualReportProps {
  data: ReportApiResponse
  dateRange: DateRangeString
}

export default function AnnualReport({ data, dateRange }: AnnualReportProps) {
  const { siteId } = useParams()
  const { siteList } = useMultiSiteMode()

  // Filter sites based on URL param if present
  const filteredSiteList = siteId
    ? _filter(siteList, (s) => _toLower(s.id) === _toLower(siteId))
    : siteList

  return (
    <>
      {/* Only show AllSites summary when viewing all sites */}
      {!siteId && (
        <ReportPage>
          <AllSites data={data} dateRange={dateRange} reportType="yearly" />
        </ReportPage>
      )}

      {_map(filteredSiteList, (site) => (
        <SiteDetails
          site={site}
          key={site.value}
          reportData={data}
          dateRange={dateRange}
          reportType="yearly"
          showCover={!siteId}
        />
      ))}
    </>
  )
}

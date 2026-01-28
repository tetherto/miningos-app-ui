import Radio from 'antd/es/radio'
import { format } from 'date-fns/format'
import _toLower from 'lodash/toLower'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'

import { Header } from '../SharedComponents/Header/Header'

import { REPORT_DURATIONS } from './Reports.constants'
import { ReportsPage, ReportsPageContent } from './Reports.style'
import { getReportColumns, getReports } from './Reports.utils'

import AppTable from '@/Components/AppTable/AppTable'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

interface ReportRecord extends Record<string, unknown> {
  from: Date
  to: Date
  publishedAt: Date
}

interface Site {
  name?: string
  value?: string
  id?: string | undefined
}

const Reports = () => {
  const { siteId } = useParams<{ siteId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getSiteById } = useMultiSiteMode()

  const site = getSiteById(siteId ?? '') as Site

  const duration = searchParams.get('duration') || REPORT_DURATIONS.WEEKLY

  const setDuration = (newDuration: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('duration', newDuration)
    setSearchParams(newParams)
  }

  const handleReportClick = (record: ReportRecord) => {
    const reportParams = new URLSearchParams({
      reportType: _toLower(duration),
      dateRange: `${format(record.from, 'MMM dd')} - ${format(record.to, 'MMM dd, yyyy')}`,
      location: site?.name || 'All Sites',
    })

    const basePath = siteId ? `/sites/${siteId}/site-reports/report` : '/site-reports/report'
    navigate(`${basePath}?${reportParams.toString()}`)
  }

  const durationOptions = [
    { label: 'Weekly', value: REPORT_DURATIONS.WEEKLY },
    { label: 'Monthly', value: REPORT_DURATIONS.MONTHLY },
    { label: 'Annual', value: REPORT_DURATIONS.YEARLY },
  ]

  return (
    <ReportsPage>
      <ReportsPageContent>
        <Header pageTitle="Reports" site={site} />

        <Radio.Group
          style={{ flexShrink: 0 }}
          options={durationOptions}
          onChange={(e) => setDuration(e.target.value)}
          value={duration}
          optionType="button"
          buttonStyle="solid"
          size="large"
        />
      </ReportsPageContent>

      <AppTable<ReportRecord>
        dataSource={getReports(duration)}
        columns={getReportColumns({
          onDownloadClick: handleReportClick,
        })}
      />
    </ReportsPage>
  )
}

export default Reports

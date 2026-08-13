import { DownloadOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import _map from 'lodash/map'
import _toUpper from 'lodash/toUpper'
import * as React from 'react'
import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import ReportCover from './components/ReportCover/ReportCover'
import ReportPage from './components/ReportPage/ReportPage'
import MonthlyReport from './periods/Monthly'
import WeeklyReport from './periods/Weekly'
import AnnualReport from './periods/Yearly'
import { Container, ReportDetailsPage } from './Report.style'
import type { ReportApiResponse } from './Report.types'
import {
  parseDateRange,
  PERIOD_MAP,
  sanitizeFileName,
  formatDateForFilename,
  getMonthYear,
} from './Report.util'

import { useGetReportsQuery } from '@/app/services/api'
import { COLOR } from '@/constants/colors'
import { useExportPdf } from '@/hooks/useExportPdf'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useWindowSize } from '@/hooks/useWindowSize'

const INITIAL_PX_RATIO = 2

interface ReportConfig {
  title: string
  fileName: string
  component: React.ReactElement
  subtitle: string
}

const createReportConfig = (
  type: string,
  location: string,
  dateRange: string,
  reportData: ReportApiResponse,
): ReportConfig => {
  const sanitizedLocation = sanitizeFileName(location)
  const dateStr = formatDateForFilename(dateRange)

  const baseConfig = {
    title: location,
    fileName: `${sanitizedLocation}-${type}-report-${dateStr}.pdf`,
  }

  const configs: Record<string, ReportConfig> = {
    weekly: {
      ...baseConfig,
      component: <WeeklyReport data={reportData} dateRange={dateRange} />,
      subtitle: `Weekly • ${dateRange}`,
    },
    monthly: {
      ...baseConfig,
      component: <MonthlyReport data={reportData} dateRange={dateRange} />,
      title: `${location} Report`,
      subtitle: (() => {
        const { monthName, year } = getMonthYear(dateRange)
        return `${monthName} ${year}`
      })(),
    },
    annual: {
      ...baseConfig,
      component: <AnnualReport data={reportData} dateRange={dateRange} />,
      title: `${location} Report`,
      subtitle: `1 Year • ${dateRange}`,
    },
  }

  return configs[type] || configs.annual
}

export default function ReportDetails() {
  const { siteId } = useParams()
  const [searchParams] = useSearchParams()
  const { selectedSites, siteList } = useMultiSiteMode()
  const { windowWidth } = useWindowSize()

  const reportType = searchParams.get('reportType') || 'annual'
  const dateRange = searchParams.get('dateRange') || ''
  const location = searchParams.get('location') || 'All Sites'

  const { startDate, endDate } = parseDateRange(dateRange)

  // Priority: URL param > selected filter > all sites
  const regions = useMemo(() => {
    if (siteId) {
      return [_toUpper(siteId)]
    }
    if (selectedSites?.length > 0) {
      return _map(selectedSites, (id) => _toUpper(id))
    }
    return _map(siteList, (s) => _toUpper(s.id))
  }, [siteId, selectedSites, siteList])

  const period = PERIOD_MAP[reportType] || 'monthly'

  const {
    data: reportData,
    error,
    isLoading,
  } = useGetReportsQuery({
    regions,
    startDate,
    endDate,
    period,
  })

  const reportConfig =
    reportData && reportData.regions
      ? createReportConfig(reportType, location, dateRange, reportData)
      : null

  const exportResult = useExportPdf({
    pixelRatio: INITIAL_PX_RATIO,
    pageWidthPx: windowWidth,
    fileName: reportConfig?.fileName || 'report.pdf',
    backgroundColor: COLOR.DARK_BLACK,
  })

  const reportRef = exportResult[0] as React.RefObject<HTMLDivElement | null>
  const exportAsPdf = exportResult[1] as () => Promise<void>
  const isExporting = exportResult[2] as boolean

  return (
    <>
      <Container>
        <Button icon={<DownloadOutlined />} loading={isExporting} onClick={exportAsPdf}>
          Export PDF
        </Button>
      </Container>

      <ReportDetailsPage ref={reportRef}>
        <ReportPage isCover>
          <ReportCover
            title={reportConfig?.title || location}
            subtitle={reportConfig?.subtitle || ''}
            isLoading={isLoading}
          />
        </ReportPage>

        {!isLoading && reportData && !error && reportConfig?.component}
      </ReportDetailsPage>
    </>
  )
}

import { EyeOutlined } from '@ant-design/icons'
import type { ColumnProps } from 'antd/es/table'
import { add } from 'date-fns/add'
import { compareAsc } from 'date-fns/compareAsc'
import { format } from 'date-fns/format'
import { sub } from 'date-fns/sub'
import _map from 'lodash/map'

import { REPORTS_GENERATION_CONFIG, REPORT_DURATIONS } from './Reports.constants'
import { StyledButton } from './Reports.style'

import { DATE_FORMAT, SHORT_DATE_FORMAT } from '@/constants/dates'

interface ReportRecord extends Record<string, unknown> {
  from: Date
  to: Date
  publishedAt: Date
}

export const getReportColumns = ({
  onDownloadClick,
}: {
  onDownloadClick: (record: ReportRecord) => void
}): ColumnProps<ReportRecord>[] => [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: (_text: unknown, record: ReportRecord) =>
      `${format(record.from, SHORT_DATE_FORMAT)} - ${format(record.to, SHORT_DATE_FORMAT)}`,
    sorter: (a: ReportRecord, b: ReportRecord) => compareAsc(a.from, b.from),
  },
  {
    title: 'Date of Publish',
    dataIndex: 'publishedAt',
    key: 'publishedAt',
    render: (date: Date) => format(date, DATE_FORMAT),
    sorter: (a: ReportRecord, b: ReportRecord) => compareAsc(a.publishedAt, b.publishedAt),
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center' as const,
    render: (_text: unknown, record: ReportRecord) => (
      <StyledButton icon={<EyeOutlined />} onClick={() => onDownloadClick(record)} type="primary">
        View Report
      </StyledButton>
    ),
  },
]

export const getReports = (duration: string): ReportRecord[] => {
  const today = new Date()
  const config = REPORTS_GENERATION_CONFIG[duration as keyof typeof REPORTS_GENERATION_CONFIG]

  // For yearly reports, use today as end to include current year
  // For other reports, subtract 1 day from the period start
  const end =
    duration === REPORT_DURATIONS.YEARLY ? today : sub(config.getEndDate(today), { days: 1 })

  const start = sub(end, {
    [config.durationInterval]: 10,
  })
  const dates = config.getIntervals({
    start: start,
    end: end,
  })

  // Filter annual reports to only show 2024 and onwards
  const filteredDates =
    duration === REPORT_DURATIONS.YEARLY
      ? dates.filter((date) => date.getFullYear() >= 2024)
      : dates

  return _map(filteredDates, (from: Date) => {
    const to = add(from, {
      [config.durationInterval]: 1,
      days: -1,
    })

    return {
      from,
      to,
      publishedAt: add(to, { days: 1 }),
    }
  })
}

import { formatNumber } from '../../../app/utils/format'
import { DATE_TIME_FORMAT } from '../../../constants/dates'

export const getBalanceTableColumns = (isMobile, getFormattedDate) => [
  {
    title: 'Time',
    dataIndex: 'date',
    key: 'date',
    sorter: (a, b) => a.ts - b.ts,
    render: (text, record) => `${getFormattedDate(new Date(record.ts), null, DATE_TIME_FORMAT)}`,
    multiple: 3,
    width: isMobile ? 150 : '',
    fixed: 'left',
    defaultSortOrder: 'descend',
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    sorter: (a, b) => a.balance - b.balance,
    multiple: 3,
    width: isMobile ? 150 : '',
    fixed: 'left',
    render: (value) => formatNumber(value),
  },
  {
    title: 'Unsettled',
    dataIndex: 'unsettled',
    key: 'unsettled',
    sorter: (a, b) => a.unsettled - b.unsettled,
    multiple: 3,
    width: isMobile ? 150 : '',
    render: (value) => formatNumber(value),
    fixed: 'left',
  },
  {
    title: 'Revenue 24 hr.',
    dataIndex: 'revenue_24h',
    key: 'revenue_24h',
    sorter: (a, b) => a.revenue_24h - b.revenue_24h,
    multiple: 3,
    width: isMobile ? 150 : '',
    render: (value) => formatNumber(value),
    fixed: 'left',
  },
]

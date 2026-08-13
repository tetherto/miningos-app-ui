import { formatDate } from 'date-fns/format'

import LiveIcon from '../../../../Components/Reports/Icons/LiveIcon'
import { HighlightableButton } from '../../Reports.styles'

import {
  AlertBody,
  AlertMessage,
  AlertTitle,
  MinerReportUpdateAlertWrapper,
} from './MinerReportUpdateAlert.styles'

import { DATE_TIME_FORMAT } from '@/constants/dates'

interface MinerReportUpdateAlertProps {
  onRefresh: () => void
  lastUpdatedAt: number
}

const MinerReportUpdateAlert = ({ onRefresh, lastUpdatedAt }: MinerReportUpdateAlertProps) => (
  <MinerReportUpdateAlertWrapper>
    <LiveIcon />
    <AlertBody>
      <AlertTitle>Data Update Feed</AlertTitle>
      <AlertMessage>
        Last data updated at {formatDate(new Date(lastUpdatedAt), DATE_TIME_FORMAT)}, please click
        in Refresh to update the data.
      </AlertMessage>
    </AlertBody>
    <HighlightableButton className="active" onClick={onRefresh}>
      Refresh
    </HighlightableButton>
  </MinerReportUpdateAlertWrapper>
)

export default MinerReportUpdateAlert

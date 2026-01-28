import { DEFAULT_TIMEZONE } from '../../Report.constants'

import {
  FooterWrapper,
  FooterContent,
  TopBorder,
  TimezoneText,
  ConfidentialText,
} from './ReportFooter.style'

/**
 * ReportFooter component
 */
interface ReportFooterProps {
  /** Timezone to display */
  timezone?: string
}

const ReportFooter = ({ timezone = DEFAULT_TIMEZONE }: ReportFooterProps) => (
  <FooterWrapper>
    <TopBorder />
    <FooterContent>
      <TimezoneText>Timezone: {timezone}</TimezoneText>
      <ConfidentialText>Confidential - Internal Use Only</ConfidentialText>
    </FooterContent>
  </FooterWrapper>
)

export default ReportFooter

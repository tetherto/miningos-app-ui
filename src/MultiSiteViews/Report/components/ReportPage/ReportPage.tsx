import { ReactNode } from 'react'

import { DEFAULT_TIMEZONE, DEFAULT_SHOW_LOGO, DEFAULT_IS_COVER } from '../../Report.constants'
import { ReportPageWrapper, ReportPageContent } from '../../Report.style'
import ReportFooter from '../ReportFooter/ReportFooter'
import ReportHeader from '../ReportHeader/ReportHeader'

/**
 * ReportPage component - Complete page structure with Header, Content, and Footer
 */
interface ReportPageProps {
  /** Report content (charts, metrics, etc.) */
  children: ReactNode
  /** Page title for header */
  title?: string
  /** Page subtitle for header */
  subtitle?: string
  /** Label for price section in header */
  priceText?: string
  /** Value for price section in header */
  priceValue?: string
  /** Whether to show logo in header */
  showLogo?: boolean
  /** Whether this is a cover page (hides footer) */
  isCover?: boolean
  /** Timezone to display in footer */
  timezone?: string
}

const ReportPage = ({
  children,
  title,
  subtitle,
  priceText,
  priceValue,
  showLogo = DEFAULT_SHOW_LOGO,
  isCover = DEFAULT_IS_COVER,
  timezone = DEFAULT_TIMEZONE,
}: ReportPageProps) => (
  <ReportPageWrapper>
    <ReportPageContent>
      {title && (
        <ReportHeader
          title={title}
          subtitle={subtitle}
          priceText={priceText}
          priceValue={priceValue}
          showLogo={showLogo}
        />
      )}
      {children}

      {!isCover && <ReportFooter timezone={timezone} />}
    </ReportPageContent>
  </ReportPageWrapper>
)

export default ReportPage

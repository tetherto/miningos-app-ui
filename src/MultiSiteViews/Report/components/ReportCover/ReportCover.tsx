import Spin from 'antd/es/spin'
import _capitalize from 'lodash/capitalize'

import { CoverLogo } from '../Icons'

import { BackgroundImage } from './BackgroundImage'
import {
  CoverWrapper,
  ContentWrapper,
  CoverTitle,
  CoverSubtitle,
  Content,
  LogoCorner,
  LoadingWrapper,
} from './ReportCover.style'

/**
 * ReportCover component
 */
interface ReportCoverProps {
  /** Main title text */
  title: string
  /** Subtitle text */
  subtitle?: string
  /** Whether this is the front cover */
  isFront?: boolean
  /** Whether to show the logo */
  showLogo?: boolean
  /** Whether to show loading state */
  isLoading?: boolean
}

const ReportCover = ({
  title,
  subtitle,
  isFront = true,
  showLogo = true,
  isLoading = false,
}: ReportCoverProps) => (
  <CoverWrapper>
    <BackgroundImage />

    <ContentWrapper $isFront={isFront}>
      {showLogo && (
        <LogoCorner>
          <CoverLogo />
        </LogoCorner>
      )}

      {isLoading ? (
        <LoadingWrapper>
          <Spin size="large" tip="Loading report..." />
        </LoadingWrapper>
      ) : (
        <Content $isFront={isFront}>
          <CoverTitle $center={!isFront}>{_capitalize(title)}</CoverTitle>
          {subtitle ? <CoverSubtitle>{subtitle}</CoverSubtitle> : null}
        </Content>
      )}
    </ContentWrapper>
  </CoverWrapper>
)

export default ReportCover

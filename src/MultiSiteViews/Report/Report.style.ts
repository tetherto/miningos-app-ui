import styled from 'styled-components'

import { flexColumn, flexJustifyEnd, flexWrap } from '@/app/mixins'
import { COLOR } from '@/constants/colors'
import { PageRoot } from '@/MultiSiteViews/Common.style'

export const ReportDetailsPage = styled(PageRoot)`
  ${flexColumn};
  gap: 24px;
  background-color: ${COLOR.DARK_BLACK};
`

export const GridBase = styled.div`
  display: grid;
  gap: 16px;
`

export const ReportPageWrapper = styled.div.attrs<Record<string, unknown>>(() => ({
  'data-report-page': true,
}))`
  ${flexColumn};
  width: 100%;
  padding: 24px 24px 0 24px;
  box-sizing: border-box;
  background: ${COLOR.DARK_BLACK};
  color: ${COLOR.WHITE};
  overflow: hidden;
`

export const ReportPageContent = styled.div`
  ${flexColumn};
  gap: 16px;
  flex: 1;
`

interface ChartsContainerProps {
  $isYearly?: boolean
}

export const ChartsContainer = styled.div<ChartsContainerProps>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ $isYearly }) =>
    !$isYearly &&
    `
    @media (min-width: 1024px) {
      & > *:first-child {
        grid-column: span 2;
      }
    }
  `}
`
export const SiteMetricsSection = styled.div`
  ${flexColumn};
  gap: 16px;
  margin-bottom: 32px;
`

export const SiteTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: ${COLOR.WHITE};
  margin-bottom: 0;
`

export const AllSitesMetricsGrid = styled(GridBase)`
  grid-template-columns: repeat(1, 1fr);

  @media (min-width: 676px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

export const IndividualSitesContainer = styled.div`
  ${flexWrap};
  gap: 24px;
  margin-top: 16px;
`

export const IndividualSiteCard = styled.div`
  ${flexColumn}
  gap: 16px;
  flex: 1 1 100%;
  min-width: 300px;

  @media (min-width: 1024px) {
    flex: 1 1 calc(50% - 12px);
  }

  @media (min-width: 1600px) {
    flex: 1 1 calc(33.333% - 16px);
  }
`

export const IndividualSiteMetricsGrid = styled(GridBase)`
  grid-template-columns: repeat(1, 1fr);

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export const Container = styled.div`
  ${flexJustifyEnd};
  margin: 12px;
`

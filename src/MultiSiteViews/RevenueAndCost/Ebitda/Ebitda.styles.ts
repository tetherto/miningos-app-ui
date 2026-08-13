import styled from 'styled-components'

import { Card, MetricCardWrapper } from '@/MultiSiteViews/Common.style'
import { MultisitePageWrapper } from '@/MultiSiteViews/MultiSite.styles'

export const EbitdaCardWrapper = styled(MetricCardWrapper)`
  ${Card} {
    @media screen and (min-width: 1240px) {
      min-width: unset;
    }
  }

  @media screen and (min-width: 1240px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (min-width: 2560px) {
    grid-template-columns: repeat(6, 1fr);
  }
`

export const EbitdaPageWrapper = styled(MultisitePageWrapper)`
  gap: 12px;
`

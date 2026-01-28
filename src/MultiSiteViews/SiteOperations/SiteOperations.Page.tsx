import _map from 'lodash/map'
import { FC } from 'react'

import { MultisitePageWrapper } from '../MultiSite.styles'
import { SiteOperationsCardWrapper } from '../SiteOperations/SiteOperations.style'
import {
  SiteOperationsCard,
  SiteOperationsCardData,
} from '../SiteOperationsCard/SiteOperationsCard'

import SiteOperationsChart, {
  SiteOperationsChartProps,
} from '@/Components/SiteOperationChart/SiteOperationChart'
import { Header, HeaderProps } from '@/MultiSiteViews/SharedComponents/Header/Header'

interface SiteOperationsPageProps {
  cardsData?: SiteOperationsCardData[]
  charts: SiteOperationsChartProps[]
  headerProps?: HeaderProps
}

export const SiteOperationsPage: FC<SiteOperationsPageProps> = ({
  charts,
  headerProps,
  cardsData,
}) => (
  <MultisitePageWrapper>
    <Header pageTitle={headerProps?.pageTitle ?? ''} {...headerProps} />

    {cardsData && (
      <SiteOperationsCardWrapper>
        {_map(cardsData, (item: SiteOperationsCardData) => (
          <SiteOperationsCard key={item.title} data={item} />
        ))}
      </SiteOperationsCardWrapper>
    )}

    {_map(charts, (chart: SiteOperationsChartProps, index: number) => (
      <SiteOperationsChart key={chart.title || index} {...chart} />
    ))}
  </MultisitePageWrapper>
)

export default SiteOperationsPage

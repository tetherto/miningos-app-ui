import { PlusOutlined } from '@ant-design/icons'

import { formatNumber } from '../../../../app/utils/format'
import { COLOR } from '../../../../constants/colors'
import useFetchTransactions from '../../../../hooks/useFetchTransactions'
import DoughnutChartCard from '../../../DoughnutChartCard/DoughnutChartCard'
import { Item, EqualSign, Title, DivideSymbol, ChartContainer } from '../MonthlyCostsSection.styles'

import { CcyAmount } from './CcyAmount'
import { Container, Article, Boxed, PiesWrapper } from './TotalsArticle.styles'

interface TotalsArticleProps {
  energyCosts?: number
  operationalCosts?: number
  year: number
  month: number
}

const TotalsArticle = ({
  energyCosts = 0,
  operationalCosts = 0,
  year,
  month,
}: TotalsArticleProps) => {
  const { totBtcProduced } = useFetchTransactions({ year, month })

  const totalSiteCosts = energyCosts + operationalCosts
  const costPerBtc = totalSiteCosts / totBtcProduced
  const energyCostsPerBtc = energyCosts / totBtcProduced
  const operationCostsPerBtc = operationalCosts / totBtcProduced

  const energyCostsFormatted = (
    <CcyAmount value={energyCosts} unit="USD" meta="Total Energy Costs" />
  )

  const totBtcProducedFormatted = (
    <CcyAmount value={totBtcProduced} unit="BTC" meta="Total Bitcoin produced" />
  )

  const costChartData = {
    dataset: {
      'Energy Cost': { value: energyCosts, color: COLOR.YELLOW },
      'Operational Cost': { value: operationalCosts, color: COLOR.GREEN },
    },
    unit: 'USD',
    label: 'Total Site Costs Distribution',
    value: formatNumber(totalSiteCosts),
  }

  const costPerBtcChartData = {
    dataset: {
      'Energy Cost / BTC': { value: energyCostsPerBtc, color: COLOR.YELLOW },
      'Operational Cost / BTC': { value: operationCostsPerBtc, color: COLOR.GREEN },
    },
    unit: 'USD',
    label: 'Cost Distribution',
    value: formatNumber(costPerBtc),
  }

  return (
    <Container>
      <Title $noColor>Total Site Costs</Title>
      <Article $bottomMargin>
        <Boxed>
          {energyCostsFormatted}
          <PlusOutlined />
          <CcyAmount value={operationalCosts} unit="USD" meta="Total Operational Costs" />
        </Boxed>

        <EqualSign />

        <Boxed $small>
          <CcyAmount value={totalSiteCosts} unit="USD" meta="Total Site Costs" />
        </Boxed>
      </Article>

      <Title $noColor>Total Costs per BTC</Title>
      <Article $bottomMargin>
        <Boxed>
          <CcyAmount value={totalSiteCosts} unit="USD" meta="Total Sites Costs" />
          <DivideSymbol>/</DivideSymbol>
          {totBtcProducedFormatted}
        </Boxed>

        <EqualSign />
        <Boxed $small>
          <CcyAmount value={costPerBtc} unit="USD" meta="Total Costs / BTC" />
        </Boxed>
      </Article>

      <Title $noColor>Energy Costs per BTC</Title>
      <Article $bottomMargin>
        <Boxed>
          {energyCostsFormatted}
          <DivideSymbol>/</DivideSymbol>
          {totBtcProducedFormatted}
        </Boxed>

        <EqualSign />

        <Boxed $small>
          <CcyAmount value={energyCostsPerBtc} unit="USD/BTC" meta="Total Energy Costs / BTC" />
        </Boxed>
      </Article>

      <PiesWrapper>
        <Item>
          <ChartContainer>
            <DoughnutChartCard data={costChartData} isLoading={!costChartData.value} />
          </ChartContainer>
        </Item>

        <Item>
          <ChartContainer>
            <DoughnutChartCard data={costPerBtcChartData} isLoading={!costPerBtcChartData.value} />
          </ChartContainer>
        </Item>
      </PiesWrapper>
    </Container>
  )
}

export default TotalsArticle

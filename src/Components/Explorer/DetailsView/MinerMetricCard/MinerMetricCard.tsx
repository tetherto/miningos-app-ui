import _find from 'lodash/find'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _round from 'lodash/round'

import { formatNumber } from '../../../../app/utils/format'

import {
  LabeledCardWrapper,
  ContentWrapper,
  Box,
  GridBox,
  Item,
  FixedItem,
  ItemLabel,
  ItemValue,
} from './MinerMetricCard.styles'

interface StatItem {
  name?: string
  value?: number | string
  [key: string]: unknown
}

const getStatByLabel = (stats: StatItem[] | undefined, label: string): StatItem | undefined =>
  _find(stats, ({ name }: StatItem) => name === label)

const labels = {
  efficiency: 'Efficiency',
  hashRate: 'Hash rate',
  temperature: 'Temperature',
  frequency: 'Frequency',
  consumption: 'Consumption',
}

interface MinerMetricCardProps {
  primaryStats?: StatItem[]
  secondaryStats?: StatItem[]
  showSecondaryStats?: boolean
}

const MinerMetricCard = ({
  primaryStats,
  secondaryStats,
  showSecondaryStats = true,
}: MinerMetricCardProps) => {
  const efficiencyValue = getStatByLabel(primaryStats, labels.efficiency)
  const hashRateValue = getStatByLabel(primaryStats, labels.hashRate)
  const temperatureValue = getStatByLabel(primaryStats, labels.temperature)
  const frequencyValue = getStatByLabel(primaryStats, labels.frequency)
  const consumptionValue = getStatByLabel(primaryStats, labels.consumption)

  const formattedFrequency = formatNumber(
    _round((_isNumber(temperatureValue?.value) ? temperatureValue?.value : undefined) || 0, 2),
  )

  const formattedConsumptionValue = formatNumber(consumptionValue?.value, {
    maximumFractionDigits: 3,
    minimumFractionDigits: consumptionValue?.value ? 3 : 0,
  })

  return (
    <LabeledCardWrapper label="Miner Metrics" noMargin relative>
      {efficiencyValue &&
        efficiencyValue.value !== undefined &&
        _isNumber(efficiencyValue.value) && (
          <FixedItem $indent>
            <ItemLabel>{labels.efficiency}</ItemLabel>
            <ItemValue>{`${formatNumber(efficiencyValue.value)} ${efficiencyValue.unit || ''}`}</ItemValue>
          </FixedItem>
        )}
      <ContentWrapper>
        <Box>
          <Item>
            <ItemLabel>{labels.hashRate}</ItemLabel>
            <ItemValue>
              {hashRateValue ? `${hashRateValue?.value || '-'} ${hashRateValue?.unit}` : '-'}
            </ItemValue>
          </Item>
          <Item>
            <ItemLabel>{labels.temperature}</ItemLabel>
            <ItemValue>{`${temperatureValue?.value || ''} ${
              temperatureValue?.unit || ''
            }`}</ItemValue>
          </Item>
        </Box>
        <Box>
          <Item>
            <ItemLabel>{labels.frequency}</ItemLabel>
            <ItemValue>{`${formattedFrequency || ''} ${frequencyValue?.unit || ''}`}</ItemValue>
          </Item>
          <Item>
            <ItemLabel>{labels.consumption}</ItemLabel>
            <ItemValue>{`${formattedConsumptionValue || ''} ${
              consumptionValue?.value === 0 ? 'kWH' : consumptionValue?.unit || ''
            }`}</ItemValue>
          </Item>
        </Box>
        {showSecondaryStats && (
          <GridBox>
            {_map(secondaryStats, ({ name, value }) => (
              <Item key={name}>
                <ItemLabel>{name}</ItemLabel>
                <ItemValue>{value}</ItemValue>
              </Item>
            ))}
          </GridBox>
        )}
      </ContentWrapper>
    </LabeledCardWrapper>
  )
}

export default MinerMetricCard

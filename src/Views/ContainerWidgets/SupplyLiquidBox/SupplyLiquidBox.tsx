import _map from 'lodash/map'
import { FC } from 'react'

import { SupplyLiquidBoxRoot } from './SupplyLiquidBox.styles'

import SingleStatCard, {
  SingleStatCardProps,
} from '@/Components/Explorer/DetailsView/SingleStatCard/SingleStatCard'

interface SupplyLiquidBoxProps {
  items: SingleStatCardProps[]
}

export const SupplyLiquidBox: FC<SupplyLiquidBoxProps> = ({ items }) => (
  <SupplyLiquidBoxRoot>
    {_map(items, (item) => (
      <SingleStatCard key={`liquid-row-${item.name}`} {...item} variant="secondary" />
    ))}
  </SupplyLiquidBoxRoot>
)

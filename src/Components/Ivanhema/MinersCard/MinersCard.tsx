import _map from 'lodash/map'

import { MINERS_CARD_DATA } from './MinersCard.const'

import DataCard from '@/Components/Ivanhema/DataCard/DataCard'

const minersData = _map(MINERS_CARD_DATA, ({ rack, power_w, unit, children }) => ({
  unit,
  children,
  title: rack,
  power: power_w,
}))

const MinersCard = () => <DataCard data={minersData} columns={4} minWidth={275} />

export default MinersCard

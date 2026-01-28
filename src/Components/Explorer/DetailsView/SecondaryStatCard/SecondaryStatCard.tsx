import { FC } from 'react'

import {
  SecondaryStatCardContainer,
  SecondaryStatCardName,
  SecondaryStatCardValue,
} from './SecondaryStatCard.styles'

interface SecondaryStatCardProps {
  name?: string
  value?: string | number
}

const SecondaryStatCard: FC<SecondaryStatCardProps> = ({ name = '', value = '' }) => (
  <SecondaryStatCardContainer>
    <SecondaryStatCardName>{name}</SecondaryStatCardName>
    <SecondaryStatCardValue>{value}</SecondaryStatCardValue>
  </SecondaryStatCardContainer>
)

export default SecondaryStatCard

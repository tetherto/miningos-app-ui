import { FC } from 'react'

import { BtcAveragePriceWrapper, BtcYtdValue, LabelHeader } from '../Common.style'

import { formatNumber } from '@/app/utils/format'

interface BtcAveragePriceProps {
  price: number
}

export const BtcAveragePrice: FC<BtcAveragePriceProps> = ({ price }) => (
  <BtcAveragePriceWrapper>
    <LabelHeader>BTC Average Price:</LabelHeader>
    <BtcYtdValue>${formatNumber(price, { maximumFractionDigits: 0 })}</BtcYtdValue>
  </BtcAveragePriceWrapper>
)

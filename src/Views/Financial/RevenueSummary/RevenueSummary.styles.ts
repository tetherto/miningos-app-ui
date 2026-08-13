import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

// Import shared styles from FinancialShared
export {
  HeaderButtons,
  HeaderWithToggle,
  PageRoot,
  PageTitle,
  PeriodSelectLabel,
  ResetButton,
  SetCostButton,
} from '../FinancialShared.styles'

export const TotalBitcoinCard = styled.div`
  ${flexColumn};
  padding: 20px;
  background: ${COLOR.BLACK_ALPHA_05};
  gap: 8px;
  margin: 24px 0;
`

export const TotalBitcoinLabel = styled.div`
  font-size: 12px;
  color: ${COLOR.WHITE_ALPHA_05};
  margin-bottom: 4px;
`

export const TotalBitcoinValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  font-family: monospace;
  color: ${COLOR.COLD_ORANGE};
`

export const ChartsContainer = styled.div`
  ${flexColumn};
  gap: 40px;
  margin-top: 24px;
`

export const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 2fr;
  }
`

export const MetricCardsGrid = styled.div<{ $marginTop?: string }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: ${({ $marginTop }) => $marginTop || '0'};

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export const MetricCard = styled.div`
  ${flexColumn};
  padding: 20px;
  background: ${COLOR.BLACK_ALPHA_05};
  gap: 8px;
  min-width: 0;
`

export const MetricLabel = styled.div`
  font-size: 12px;
  color: ${COLOR.WHITE_ALPHA_05};
  margin-bottom: 4px;
`

export const MetricValue = styled.div`
  font-size: 20px;
  font-weight: bold;
  font-family: monospace;
  color: ${COLOR.WHITE};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const ErrorMessage = styled.div`
  padding: 20px;
  background: ${COLOR.DARK_RED};
  border: 1px solid ${COLOR.RED};
  border-radius: 4px;
  color: ${COLOR.RED};
  text-align: center;
`

export const InfoText = styled.div`
  font-size: 14px;
  color: ${COLOR.SLATE_GRAY};
  line-height: 1.5;
  margin: 100px auto;
  width: fit-content;
`

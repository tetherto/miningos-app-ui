import styled from 'styled-components'

import { flexAlign } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const DataCardGrid = styled.div<{ $columns: number; $minWidth: number; $padding: number }>`
  display: grid;
  grid-template-columns: repeat(
    ${({ $columns }) => $columns},
    minmax(${({ $minWidth }) => $minWidth}px, 1fr)
  );
  gap: 16px;
  padding: ${({ $padding }) => $padding}px;
`

export const Card = styled.div`
  border: 1px solid ${COLOR.COLD_ORANGE_ALPHA_04};
`

export const CardHeader = styled.div`
  ${flexAlign};
  padding: 12px 16px;
  background: ${COLOR.BLACK};
  justify-content: space-between;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const CardTitle = styled.span<{ $highlight?: boolean }>`
  font-size: 13px;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.3px;
  color: ${COLOR.WHITE};
`

export const CardPowerValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

export const CardPower = styled.p`
  font-size: 13px;
  font-weight: 700;
  line-height: normal;
  color: ${COLOR.COLD_ORANGE};
`

export const CardPowerUnit = styled.span`
  font-size: 11px;
  font-weight: 400;
  line-height: normal;
  color: ${COLOR.SOFT_AMBER};
`

export const CardBody = styled.div``

export const CardRow = styled.div`
  ${flexAlign};
  padding: 12px 16px;
  justify-content: space-between;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};

  &:last-child {
    border-bottom: none;
  }
`

export const CardLabel = styled.span`
  font-size: 12px;
  font-weight: 400;
  line-height: normal;
  color: ${COLOR.WHITE_ALPHA_07};
`

export const CardValue = styled.span`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

export const CardValueNumber = styled.span`
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  color: ${COLOR.COLD_ORANGE};
`

export const CardValueUnit = styled.span`
  font-size: 11px;
  font-weight: 400;
  line-height: normal;
  color: ${COLOR.WHITE_ALPHA_07};
`

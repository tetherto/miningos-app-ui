import styled from 'styled-components'

interface StyledProps {
  $colour?: string
  $area?: string
  $gap?: string | number
  $off?: boolean
  $warn?: boolean
}

import { alignCenter, flexAlign, flexCenter, flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const StatBoxContainer = styled.div<StyledProps>`
  background: ${COLOR.BLACK};
  padding: 4px 8px;
  border: 1px solid ${(props) => props.$colour || COLOR.DARKER_GREY};
  justify-content: center;
  white-space: nowrap;
  width: fit-content;
  box-sizing: border-box;
  ${flexColumn};
  max-width: 365px;
  cursor: default;

  @media (min-width: 768px) {
    width: auto;
    max-width: unset;
  }
`

export const AlertsBoxContainer = styled(StatBoxContainer)<StyledProps>`
  padding: 0;
  border: unset;
  background: transparent;

  a {
    text-decoration: none;
  }
`

export const HashrateStatBox = styled(StatBoxContainer)<StyledProps>`
  display: grid;
  grid-template-columns: 24px repeat(4, auto);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'icon title title title title'
    'icon webapphash webappunit poolhash poolunit'
    'icon webapplabel . poollabel .';
  column-gap: 5px;
  align-items: center;
`

export const TopRow = styled.div<StyledProps>`
  ${flexRow};
  ${alignCenter}
`

export const BottomRow = styled.div<StyledProps>`
  ${flexColumn};
`

export const IconColumn = styled.div<StyledProps>`
  color: ${(props) => props.$colour || COLOR.WHITE};
  display: flex;
  grid-area: icon;
  margin-right: 8px;
  align-self: flex-start;
`

export const DataColumn = styled.div<StyledProps>`
  color: ${(props) => props.$colour || COLOR.WHITE};
  flex-grow: 1;
  min-width: 25px;
  ${flexColumn};
  align-items: flex-start;
  grid-area: ${(props) => props.$area};
  gap: ${(props) => (props.$gap ? '8px' : '0')};
`

export const StatusColumn = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  row-gap: 6px;
  margin: 0 5px;
  text-align: center;
  ${flexColumn};
  ${alignCenter}
`

export const StatusRow = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  column-gap: 6px;
  ${flexRow};
  width: 100%;
  justify-content: space-between;
`

export const StatusValue = styled.div<StyledProps>`
  color: ${COLOR.LIGHT};
  font-size: 12px;
  font-weight: 400;
  flex-grow: 1;
`

export const StatusLabel = styled.div<StyledProps>`
  ${flexCenter};
  color: ${COLOR.WHITE};
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  height: 14px;
  width: 30px;
  border-radius: 3px;
  background-color: ${(props) => (props.$off ? COLOR.BRICK_RED : COLOR.GRASS_GREEN)};
  flex-grow: 0;
`

export const Title = styled.div<StyledProps>`
  ${flexAlign};
  gap: 4px;
  font-size: 15px;
  grid-area: title;
  font-weight: 400;
  justify-content: space-between;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const SubTitle = styled(Title)<StyledProps>`
  font-size: 10px;
  font-weight: 400;
  grid-area: ${(props) => props.$area};
`

export const Tag = styled(StatusLabel)<StyledProps>`
  background-color: ${COLOR.BLUE};
  text-transform: none;
  font-size: 10px;
`

export const Value = styled.div<StyledProps>`
  font-size: 16px;
  font-weight: 700;
  color: ${COLOR.WHITE};
  grid-area: ${(props) => props.$area};
  ${(props) =>
    props.$warn
      ? `
    animation: warnBlink 0.25s cubic-bezier(0.7, 0, 1, 1) infinite alternate;
    color: ${COLOR.RED};
  `
      : ''};

  @keyframes warnBlink {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`

export const Suffix = styled.span<StyledProps>`
  font-size: 13px;
  font-weight: 400;
  color: ${(props) => props.$colour || COLOR.WHITE};
`

export const TemperatureRowContainer = styled.div<StyledProps>`
  font-size: 13px;
  font-weight: 400;
  color: ${COLOR.GREY};
  ${flexRow};
`

export const TemperatureItem = styled.div<StyledProps>`
  font-size: 13px;
  font-weight: 400;
  color: ${COLOR.LIGHT};
  flex-basis: 50%;
  justify-content: flex-end;
  align-items: center;
  column-gap: 8px;
  ${flexRow};
`

export const TemperatureLabel = styled.div<StyledProps>`
  font-size: 9px;
  font-weight: 400;
`

export const TemperatureValue = styled.div<StyledProps>`
  font-size: 16px;
  font-weight: 700;
`

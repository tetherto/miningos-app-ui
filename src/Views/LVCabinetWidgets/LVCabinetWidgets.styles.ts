import { styled } from 'styled-components'

import { WidgetBox } from '../../Components/Widgets/WidgetBox.styles'
import { ContainerWidgetsRoot } from '../ContainerWidgets/ContainerWidgets.styles'

import { flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const LvCabinetWidgetWrapper = styled.div<{ $span: number }>`
  width: 100%;
  height: auto;
  box-sizing: border-box;
  align-self: start;
  grid-row-end: span ${({ $span }) => $span || 1};

  a {
    text-decoration: none;
  }
`

export const LVCabinetWidgetBox = styled(WidgetBox)`
  min-width: 300px;
  padding-top: 12px;
`

export const LVCabinetWidgetBoxInnerContainer = styled.div`
  padding: 10px 12px;
`

export const LVWidgetCardDataRow = styled.div`
  padding: 5px;
  border: 1px solid ${COLOR.COLD_ORANGE};
  margin-bottom: 3px;
  color: ${COLOR.COLD_ORANGE};
  ${flexColumn};
`

export const WidgetCardDataRowValueText = styled.span<{ $color: string }>`
  font-weight: 600;
  color: ${({ $color }) => $color};
`

export const WidgetCardDataRowUnitText = styled.span`
  font-size: 12px;
  color: ${COLOR.DARK_GREY};
`

export const LvCabinetsRoot = styled.div`
  padding: 20px;
  box-sizing: border-box;
`

export const LvCabinetsWrapper = styled(ContainerWidgetsRoot)`
  gap: 15px;
  padding: 0 !important;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 75px;
  grid-auto-rows: auto;
  grid-auto-flow: dense;

  & > * {
    width: 100%;
    height: auto;
  }
`

export const Centered = styled.div`
  display: grid;
  place-items: center;
  min-height: 200px;
`

export const Section = styled.div`
  padding: 12px 16px;
`

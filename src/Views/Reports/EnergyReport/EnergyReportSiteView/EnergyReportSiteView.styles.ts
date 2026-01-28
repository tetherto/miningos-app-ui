import Tooltip from 'antd/es/tooltip'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const EnergyReportSiteViewContainer = styled.div`
  ${flexColumn};
  gap: 32px;
`

export const ReportSection = styled.div`
  ${flexColumn};
  gap: 24px;
`

export const PowerChartSection = styled.div`
  ${flexColumn};
  background: rgba(0, 0, 0, 0.5);
  padding: 26px 24px;
  border-radius: 8px;
  min-height: 400px;
`

export const SectionHeader = styled.div`
  font-size: 20px;
  font-weight: 400;
  line-height: 28px;
  padding-left: 12px;
  letter-spacing: 0%;
`

export const SectionHeaderWithButton = styled.div`
  ${flexRow};
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

export const RefreshButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`

export const ColumnHeader = styled.div`
  padding: 0px 10px;
`

export const MiningUnitCards = styled.div`
  ${flexRow};
  gap: 24px;
  flex-wrap: wrap;
`

export const MiningUnitCard = styled.div`
  padding: 25px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  height: 138px;
  width: 370px;
  ${flexColumn};
  gap: 16px;
`

export const MiningUnitCardTitle = styled.div`
  font-weight: 400;
  font-size: 18px;
  line-height: 100%;
  text-transform: uppercase;
`

export const MiningUnitCardHeader = styled.div`
  ${flexColumn};
  gap: 10px;
`

export const MiningUnitCardSubTitle = styled.div`
  font-size: 14px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const MinerRowHeader = styled.div`
  ${flexColumn};
  gap: 8px;
`

export const MinerRowHeaderTitle = styled.div`
  font-size: 14px;
`

export const MinerRowHeaderSubTitle = styled.div`
  ${flexRow};
  gap: 4px;
  font-size: 12px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const TooltipTriggerSpan = styled.span`
  cursor: help;
  text-decoration: underline;
  text-decoration-style: dotted;
  position: relative;
  z-index: 1;
`

export const StyledTooltip = styled(Tooltip).attrs(() => ({
  styles: { root: { maxWidth: '350px', zIndex: 10001 } },
}))``

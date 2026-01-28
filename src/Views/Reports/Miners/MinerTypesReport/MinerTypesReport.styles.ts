import styled from 'styled-components'

import { flexColumn, flexRow, flexCenterRow } from '@/app/mixins'
import {
  DoughnutChartCardContainer,
  DoughnutChartInfoCardContainer,
  LegendLabelsContainer,
  LegendValueWrapper,
} from '@/Components/DoughnutChartCard/DoughnutChartCard.styles'
import { LegendLabelText } from '@/Components/LineChartCard/LineChartCard.styles'
import { COLOR } from '@/constants/colors'

export const MinerTypesReportWrapper = styled.div`
  ${flexColumn};
  gap: 24px;
`

export const MinersStatusChartCardContainer = styled.div`
  ${flexColumn};
  background: rgba(0, 0, 0, 0.5);
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
`

export const MinersStatusChartCardHeader = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

export const MinersStatusChartCardTitle = styled.h3`
  color: ${COLOR.WHITE};
  font-size: 20px;
  font-weight: 400;
  margin: 0;
`

export const MinersStatusChartCardContent = styled.div`
  ${flexColumn};
  flex: 1;
  min-height: 300px;
  max-height: 350px;
`

export const MinersStatusChartNoData = styled.div`
  ${flexCenterRow};
  padding: 40px 0;
  min-height: 300px;
  color: ${COLOR.LIGHT};
  font-size: 14px;
`

export const MinersStatusChartError = styled.div`
  ${flexCenterRow};
  padding: 40px 0;
  color: ${COLOR.RED};
  text-align: center;
`

export const MinerTypesReportContent = styled.div`
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const MinerStatusFilters = styled.div`
  ${flexRow};
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const MinerTypeReportBody = styled.div`
  padding: 16px;
  ${flexColumn};
`

export const MinerTypeStats = styled.div`
  flex: 1;
`

export const DoughnutChartCardWrapper = styled.div`
  display: grid;
  padding: 30px;
  gap: 40px;
  grid-template-columns: 1fr;
  max-width: 900px;

  ${DoughnutChartCardContainer} {
    @media (min-width: 1440px) {
      flex-direction: row;
      align-items: unset;
      justify-content: space-between;
    }
  }

  ${DoughnutChartInfoCardContainer} {
    max-width: 360px;
  }

  ${LegendLabelsContainer} {
    flex-direction: column;
    gap: 24px;
  }

  ${LegendValueWrapper} {
    flex-direction: row-reverse;
    gap: 12px;
  }

  ${LegendLabelText} {
    &:last-child {
      margin-top: 0;
    }
  }

  @media (min-width: 768px) {
    gap: 60px;
    grid-template-columns: repeat(auto-fit, minmax(572px, 1fr));
  }
`

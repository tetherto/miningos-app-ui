import styled from 'styled-components'

import { commonTextStyles, flexColumn } from '../../../app/mixins'

import {
  DoughnutChartCardContainer,
  LegendLabelsContainer,
} from '@/Components/DoughnutChartCard/DoughnutChartCard.styles'
import { COLOR } from '@/constants/colors'

export const InventoryDashboardContentRoot = styled.div`
  ${flexColumn};
  border: 1px solid ${COLOR.COLD_ORANGE};
  background-color: ${COLOR.BLACK};
  overflow: hidden;
`

export const TableSectionContent = styled.div`
  ${flexColumn};
  gap: 25px;

  @media (min-width: 768px) {
    padding: 20px;
  }
`

export const TableWrapper = styled.div`
  ${flexColumn};
  gap: 10px;
`

export const TableTitle = styled.div`
  ${commonTextStyles};
  font-size: 16px;
  text-indent: 10px;
`

export const DoughnutChartCardWrapper = styled.div`
  display: grid;
  padding: 30px;
  gap: 40px;
  grid-template-columns: 1fr;

  ${DoughnutChartCardContainer} {
    @media (min-width: 1440px) {
      flex-direction: row;
      align-items: unset;
    }
  }
  ${LegendLabelsContainer} {
    flex-direction: column;
  }

  @media (min-width: 768px) {
    gap: 60px;
    grid-template-columns: repeat(auto-fit, minmax(572px, 1fr));
  }
`

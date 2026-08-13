import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../../app/mixins'
import { COLOR, HEATMAP } from '../../../../constants/colors'

export const HeatMapLegendRoot = styled.div`
  ${flexColumn};
  row-gap: 10px;
  padding: 20px;
  margin: 20px 24px;
  background-color: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};

  h4 {
    margin: 0 0 5px 0;
    font-weight: normal;
  }
`

export const HeatStatusBar = styled.div`
  border-radius: 30px;
  height: 7px;
  width: 100%;
  background: linear-gradient(
    270deg,
    ${HEATMAP.HIGH} 0%,
    ${HEATMAP.HIGH_MEDIUM} 35%,
    ${HEATMAP.LOW_MEDIUM} 70%,
    ${HEATMAP.LOW} 100%
  );
  box-shadow: 0 8px 20px 0 rgba(175, 175, 175, 0.4);
`

export const Legend = styled.div`
  ${flexRow};
  justify-content: space-between;
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: 120.4%;
  margin-top: 5px;
`

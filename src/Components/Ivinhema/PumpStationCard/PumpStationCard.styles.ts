import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const PumpStationLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  position: relative;
  line-height: normal;
  letter-spacing: 1px;
  padding-bottom: 10px;
  text-transform: uppercase;
  color: ${COLOR.WHITE_ALPHA_05};

  &:before {
    content: '';
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    position: absolute;
    background-color: ${COLOR.WHITE_ALPHA_01};
  }
`

export const PumpStationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 16px;
`

export const PumpStationBody = styled.div`
  ${flexColumn};
  gap: 2px;
  margin-top: 6px;
`

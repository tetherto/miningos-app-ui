import styled from 'styled-components'

import { flexCenterColumn } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const PieSectionWrapper = styled.div`
  ${flexCenterColumn};
  padding: 20px;
  align-items: center;
  gap: 20px;

  @media (min-width: 1240px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 400px);
    gap: 30px;
  }
`

export const Overview = styled.div`
  cursor: pointer;
  ${flexCenterColumn};
  background-color: ${COLOR.COLD_ORANGE};
  color: ${COLOR.WHITE};
  padding: 8px 12px;
  border-radius: 10px;
  width: 150px;

  @media (min-width: 1240px) {
    align-self: flex-start;
  }
`

export const ChartWrapper = styled.div`
  min-height: 400px;
  width: 100%;
`

export const Article = styled.div`
  ${flexCenterColumn};
  gap: 10px;
  width: 100%;

  @media (min-width: 1240px) {
    align-items: center;
    justify-content: center;
  }
`

import styled from 'styled-components'

import { flexCenterRow, flexColumn, flexRow } from '../../../../app/mixins'

import { CardContainer } from '@/Components/Card/Card.styles'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'
import { COLOR } from '@/constants/colors'

export const HomeTabContainer = styled.div`
  ${flexCenterRow};
  align-items: flex-start;
  row-gap: 16px;
  column-gap: 16px;

  @media (max-width: 1600px) {
    flex-direction: column;
  }
`

export const LeftColumn = styled.div`
  ${flexRow};
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
`

export const PrimaryContainerDataWrapper = styled.div`
  flex: 1;
  max-width: 100%;
`

export const RightColumn = styled(ContainerPanel)`
  ${flexColumn};
  row-gap: 12px;
  flex: 0 1 700px;
  overflow: visible;
  flex-wrap: nowrap;
`

export const BoxRow = styled.div`
  ${flexRow};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

export const AlarmContentContainer = styled.div`
  max-height: 250px;
  overflow-x: hidden;
`

export const AlarmList = styled.div`
  ${flexColumn};
  max-height: 250px;
  overflow-y: auto;
`

export const AlarmBody = styled.div`
  font-size: 12px;
  color: ${COLOR.WHITE_ALPHA_04};
`

export const AlarmTitleRow = styled.div`
  ${flexRow};
  align-items: center;
  gap: 8px;
`

export const AlarmTitle = styled.div`
  font-size: 16px;
  line-height: 16px;
  word-break: break-word;
`

export const AlarmSubTitle = styled.div`
  font-size: 14px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const AlarmDotIcon = styled.div<{ $color?: string }>`
  background-color: ${({ $color }) => $color ?? COLOR.WHITE};
  border-radius: 50%;
  width: 10px;
  height: 10px;
`

export const AlarmContainer = styled.div`
  ${flexColumn};
  gap: 8px;
  padding: 10px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  cursor: pointer;
`

export const AlarmRowWrapper = styled.div<{ $color?: string }>`
  box-sizing: border-box;
  padding-right: 8px;

  &:not(:last-child) {
    padding-bottom: 8px;
  }

  & ${AlarmTitle} {
    color: ${({ $color }) => $color ?? COLOR.WHITE};
  }

  & ${AlarmContainer} {
    background-color: ${({ $color }) => ($color ? `${$color}1A` : 'none')};
    border-color: ${({ $color }) => ($color ? `${$color}33` : COLOR.WHITE)};
  }
`

export const StatDataWrapper = styled.div`
  ${flexRow};
  flex-wrap: wrap;
  align-items: stretch;
  align-content: flex-start;
  flex: 1 1 60%;

  & > ${CardContainer} {
    flex: 1 0 auto;
  }

  @media (max-width: 1200px) {
    gap: 10px;
    & > ${CardContainer} {
      margin: 0;
      flex: 1 1 auto;
    }
  }
`

export const HomeTabStatDataWrapper = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(1fr);

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 2fr;
  }
`

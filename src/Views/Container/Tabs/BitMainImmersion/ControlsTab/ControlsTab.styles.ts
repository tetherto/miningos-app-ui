import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const ControlsTabContainer = styled.div`
  ${flexColumn};
  gap: 5px;
`

export const ControlBoxesRow = styled.div`
  ${flexRow};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

export const ControlsBoxInnerContainer = styled.div`
  padding: 16px;
`

export const SectionContainer = styled.div`
  ${flexColumn};
  padding: 10px;
  gap: 30px 10px;
  width: 100%;
`

export const SectionTitle = styled.div`
  color: ${COLOR.LIGHT};
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  margin-bottom: 10px;
`

export const ControlBoxesContainer = styled.div<{ $expand: boolean }>`
  ${flexRow};
  flex-wrap: wrap;
  gap: 8px;

  ${({ $expand }) =>
    $expand
      ? `
  & > * {
    flex: 1;
  }
  `
      : ''}
`

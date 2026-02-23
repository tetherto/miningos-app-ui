import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../app/mixins'
import { COLOR } from '../../../constants/colors'

export const HeaderControlsContainer = styled.div`
  ${flexColumn};
  gap: 24px;
  padding: 10px 0;
`

export const Description = styled.p`
  color: ${COLOR.WHITE_ALPHA_07};
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`

export const ControlsTable = styled.div`
  ${flexColumn};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-radius: 4px;
  overflow: hidden;
`

export const TableHeader = styled.div`
  ${flexRow};
  background-color: ${COLOR.DARK_ORANGE_BG};
  padding: 12px 16px;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const HeaderColumn = styled.div<{ $width?: string }>`
  flex: ${({ $width }) => $width || '1'};
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.WHITE_ALPHA_07};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const TableRow = styled.div`
  ${flexRow};
  padding: 16px;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${COLOR.BLACK_ALPHA_05};
  }
`

export const RowColumn = styled.div<{ $width?: string }>`
  flex: ${({ $width }) => $width || '1'};
  font-size: 16px;
  color: ${COLOR.WHITE};
`

export const ToggleColumn = styled(RowColumn)`
  display: flex;
  justify-content: flex-start;
  padding-left: 40px;
`

export const ActionsRow = styled.div`
  ${flexRow};
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`

import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../app/mixins'
import { COLOR } from '../../../constants/colors'

export const RBACContainer = styled.div`
  ${flexColumn};
  gap: 24px;
  padding: 10px 0;

  @media (max-width: 768px) {
    gap: 16px;
  }
`

export const Description = styled.p`
  color: ${COLOR.WHITE_ALPHA_07};
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`

export const ActionsRow = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

export const SearchContainer = styled.div`
  width: 256px;

  @media (max-width: 768px) {
    width: 100%;
  }
`

export const Table = styled.div`
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-radius: 4px;
  overflow: hidden;
  width: 100%;

  @media (max-width: 768px) {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`

export const TableHeader = styled.div`
  background-color: ${COLOR.DARK_ORANGE_BG};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const TableHeaderRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(80px, 1fr) minmax(150px, 2.2fr) minmax(100px, 1.2fr) minmax(100px, 1fr)
    minmax(100px, 1fr) minmax(70px, 0.8fr);
  padding: 12px 16px;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 12px 12px;
    gap: 6px;
    grid-template-columns:
      minmax(60px, 1fr) minmax(120px, 2fr) minmax(80px, 1.2fr) minmax(80px, 1fr)
      minmax(80px, 1fr) minmax(60px, 0.8fr);
  }
`

export const TableHeaderCell = styled.div<{ $width?: string; $align?: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${COLOR.WHITE_ALPHA_05};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: ${({ $align }) => $align || 'left'};
`

export const TableBody = styled.div`
  ${flexColumn};
`

export const TableRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(80px, 1fr) minmax(150px, 2.2fr) minmax(100px, 1.2fr) minmax(100px, 1fr)
    minmax(100px, 1fr) minmax(70px, 0.8fr);
  padding: 18px 16px;
  align-items: center;
  gap: 8px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};

  &:first-child {
    border-top: none;
  }

  &:hover {
    background-color: ${COLOR.BLACK_ALPHA_05};
  }

  @media (max-width: 768px) {
    padding: 16px 12px;
    gap: 6px;
    grid-template-columns:
      minmax(60px, 1fr) minmax(120px, 2fr) minmax(80px, 1.2fr) minmax(80px, 1fr)
      minmax(80px, 1fr) minmax(60px, 0.8fr);
  }
`

export const TableCell = styled.div<{ $width?: string; $align?: string; $noOverflow?: boolean }>`
  font-size: 14px;
  color: ${COLOR.WHITE_ALPHA_07};
  text-align: ${({ $align }) => $align || 'left'};
  overflow: ${({ $noOverflow }) => ($noOverflow ? 'visible' : 'hidden')};
  text-overflow: ${({ $noOverflow }) => ($noOverflow ? 'clip' : 'ellipsis')};
  white-space: nowrap;
  min-width: 0;

  ${({ $noOverflow }) =>
    $noOverflow &&
    `
    flex-shrink: 0;
  `}

  @media (max-width: 768px) {
    font-size: 13px;
  }
`

export const RoleBadge = styled.span<{ $color: string; $bgColor: string }>`
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  color: ${({ $color }) => $color};
  background-color: ${({ $bgColor }) => $bgColor};
  border-radius: 2px;
  font-weight: 400;

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
  }
`

export const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`

export const ManageButton = styled(ActionButton)`
  color: ${COLOR.COLD_ORANGE};
`

export const DeleteButton = styled(ActionButton)`
  color: ${COLOR.RED};
  flex-shrink: 0;
`

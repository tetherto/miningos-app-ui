import _join from 'lodash/join'
import _map from 'lodash/map'
import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'

interface MosaicGridProps {
  $columns?: string
  $colsCount?: number
  $rowHeight?: string
  $gap?: string
  $areas?: string[][]
}

interface MosaicItemProps {
  $area?: string
  area?: string
}

export const MosaicGrid = styled.div<MosaicGridProps>`
  ${flexColumn};
  gap: 16px;

  @media (min-width: 1640px) {
    display: grid;
    grid-template-columns: ${({ $columns, $colsCount }) =>
      $columns ? $columns : `repeat(${$colsCount || 1}, minmax(0, 1fr))`};
    grid-auto-rows: ${({ $rowHeight }) => $rowHeight || 'auto'};
    gap: ${({ $gap }) => $gap || '16px'};
    grid-template-areas: ${({ $areas }) =>
      $areas
        ? _join(
            _map($areas, (r) => `"${_join(r as string[], ' ')}"`),
            '\n',
          )
        : 'none'};
  }
`

export const MosaicItem = styled.div<MosaicItemProps>`
  grid-area: ${({ $area }) => $area || 'auto'};
  min-width: 0;
  min-height: 0;
`

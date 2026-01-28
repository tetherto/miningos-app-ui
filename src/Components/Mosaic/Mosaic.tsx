import _isArray from 'lodash/isArray'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _split from 'lodash/split'
import _trim from 'lodash/trim'
import React from 'react'

import { MosaicGrid, MosaicItem } from './Mosaic.style'

interface MosaicItemComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  area?: string
  $area?: string
  children?: React.ReactNode
}

interface MosaicProps {
  template: string[] | string[][]
  gap?: string
  rowHeight?: string
  columns?: string | string[]
  children: React.ReactNode
}

export function Mosaic({
  template,
  gap = '12px',
  rowHeight = 'auto',
  columns,
  children,
}: MosaicProps) {
  // Normalize template into 2D array
  const rows = _isArray(template[0])
    ? template
    : _map(template, (r: unknown) => _split(_trim(r as string), /\s+/))

  const colsCount = rows[0]?.length || 1

  // Normalize columns → string
  const columnsStr = _isArray(columns) ? _join(columns, ' ') : columns || null

  if (process.env.NODE_ENV !== 'production') {
    if (columnsStr && _split(columnsStr, /\s+/).length !== colsCount) {
      // Warning: columns tracks != template column count
    }
  }

  // Ensure valid CSS grid-area names
  const fix = (name: unknown) => {
    if (name === '.') return '.'
    const str = String(name)
    if (/^[0-9]/.test(str)) return `a${str}`
    return str
  }

  // Normalized template with safe names
  const normalized = _map(rows, (r: unknown) => _map(r as string[], (cell: unknown) => fix(cell)))

  // Patch children with $area prop
  const patchedChildren = _map(React.Children.toArray(children), (child: unknown) => {
    if (!React.isValidElement(child)) return child
    const area = (child.props as { area?: string }).area
    const $area = area ? fix(area) : undefined
    return React.cloneElement(child as React.ReactElement, { $area } as Record<string, unknown>)
  })

  return (
    <MosaicGrid
      $colsCount={colsCount}
      $columns={columnsStr ?? undefined}
      $gap={gap}
      $rowHeight={rowHeight}
      $areas={normalized as string[][] | undefined}
    >
      {patchedChildren as React.ReactNode}
    </MosaicGrid>
  )
}

const MosaicItemComponent = React.forwardRef<HTMLDivElement, MosaicItemComponentProps>(
  ({ area, $area, ...props }, ref) => (
    // Prefer $area if provided (from Mosaic patching), otherwise use area
    <MosaicItem ref={ref} $area={$area ?? area} {...props} />
  ),
)

MosaicItemComponent.displayName = 'Mosaic.Item'

Mosaic.Item = MosaicItemComponent

import Table from 'antd/es/table'
import type { TableProps } from 'antd/es/table'
import _isNil from 'lodash/isNil'
import type React from 'react'

import { StyledTable } from './AppTable.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

type AnyRecord = UnknownRecord

interface StyledProps {
  $isEmpty?: boolean
  $fullSize?: boolean
}

interface AppTableComponent {
  <T extends AnyRecord = AnyRecord>(props: TableProps<T> & StyledProps): React.ReactElement
  Summary: typeof Table.Summary
}

/**
 * Default rowKey function that tries common key fields.
 * This prevents React "Each child in a list should have a unique key" warnings.
 * Note: We avoid using the deprecated `index` parameter.
 */
const defaultRowKey = <T extends AnyRecord>(record: T): string => {
  // Handle null/undefined records (e.g., placeholder rows for "Add Item" buttons)
  if (_isNil(record)) return '__placeholder_row__'
  // Try common key field names
  if (!_isNil(record.key)) return String(record.key)
  if (!_isNil(record.id)) return String(record.id)
  if (!_isNil(record.uuid)) return String(record.uuid)
  if (!_isNil(record._id)) return String(record._id)
  // Fallback: generate a key from stringified record (first few fields)
  // This is a last resort - ideally data should have a unique identifier
  try {
    return JSON.stringify(record).slice(0, 100)
  } catch {
    return String(Math.random())
  }
}

function AppTable<T extends AnyRecord = AnyRecord>(
  props: TableProps<T> & StyledProps,
): React.ReactElement {
  // StyledTable is a styled component of Table, which accepts TableProps<T>
  // Cast to the expected component type to satisfy TypeScript constraints
  const StyledTableTyped = StyledTable as React.ComponentType<TableProps<T> & StyledProps>
  return <StyledTableTyped rowKey={props.rowKey ?? defaultRowKey} {...props} />
}

AppTable.Summary = Table.Summary

export default AppTable as AppTableComponent

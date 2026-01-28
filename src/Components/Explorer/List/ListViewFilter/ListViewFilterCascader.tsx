import Cascader from 'antd/es/cascader'
import _compact from 'lodash/compact'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _toString from 'lodash/toString'
import { useState } from 'react'

import { StyledCascader } from './ListViewFilter.styles'
import type {
  CascaderOption,
  FilterSelection,
  FilterSelectionTuple,
  FilterSelectionValue,
} from './ListViewFilter.types'

interface ListViewFilterCascaderProps {
  options: CascaderOption[]
  value: FilterSelection[]
  onChange: (selections: FilterSelectionTuple[]) => void
}

const ListViewFilterCascader = ({ options, onChange, value }: ListViewFilterCascaderProps) => {
  const [open, setOpen] = useState(true)

  const handleChange = (
    selectedValues: (string | number | null)[] | (string | number | null)[][] | null,
  ) => {
    if (!selectedValues) {
      onChange([])
      return
    }
    const valuesArray = Array.isArray(selectedValues[0])
      ? (selectedValues as (FilterSelectionValue | null)[][])
      : [selectedValues as (FilterSelectionValue | null)[]]
    const filterSelections: FilterSelectionTuple[] = _compact(
      _map(valuesArray, (val) => {
        if (_isArray(val) && _size(val) >= 2) {
          return _map(val, (v) => {
            if (_isNil(v)) return ''
            return _isBoolean(v) ? v : _toString(v)
          }) as FilterSelectionTuple
        }
        return null
      }),
    )
    onChange(filterSelections)
  }

  return (
    <StyledCascader
      options={options as unknown as import('antd/es/cascader').CascaderProps['options']}
      onChange={handleChange}
      showSearch
      multiple
      open={open}
      onOpenChange={setOpen}
      value={value as (string | number | null)[][] | undefined}
      showCheckedStrategy={Cascader.SHOW_CHILD}
      placement="bottomLeft"
      popupClassName="list-view-filter-cascader-popup"
    />
  )
}

export default ListViewFilterCascader

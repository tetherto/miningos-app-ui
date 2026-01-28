import { FilterOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Popover from 'antd/es/popover'
import _compact from 'lodash/compact'
import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'
import _toString from 'lodash/toString'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { SEVERITY_KEY } from '../../../../constants/alerts'

import {
  DropdownContainer,
  DropdownTitle,
  ListViewFilterButtonContainer,
  ListViewFiltersIconLengthContainer,
  PopoverTriggerWrapper,
} from './ListViewFilter.styles'
import type { CascaderOption, FilterSelection, FilterSelectionTuple } from './ListViewFilter.types'
import { findValuePath } from './ListViewFilter.util'
import ListViewFilterCascader from './ListViewFilterCascader'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface ListViewFilterProps {
  options: CascaderOption[]
  localFilters?: UnknownRecord
  onChange: (selections: FilterSelectionTuple[]) => void
}

const ListViewFilter = ({ options, onChange, localFilters }: ListViewFilterProps) => {
  const [open, setOpen] = useState(false)
  const [filtersLength, setFiltersLength] = useState(0)
  const [cascaderKey, setCascaderKey] = useState(0)
  const [params] = useSearchParams()

  const filterKey = params.get(SEVERITY_KEY)

  const onFiltersChange = (e: FilterSelectionTuple[]) => {
    onChange(e)
    setFiltersLength(e?.length)
  }

  const handleOpenChange = (newOpen: unknown) => {
    const isOpen = _isBoolean(newOpen) ? newOpen : false
    setOpen(isOpen)
    // Reset cascader state when popover opens to ensure fresh interaction
    if (isOpen) {
      setCascaderKey((prevCascaderKey) => prevCascaderKey + 1)
    }
  }

  const values: FilterSelection[] =
    localFilters && _isObject(localFilters)
      ? _compact(
          _flatMap(_toPairs(localFilters), ([key, vals]) => {
            const optionGroup = _find(options, { value: key })

            if (!optionGroup) return []

            if (_isArray(vals)) {
              return _compact(
                _map(vals, (val) => {
                  const value = _isBoolean(val) ? val : _toString(val)
                  const path = findValuePath(optionGroup.children || [], value)
                  if (path) {
                    return [key, ...path]
                  }
                  return [key, value]
                }),
              )
            }

            const value = _isBoolean(vals) ? vals : _toString(vals)
            const path = findValuePath(optionGroup.children || [], value)

            if (path) {
              return [[key, ...path]]
            }

            return [[key, value]]
          }),
        )
      : []

  return (
    <ListViewFilterButtonContainer>
      <Popover
        content={
          <DropdownContainer>
            <DropdownTitle>Filters</DropdownTitle>
            <ListViewFilterCascader
              key={`${filterKey}-${cascaderKey}`}
              options={options}
              onChange={onFiltersChange}
              value={values}
            />
          </DropdownContainer>
        }
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottomLeft"
        styles={{ body: { padding: 0 } }}
        autoAdjustOverflow={false}
        rootClassName="list-view-filter-popover"
      >
        <PopoverTriggerWrapper>
          {filtersLength > 0 && (
            <ListViewFiltersIconLengthContainer>{filtersLength}</ListViewFiltersIconLengthContainer>
          )}
          <Button>
            <FilterOutlined />
            Filter
          </Button>
        </PopoverTriggerWrapper>
      </Popover>
    </ListViewFilterButtonContainer>
  )
}

export default ListViewFilter

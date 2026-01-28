import AutoComplete from 'antd/es/auto-complete'
import Input from 'antd/es/input'
import Tag from 'antd/es/tag'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import _toLower from 'lodash/toLower'
import { FC, useState } from 'react'

import { SearchAndFilterContainer } from './SearchAndFilter.styles'

const SearchAndFilter: FC = () => {
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [options, setOptions] = useState<string[]>([])

  const handleSearch = (value: string) => {
    setSearchValue(value)

    const mockDataSource = ['On', 'Off', 'Alert', 'Date', 'Whatsminer']
    const filteredOptions = _filter(mockDataSource, (item: string) =>
      _includes(_toLower(item), _toLower(value)),
    )

    setOptions(filteredOptions)
  }

  const handleSelect = (value: string) => {
    if (!_includes(selectedItems, value)) {
      setSelectedItems([...selectedItems, value])
      setSearchValue('')
    }
  }

  const handleChipClose = (itemToRemove: string) => {
    const updatedItems = _filter(selectedItems, (item: string) => item !== itemToRemove)
    setSelectedItems(updatedItems)
  }

  return (
    <SearchAndFilterContainer>
      {_map(selectedItems, (item: string) => (
        <Tag key={item} closable onClose={() => handleChipClose(item)}>
          {item}
        </Tag>
      ))}
      <AutoComplete
        value={searchValue}
        options={_map(options, (option: string) => ({ value: option }))}
        onSelect={handleSelect}
        onSearch={handleSearch}
      >
        <Input placeholder="Search & Filter" />
      </AutoComplete>
    </SearchAndFilterContainer>
  )
}

export default SearchAndFilter

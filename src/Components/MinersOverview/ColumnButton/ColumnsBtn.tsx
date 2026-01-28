import { RightOutlined } from '@ant-design/icons'
import Checkbox from 'antd/es/checkbox'
import Dropdown from 'antd/es/dropdown'
import Input from 'antd/es/input'
import Menu from 'antd/es/menu'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import _some from 'lodash/some'
import _toLower from 'lodash/toLower'
import { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { minersSlice } from '../../../app/slices/minersSlice'
import { getVisibleColumns } from '../../../app/slices/minersSlice'
import { WebappButton } from '../../WebappButton/WebappButton'

import { columnItems } from './ColumnsBtn.data'
import { DropdownItem, Label, SearchWrapper } from './ColumnsBtn.styles'

interface ColumnItem {
  key: string
  label: string
  children?: ColumnItem[]
}

const ColumnsButton = () => {
  const dispatch = useDispatch()
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [filteredItems, setFilteredItems] = useState<ColumnItem[]>(columnItems)
  const visibleColumnItems = useSelector(getVisibleColumns)
  const { toggleTableColumn } = minersSlice.actions

  const handleParentCheckboxChange = (item: ColumnItem) => {
    const isChecked = visibleColumnItems[item.key]
    const itemsToToggle = [
      ...(item.children ? _map(item.children, ({ key }: ColumnItem) => key) : []),
      item.key,
    ]
    dispatch(toggleTableColumn({ columns: itemsToToggle, status: !isChecked }))
  }

  const handleItemChange = (item: ColumnItem, parent?: ColumnItem) => {
    dispatch(toggleTableColumn({ columns: [item.key], parent }))
  }

  const handleSearchTextChange = (text: string) => {
    const filtered = _filter(columnItems, (item: ColumnItem) => {
      const includesLabelText = _includes(_toLower(item.label), _toLower(text))
      const childrenIncludesText = item.children
        ? _some(item.children, (child: ColumnItem) =>
            _includes(_toLower(child.label), _toLower(text)),
          )
        : false
      return includesLabelText || childrenIncludesText
    })
    setFilteredItems(text ? (filtered as ColumnItem[]) : columnItems)
  }

  // Prevent dropdown from closing when selecting items
  const handleMenuClick = (e: { domEvent: { stopPropagation: () => void } }) => {
    e.domEvent.stopPropagation()
  }

  const renderMenu = (items: ColumnItem[]) => (
    <Menu onClick={handleMenuClick}>
      <SearchWrapper>
        <div>Select Columns</div>
        <Input
          placeholder="Search Column"
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearchTextChange(e.target.value)}
        />
      </SearchWrapper>
      {_map(items, (item: ColumnItem) => {
        if (item.children) {
          return (
            <Menu.SubMenu
              key={item.key}
              expandIcon={<></>}
              title={
                <DropdownItem>
                  <Checkbox
                    checked={visibleColumnItems[item.key]}
                    onChange={() => handleParentCheckboxChange(item)}
                  />
                  <Label>{item.label}</Label>
                  <RightOutlined />
                </DropdownItem>
              }
            >
              {_map(item.children, (child: ColumnItem) => (
                <Menu.Item key={child.key}>
                  <DropdownItem>
                    <Checkbox
                      checked={visibleColumnItems[child.key]}
                      onChange={() => handleItemChange(child, item)}
                    />
                    <Label>{child.label}</Label>
                  </DropdownItem>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          )
        }
        return (
          <Menu.Item key={item.key}>
            <DropdownItem>
              <Checkbox
                checked={visibleColumnItems[item.key]}
                onChange={() => handleItemChange(item)}
              />
              <Label>{item.label}</Label>
            </DropdownItem>
          </Menu.Item>
        )
      })}
    </Menu>
  )

  return (
    <Dropdown
      popupRender={() => renderMenu(filteredItems)}
      trigger={['click']}
      open={dropdownVisible}
      onOpenChange={(open: boolean) => setDropdownVisible(open)}
      placement="bottomLeft"
      arrow
    >
      <WebappButton onClick={() => setDropdownVisible(!dropdownVisible)}>Columns</WebappButton>
    </Dropdown>
  )
}

export { ColumnsButton }

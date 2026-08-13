import { DownOutlined, UpOutlined } from '@ant-design/icons'
import Checkbox from 'antd/es/checkbox'
import Popover from 'antd/es/popover'
import _every from 'lodash/every'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { FC, ReactNode, useState } from 'react'

import { DropdownContainer, Placeholder, SelectBox, SelectValues } from './MosSelect.styles'

export interface MosSelectOption {
  label: string
  value: string
}

interface MosSelectProps {
  options?: MosSelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  renderContent?: (props: { close: () => void }) => ReactNode
  renderValue?: () => ReactNode
  isActive?: boolean
  limitedHeight?: boolean
}

const MosSelect: FC<MosSelectProps> = ({
  options = [],
  value = [],
  onChange,
  placeholder = '',
  renderContent,
  renderValue,
  isActive = false,
  limitedHeight = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedLabels = _map(
    _filter(options, (opt: { value: string; label: string }) => _includes(value, opt.value)),
    'label',
  ).join(', ')

  const allSelected =
    options.length > 0 &&
    _every(options, (opt: { value: string; label: string }) => _includes(value, opt.value))

  const handleToggle = (optionValue: string, checked: boolean) => {
    let newValue: string[]
    if (checked) newValue = [...value, optionValue]
    else newValue = _filter(value, (v: unknown) => v !== optionValue)
    onChange?.(newValue)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) onChange?.(_map(options, ({ value }) => value))
    else onChange?.([])
  }

  const defaultContent = (
    <DropdownContainer $limitedHeight={limitedHeight}>
      <Checkbox
        checked={allSelected}
        onChange={(e: unknown) =>
          handleSelectAll((e as { target: { checked: boolean } }).target.checked)
        }
      >
        Select All
      </Checkbox>
      {_map(options, ({ label, value: optionValue }) => (
        <Checkbox
          key={optionValue}
          checked={_includes(value, optionValue)}
          onChange={(e: unknown) =>
            handleToggle(optionValue, (e as { target: { checked: boolean } }).target.checked)
          }
        >
          {label}
        </Checkbox>
      ))}
    </DropdownContainer>
  )

  const content = renderContent ? renderContent({ close: () => setIsOpen(false) }) : defaultContent

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomLeft"
      overlayClassName="mos-popover"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectBox className={isActive ? 'active' : ''}>
        {(() => {
          if (renderValue) {
            return <SelectValues>{renderValue()}</SelectValues>
          }
          if (selectedLabels) {
            return <SelectValues>{selectedLabels}</SelectValues>
          }
          return <Placeholder>{placeholder}</Placeholder>
        })()}
        {isOpen ? <UpOutlined /> : <DownOutlined />}
      </SelectBox>
    </Popover>
  )
}

export default MosSelect

import Button from 'antd/es/button'
import Switch from 'antd/es/switch'

import {
  ActionsRow,
  ControlsTable,
  Description,
  HeaderColumn,
  HeaderControlsContainer,
  RowColumn,
  TableHeader,
  TableRow,
  ToggleColumn,
} from './HeaderControlsSettings.styles'
import { HEADER_ITEMS } from './types'
import { useHeaderControls } from './useHeaderControls'

import { Spinner } from '@/Components/Spinner/Spinner'

const HeaderControlsSettings = () => {
  const { preferences, isLoading, handleToggle, handleReset } = useHeaderControls()

  if (isLoading && !preferences) {
    return <Spinner />
  }

  return (
    <HeaderControlsContainer>
      <Description>
        Customize which metrics appear in your global header. Changes apply instantly.
      </Description>

      <ControlsTable>
        <TableHeader>
          <HeaderColumn $width="2">Header Item</HeaderColumn>
          <HeaderColumn $width="1">Visibility Toggle</HeaderColumn>
        </TableHeader>

        {HEADER_ITEMS.map((item) => (
          <TableRow key={item.key}>
            <RowColumn $width="2">{item.label}</RowColumn>
            <ToggleColumn $width="1">
              <Switch
                checked={preferences[item.key]}
                onChange={(checked) => handleToggle(item.key, checked)}
                disabled={isLoading}
              />
            </ToggleColumn>
          </TableRow>
        ))}
      </ControlsTable>

      <ActionsRow>
        <Button onClick={handleReset} disabled={isLoading}>
          Reset to Default
        </Button>
      </ActionsRow>
    </HeaderControlsContainer>
  )
}

export default HeaderControlsSettings

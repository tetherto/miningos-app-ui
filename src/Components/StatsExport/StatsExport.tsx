import Button from 'antd/es/button'
import Dropdown from 'antd/es/dropdown'
import _noop from 'lodash/noop'
import { Fragment, useState } from 'react'

import { ArrowIcon } from './ArrowIcon'
import { ExportIcon } from './ExportIcon'
import {
  EXPORT_DROPDOWN_OVERLAY_CLASS_NAME,
  EXPORT_ITEM_KEYS,
  EXPORT_ITEMS,
  EXPORT_LABEL,
} from './StatsExport.const'
import { ExportButton, ExportDivider, ExportDropdownStyles } from './StatsExport.styles'

interface StatsExportProps {
  showLabel?: boolean
  disabled?: boolean
  onCsvExport: () => Promise<void>
  onJsonExport: () => Promise<void>
}

export const StatsExport = ({
  onJsonExport,
  onCsvExport,
  disabled = false,
  showLabel = false,
}: StatsExportProps) => {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isButtonDisabled = isLoading || disabled

  const handleMenuClick = async (e: { key: string }) => {
    setOpen(false)
    setIsLoading(true)

    if (e.key === EXPORT_ITEM_KEYS.CSV) {
      await onCsvExport()
    }
    if (e.key === EXPORT_ITEM_KEYS.JSON) {
      await onJsonExport()
    }
    setIsLoading(false)
  }

  const handleOpenChange = (isOpened: boolean) => {
    setOpen(isOpened)
  }

  return (
    <Fragment>
      <ExportDropdownStyles />
      <Dropdown
        menu={{
          items: EXPORT_ITEMS,
          onClick: handleMenuClick,
        }}
        open={open}
        trigger={['click']}
        disabled={isButtonDisabled}
        overlayClassName={EXPORT_DROPDOWN_OVERLAY_CLASS_NAME}
        onOpenChange={isButtonDisabled ? _noop : handleOpenChange}
      >
        <ExportButton>
          <Button loading={isLoading} disabled={isButtonDisabled}>
            <ExportIcon />
            {!showLabel && EXPORT_LABEL}
            <ExportDivider />
            <ArrowIcon isOpen={open} />
          </Button>
        </ExportButton>
      </Dropdown>
    </Fragment>
  )
}

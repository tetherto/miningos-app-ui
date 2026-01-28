import Checkbox from 'antd/es/checkbox'
import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _some from 'lodash/some'
import _startsWith from 'lodash/startsWith'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'

import { collectionToCSV, downloadFileFromData } from '../../../app/utils/downloadUtils'
import { WebappButton } from '../../WebappButton/WebappButton'
import { columnItems } from '../ColumnButton/ColumnsBtn.data'

import {
  AllFieldsCheckbox,
  ContentWrapper,
  CheckboxWrapper,
  StyledModal,
  SelectWrapper,
} from './ExportMinerButton.styles'

interface ExportMinerButtonProps {
  onlyFaulty: boolean
  miners: unknown[]
}

const ExportMinerButton: FC<ExportMinerButtonProps> = ({ onlyFaulty, miners }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSelectAll, setIsSelectAll] = useState(true)
  const [exportType, setExportType] = useState('')
  interface ColumnItem {
    key: string
    [key: string]: unknown
  }

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    ...{ selected: false, collapsed: false },
    ..._reduce(
      columnItems,
      (acc: Record<string, boolean>, item: ColumnItem) => ({ ...acc, [item.key]: true }),
      {},
    ),
  })
  const exportOptions = [
    {
      key: '2',
      label: 'JSON',
    },
    {
      key: '3',
      label: 'CSV',
    },
  ]

  const onSelectAllToggle = () => {
    const newIsSelectAll = !isSelectAll
    setIsSelectAll(newIsSelectAll)

    const newCheckedItems = _reduce(
      _map(columnItems, (item: ColumnItem) => ({
        [item.key]: newIsSelectAll,
      })),
      (acc: Record<string, boolean>, item: Record<string, boolean>) => ({ ...acc, ...item }),
      {},
    )

    setCheckedItems(newCheckedItems)
  }

  const handleCheckboxChange = (key: string) => {
    setCheckedItems((prevCheckedItems: Record<string, boolean>) => ({
      ...prevCheckedItems,
      [key]: !prevCheckedItems[key],
    }))
  }

  interface MinerRecord {
    selected?: boolean
    [key: string]: unknown
  }

  const handleExport = () => {
    const fieldsToIgnore = _filter(_keys(checkedItems), (key: string) => checkedItems[key])

    const minersToDownload = _filter(
      miners,
      ({ selected }: MinerRecord) => !!selected,
    ) as MinerRecord[]
    if (exportType === 'CSV') {
      const csv = collectionToCSV(minersToDownload, fieldsToIgnore)
      downloadFileFromData(csv, 'text/csv', `miners_${new Date()}.csv`)
    } else if (exportType === 'JSON') {
      const minersObj = _map(minersToDownload, (miner: MinerRecord) => {
        const newMiner = { ...miner }
        // Iterate over each key in newMiner and delete if it meets conditions
        _forEach(_keys(newMiner), (key: string) => {
          if (
            _some(
              fieldsToIgnore,
              (field: string) => key === field || _startsWith(key as string, `${field}.`),
            )
          ) {
            delete newMiner[key]
          }
        })
        return newMiner
      })
      downloadFileFromData(minersObj, 'application/json', `miners_${new Date()}.json`)
    }
    setIsModalOpen(false)
  }

  return (
    <>
      <WebappButton
        onClick={() => setIsModalOpen(true)}
        style={{ gridColumn: `${onlyFaulty ? '1/3' : '3/-1'}` }}
      >
        Export {onlyFaulty ? 'Faulty' : 'Selected'} Miners
      </WebappButton>
      <StyledModal
        title={'Export Miner Data'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText={'Export'}
        onOk={handleExport}
      >
        <ContentWrapper>
          <AllFieldsCheckbox checked={isSelectAll} onChange={onSelectAllToggle}>
            All Fields
          </AllFieldsCheckbox>
          <CheckboxWrapper>
            {_map(columnItems, (item: ColumnItem) => (
              <Checkbox
                key={item.key}
                checked={checkedItems[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
              >
                {item.label as ReactNode}
              </Checkbox>
            ))}
          </CheckboxWrapper>

          <SelectWrapper
            onChange={(value: unknown) => setExportType(value as string)}
            placeholder="Choose Download Format"
            options={_map(exportOptions, (item: { key: string; label: string }) => ({
              value: item.label,
              label: item.label,
            }))}
          />
        </ContentWrapper>
      </StyledModal>
    </>
  )
}

export { ExportMinerButton }

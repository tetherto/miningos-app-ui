import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import _assign from 'lodash/assign'
import _every from 'lodash/every'
import _forEach from 'lodash/forEach'
import _isEmpty from 'lodash/isEmpty'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'

import { columnItems } from '../../Components/MinersOverview/ColumnButton/ColumnsBtn.data'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { MinersState, MinerEntity, RootState } from '@/types/redux'

interface MinerData {
  mac: string
  [key: string]: unknown
}

interface StoreMinersPayload {
  miners: MinerData[]
}

interface ToggleExpandPayload {
  mac?: string
  all?: boolean
  collapse?: boolean
}

interface ColumnItem {
  key: string
  children?: Array<{ key: string }>
}

interface ToggleColumnPayload {
  columns: string[]
  status?: boolean
  parent?: ColumnItem
}

const flattenObject = (obj: UnknownRecord, prefix = ''): UnknownRecord =>
  _reduce(
    obj,
    (acc: UnknownRecord, value: unknown, key: string) => {
      const newKey = prefix ? `${prefix}.${key}` : key
      if (_isObject(value)) {
        _assign(acc, flattenObject(value as UnknownRecord, newKey))
        acc[key] = !_isEmpty(value)
      } else {
        acc[newKey] = value
      }
      return acc
    },
    {},
  )

const storeMinersData = (state: MinersState, action: PayloadAction<StoreMinersPayload>): void => {
  state.entities = _reduce(
    action.payload.miners,
    (acc: Record<string, MinerEntity>, item: MinerData) => {
      acc[item.mac] = {
        ...flattenObject(item),
        selected: false,
        collapsed: true,
      }
      return acc
    },
    {},
  )
}

const toggleExpandMiner = (
  state: MinersState,
  { payload }: PayloadAction<ToggleExpandPayload>,
): void => {
  if (payload.all) {
    _forEach(state.entities, (miner: MinerEntity) => {
      miner.collapsed = payload.collapse ?? false
    })
  } else if (payload.mac) {
    state.entities[payload.mac].collapsed = !state.entities[payload.mac].collapsed
  }
}

const toggleTableColumn = (
  state: MinersState,
  { payload }: PayloadAction<ToggleColumnPayload>,
): void => {
  const { columns, status, parent } = payload
  _forEach(columns, (col: string) => {
    state.visibleColumns[col] = status !== undefined ? status : !state.visibleColumns[col]
  })
  // when turning off children data, if no data is visible, turn off parent
  if (parent && !status) {
    const areAllChildrenUnchecked = _every(
      parent.children,
      (child: { key: string }) => !state.visibleColumns[child.key],
    )
    state.visibleColumns[parent.key] = !areAllChildrenUnchecked
  }
}

const setSelectedMiners = (state: MinersState, { payload }: PayloadAction<string[]>): void => {
  _forEach(payload, (mac: string) => {
    if (state.entities[mac]) {
      state.entities[mac].selected = true
    }
  })
}

const initialState: MinersState = {
  entities: {},
  visibleColumns: _reduce(
    columnItems,
    (acc: Record<string, boolean>, item: ColumnItem) => {
      if (item.children) {
        _forEach(item.children, (child: { key: string }) => {
          acc[child.key] = true
        })
      }
      acc[item.key] = true
      return acc
    },
    {},
  ),
}

export const minersSlice = createSlice({
  name: 'miners',
  initialState,
  reducers: {
    storeMinersData,
    toggleExpandMiner,
    toggleTableColumn,
    setSelectedMiners,
  },
})

export default minersSlice.reducer

export const getAllMiners = (state: RootState): MinerEntity[] =>
  _map(_keys(state.miners.entities), (key: string) => state.miners.entities[key])

export const getVisibleColumns = (state: RootState): Record<string, boolean> =>
  state.miners.visibleColumns

import minersReducer, { minersSlice, getAllMiners, getVisibleColumns } from './minersSlice'

import type { MinersState, RootState } from '@/types/redux.d'

const { storeMinersData, toggleExpandMiner, toggleTableColumn, setSelectedMiners } =
  minersSlice.actions

const reducer = minersSlice.reducer

const mockState = (miners: MinersState): RootState => ({ miners }) as RootState

describe('minersSlice', () => {
  describe('initial state', () => {
    it('starts with empty entities', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.entities).toEqual({})
    })

    it('has all MINER_COLUMN_ITEMS set to visible by default', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(typeof state.visibleColumns).toBe('object')
      expect(Object.keys(state.visibleColumns).length).toBeGreaterThan(0)
      Object.values(state.visibleColumns).forEach((v) => expect(v).toBe(true))
    })
  })

  describe('storeMinersData', () => {
    it('indexes miners by mac address', () => {
      const state = reducer(
        undefined,
        storeMinersData({ miners: [{ mac: 'aa:bb', name: 'Miner A' }] }),
      )
      expect(state.entities['aa:bb']).toBeDefined()
      expect(state.entities['aa:bb'].selected).toBe(false)
      expect(state.entities['aa:bb'].collapsed).toBe(true)
    })

    it('flattens nested objects', () => {
      const state = reducer(
        undefined,
        storeMinersData({
          miners: [{ mac: 'cc:dd', info: { temperature: 55, power: 3000 } }],
        }),
      )
      expect(state.entities['cc:dd']['info.temperature']).toBe(55)
      expect(state.entities['cc:dd']['info.power']).toBe(3000)
    })

    it('stores boolean for nested object parent key', () => {
      const state = reducer(
        undefined,
        storeMinersData({
          miners: [{ mac: 'ee:ff', nested: { a: 1 } }],
        }),
      )
      // flattenObject sets parent key to !isEmpty(value) → true
      expect(state.entities['ee:ff']['nested']).toBe(true)
    })

    it('replaces all entities on second call', () => {
      const pre = reducer(undefined, storeMinersData({ miners: [{ mac: 'aa:bb' }] }))
      const state = reducer(pre, storeMinersData({ miners: [{ mac: 'cc:dd' }] }))
      expect(state.entities['aa:bb']).toBeUndefined()
      expect(state.entities['cc:dd']).toBeDefined()
    })

    it('handles an empty miners array', () => {
      const state = reducer(undefined, storeMinersData({ miners: [] }))
      expect(state.entities).toEqual({})
    })
  })

  describe('toggleExpandMiner', () => {
    it('toggles a specific miner by mac', () => {
      const pre = reducer(undefined, storeMinersData({ miners: [{ mac: 'aa:bb' }] }))
      expect(pre.entities['aa:bb'].collapsed).toBe(true)
      const state = reducer(pre, toggleExpandMiner({ mac: 'aa:bb' }))
      expect(state.entities['aa:bb'].collapsed).toBe(false)
    })

    it('toggles back when called twice', () => {
      const pre = reducer(undefined, storeMinersData({ miners: [{ mac: 'aa:bb' }] }))
      let state = reducer(pre, toggleExpandMiner({ mac: 'aa:bb' }))
      state = reducer(state, toggleExpandMiner({ mac: 'aa:bb' }))
      expect(state.entities['aa:bb'].collapsed).toBe(true)
    })

    it('collapses all when all:true and collapse:true', () => {
      const pre = reducer(undefined, storeMinersData({ miners: [{ mac: 'a1' }, { mac: 'a2' }] }))
      let state = reducer(pre, toggleExpandMiner({ mac: 'a1' })) // expand a1
      state = reducer(state, toggleExpandMiner({ all: true, collapse: true }))
      expect(state.entities['a1'].collapsed).toBe(true)
      expect(state.entities['a2'].collapsed).toBe(true)
    })

    it('expands all when all:true and collapse:false', () => {
      const pre = reducer(undefined, storeMinersData({ miners: [{ mac: 'b1' }, { mac: 'b2' }] }))
      const state = reducer(pre, toggleExpandMiner({ all: true, collapse: false }))
      expect(state.entities['b1'].collapsed).toBe(false)
      expect(state.entities['b2'].collapsed).toBe(false)
    })
  })

  describe('toggleTableColumn', () => {
    it('toggles a column visibility', () => {
      const pre = reducer(undefined, { type: '@@init' })
      const colKey = Object.keys(pre.visibleColumns)[0]
      const original = pre.visibleColumns[colKey]
      const state = reducer(pre, toggleTableColumn({ columns: [colKey] }))
      expect(state.visibleColumns[colKey]).toBe(!original)
    })

    it('sets a column to explicit true', () => {
      const pre = reducer(undefined, { type: '@@init' })
      const colKey = Object.keys(pre.visibleColumns)[0]
      const state = reducer(pre, toggleTableColumn({ columns: [colKey], status: true }))
      expect(state.visibleColumns[colKey]).toBe(true)
    })

    it('sets a column to explicit false', () => {
      const pre = reducer(undefined, { type: '@@init' })
      const colKey = Object.keys(pre.visibleColumns)[0]
      const state = reducer(pre, toggleTableColumn({ columns: [colKey], status: false }))
      expect(state.visibleColumns[colKey]).toBe(false)
    })

    it('turns off parent when all children are unchecked and status is false', () => {
      const parent = {
        key: 'powerMode',
        children: [
          { key: 'powerMode.performance' },
          { key: 'powerMode.ths' },
          { key: 'powerMode.efficiency' },
        ],
      }
      const pre = reducer(undefined, { type: '@@init' })
      // turn off all children
      let state = reducer(
        pre,
        toggleTableColumn({
          columns: ['powerMode.performance', 'powerMode.ths', 'powerMode.efficiency'],
          status: false,
          parent,
        }),
      )
      expect(state.visibleColumns['powerMode']).toBe(false)
    })

    it('keeps parent on when some children remain checked', () => {
      const parent = {
        key: 'powerMode',
        children: [{ key: 'powerMode.performance' }, { key: 'powerMode.ths' }],
      }
      const pre = reducer(undefined, { type: '@@init' })
      // only turn off one child
      const state = reducer(
        pre,
        toggleTableColumn({ columns: ['powerMode.performance'], status: false, parent }),
      )
      // powerMode.ths still true → parent stays true
      expect(state.visibleColumns['powerMode']).toBe(true)
    })
  })

  describe('setSelectedMiners', () => {
    it('marks specified miners as selected', () => {
      const pre = reducer(undefined, storeMinersData({ miners: [{ mac: 'm1' }, { mac: 'm2' }] }))
      const state = reducer(pre, setSelectedMiners(['m1']))
      expect(state.entities['m1'].selected).toBe(true)
      expect(state.entities['m2'].selected).toBe(false)
    })

    it('silently ignores macs not in entities', () => {
      const pre = reducer(undefined, storeMinersData({ miners: [{ mac: 'm1' }] }))
      const state = reducer(pre, setSelectedMiners(['nonexistent']))
      expect(state.entities['m1'].selected).toBe(false)
    })
  })

  describe('immutability', () => {
    it('does not mutate the original state', () => {
      const pre = reducer(undefined, storeMinersData({ miners: [{ mac: 'mm:11' }] }))
      const snapshot = JSON.parse(JSON.stringify(pre))
      reducer(pre, toggleExpandMiner({ mac: 'mm:11' }))
      expect(pre.entities['mm:11'].collapsed).toBe(snapshot.entities['mm:11'].collapsed)
    })
  })

  describe('selectors', () => {
    describe('getAllMiners', () => {
      it('returns miners as an array', () => {
        const entities = {
          m1: { mac: 'm1', selected: false, collapsed: true },
          m2: { mac: 'm2', selected: true, collapsed: false },
        }
        const state = mockState({ entities, visibleColumns: {} })
        const miners = getAllMiners(state)
        expect(miners).toHaveLength(2)
      })

      it('returns empty array when no entities', () => {
        const state = mockState({ entities: {}, visibleColumns: {} })
        expect(getAllMiners(state)).toEqual([])
      })
    })

    describe('getVisibleColumns', () => {
      it('returns the visible columns map', () => {
        const cols = { ip: true, status: false }
        const state = mockState({ entities: {}, visibleColumns: cols })
        expect(getVisibleColumns(state)).toEqual(cols)
      })
    })
  })
})

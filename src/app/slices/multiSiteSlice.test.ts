import {
  multiSiteSlice,
  getSelectedSites,
  getIsManualSelection,
  getMultiSiteDateRange,
  getTimeframeType,
  setSelectedSites,
  setSelectedSitesManually,
  clearSelectedSites,
  setMultiSiteDateRange,
  clearMultiSiteDateRange,
  setTimeframeType,
  clearTimeframeType,
} from './multiSiteSlice'

import type { MultiSiteState, RootState } from '@/types/redux.d'

const reducer = multiSiteSlice.reducer

const mockState = (multiSite: MultiSiteState): RootState => ({ multiSite }) as RootState

const emptyMultiSite: MultiSiteState = {
  selectedSites: [],
  isManualSelection: false,
  dateRange: null,
  timeframeType: null,
}

describe('multiSiteSlice', () => {
  describe('initial state', () => {
    it('starts with empty selections and null ranges', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.selectedSites).toEqual([])
      expect(state.isManualSelection).toBe(false)
      expect(state.dateRange).toBeNull()
      expect(state.timeframeType).toBeNull()
    })
  })

  describe('setSelectedSites', () => {
    it('sets selected sites and marks as non-manual', () => {
      const state = reducer(
        { ...emptyMultiSite, isManualSelection: true },
        setSelectedSites(['site-1', 'site-2']),
      )
      expect(state.selectedSites).toEqual(['site-1', 'site-2'])
      expect(state.isManualSelection).toBe(false)
    })

    it('replaces existing site selection', () => {
      const initial: MultiSiteState = { ...emptyMultiSite, selectedSites: ['old-site'] }
      const state = reducer(initial, setSelectedSites(['new-site']))
      expect(state.selectedSites).toEqual(['new-site'])
    })

    it('accepts an empty array', () => {
      const state = reducer({ ...emptyMultiSite, selectedSites: ['site-1'] }, setSelectedSites([]))
      expect(state.selectedSites).toEqual([])
    })
  })

  describe('setSelectedSitesManually', () => {
    it('sets sites and marks as manual selection', () => {
      const state = reducer(undefined, setSelectedSitesManually(['site-a']))
      expect(state.selectedSites).toEqual(['site-a'])
      expect(state.isManualSelection).toBe(true)
    })
  })

  describe('clearSelectedSites', () => {
    it('empties the selected sites', () => {
      const initial: MultiSiteState = { ...emptyMultiSite, selectedSites: ['s1', 's2'] }
      const state = reducer(initial, clearSelectedSites())
      expect(state.selectedSites).toEqual([])
    })
  })

  describe('setMultiSiteDateRange', () => {
    it('sets the date range', () => {
      const range = { start: 1000, end: 2000, period: 'month' }
      const state = reducer(undefined, setMultiSiteDateRange(range))
      expect(state.dateRange).toEqual(range)
    })

    it('sets date range to null', () => {
      const initial: MultiSiteState = {
        ...emptyMultiSite,
        dateRange: { start: 1000, end: 2000, period: 'week' },
      }
      const state = reducer(initial, setMultiSiteDateRange(null))
      expect(state.dateRange).toBeNull()
    })
  })

  describe('clearMultiSiteDateRange', () => {
    it('resets date range to null', () => {
      const initial: MultiSiteState = {
        ...emptyMultiSite,
        dateRange: { start: 100, end: 200, period: 'year' },
      }
      const state = reducer(initial, clearMultiSiteDateRange())
      expect(state.dateRange).toBeNull()
    })
  })

  describe('setTimeframeType', () => {
    it('sets timeframe to year', () => {
      const state = reducer(undefined, setTimeframeType('year'))
      expect(state.timeframeType).toBe('year')
    })

    it('sets timeframe to month', () => {
      const state = reducer(undefined, setTimeframeType('month'))
      expect(state.timeframeType).toBe('month')
    })

    it('sets timeframe to week', () => {
      const state = reducer(undefined, setTimeframeType('week'))
      expect(state.timeframeType).toBe('week')
    })

    it('sets timeframe to null', () => {
      const initial: MultiSiteState = { ...emptyMultiSite, timeframeType: 'year' }
      const state = reducer(initial, setTimeframeType(null))
      expect(state.timeframeType).toBeNull()
    })
  })

  describe('clearTimeframeType', () => {
    it('resets timeframe to null', () => {
      const initial: MultiSiteState = { ...emptyMultiSite, timeframeType: 'month' }
      const state = reducer(initial, clearTimeframeType())
      expect(state.timeframeType).toBeNull()
    })
  })

  describe('immutability', () => {
    it('does not mutate the original state', () => {
      const initial: MultiSiteState = { ...emptyMultiSite }
      const copy = { ...initial, selectedSites: [...initial.selectedSites] }
      reducer(initial, setSelectedSites(['site-x']))
      expect(initial.selectedSites).toEqual(copy.selectedSites)
    })
  })

  describe('selectors', () => {
    describe('getSelectedSites', () => {
      it('returns selected sites array', () => {
        const state = mockState({ ...emptyMultiSite, selectedSites: ['a', 'b'] })
        expect(getSelectedSites(state)).toEqual(['a', 'b'])
      })

      it('returns empty array when no sites selected', () => {
        expect(getSelectedSites(mockState(emptyMultiSite))).toEqual([])
      })
    })

    describe('getIsManualSelection', () => {
      it('returns true for manual selection', () => {
        expect(
          getIsManualSelection(mockState({ ...emptyMultiSite, isManualSelection: true })),
        ).toBe(true)
      })

      it('returns false for automatic selection', () => {
        expect(getIsManualSelection(mockState(emptyMultiSite))).toBe(false)
      })
    })

    describe('getMultiSiteDateRange', () => {
      it('returns the date range', () => {
        const range = { start: 500, end: 1000, period: 'week' }
        expect(getMultiSiteDateRange(mockState({ ...emptyMultiSite, dateRange: range }))).toEqual(
          range,
        )
      })

      it('returns null when not set', () => {
        expect(getMultiSiteDateRange(mockState(emptyMultiSite))).toBeNull()
      })
    })

    describe('getTimeframeType', () => {
      it('returns the timeframe type', () => {
        expect(getTimeframeType(mockState({ ...emptyMultiSite, timeframeType: 'year' }))).toBe(
          'year',
        )
      })

      it('returns null when not set', () => {
        expect(getTimeframeType(mockState(emptyMultiSite))).toBeNull()
      })
    })
  })
})

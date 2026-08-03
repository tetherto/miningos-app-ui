import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import {
  getListThingsPaginated,
  GetListThingsPaginatedQueryFnParams,
  useGetListThingsPaginated,
} from '../useGetListThingsPaginated'

const mockUnwrap = vi.fn()
const mockGetListThings = vi.fn(() => ({ unwrap: mockUnwrap }))

vi.mock('@/app/services/api', () => ({
  useLazyGetListThingsQuery: () => [mockGetListThings, { isLoading: false, isFetching: false }],
}))

describe('getListThingsPaginated', () => {
  it("should fetch all pages until there aren't any results returned", async () => {
    const queryFn = async ({ offset }: GetListThingsPaginatedQueryFnParams) => {
      const mockData: Record<number, unknown[][]> = {
        0: [
          [
            { id: 1, name: 1 },
            { id: 2, name: 2 },
          ],
        ],
        2: [[{ id: 3, name: 3 }]],
      }

      if (mockData[offset]) {
        return mockData[offset]
      }
      return [[]]
    }

    const things = await getListThingsPaginated({
      queryFn,
      query: '',
      fields: '',
      perPage: 2,
    })
    expect(things.length).toBe(3)
  })

  it('deduplicates things by id across pages', async () => {
    const queryFn = async ({ offset }: GetListThingsPaginatedQueryFnParams) => {
      if (offset === 0)
        return [
          [
            { id: 'a', v: 1 },
            { id: 'a', v: 2 },
          ],
        ]
      return [[]]
    }
    const things = await getListThingsPaginated({ queryFn, query: '', fields: '', perPage: 2 })
    expect(things).toHaveLength(1)
  })
})

describe('useGetListThingsPaginated', () => {
  beforeEach(() => {
    mockUnwrap.mockResolvedValue([[]])
  })

  it('returns things, isLoading, isFetching, and refetch', async () => {
    const { result } = renderHook(() => useGetListThingsPaginated({ query: '{}', fields: '{}' }))
    await waitFor(() => {
      expect(result.current).toHaveProperty('things')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('isFetching')
      expect(result.current.refetch).toBeTypeOf('function')
    })
  })

  it('populates things from paginated API response', async () => {
    mockUnwrap.mockResolvedValueOnce([[{ id: 'item1', name: 'Item 1' }]]).mockResolvedValue([[]])

    const { result } = renderHook(() =>
      useGetListThingsPaginated({ query: '{}', fields: '{}', perPage: 1 }),
    )

    await waitFor(() => {
      expect(result.current.things).toHaveLength(1)
    })
  })
})

import {
  getListThingsPaginated,
  GetListThingsPaginatedQueryFnParams,
} from '../useGetListThingsPaginated'

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
})

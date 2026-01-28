import { circularArrayAccess, formatCountTo99Plus } from '../sharedUtils'

describe('formatCountTo99Plus', () => {
  it('returns value as string if <= 99', () => {
    expect(formatCountTo99Plus(10)).toBe('10')
    expect(formatCountTo99Plus(99)).toBe('99')
  })

  it('returns "99+" if value > 99', () => {
    expect(formatCountTo99Plus(100)).toBe('99+')
    expect(formatCountTo99Plus(150)).toBe('99+')
  })

  it('returns "N/A" for non-numeric input', () => {
    expect(formatCountTo99Plus(null)).toBe('N/A')
    expect(formatCountTo99Plus(undefined)).toBe('N/A')
    expect(formatCountTo99Plus('100')).toBe('N/A')
    expect(formatCountTo99Plus({})).toBe('N/A')
    expect(formatCountTo99Plus([])).toBe('N/A')
  })
})

describe('circularArrayAccess', () => {
  it('should loop circularly in an array', () => {
    const list = [1, 2]
    const gen = circularArrayAccess(list)
    const numLoops = 5

    const result = []
    for (let index = 0; index < list.length * numLoops; index++) {
      result.push(gen.next().value)
    }

    let expectedResult: number[] = []
    for (let index = 0; index < 5; index++) {
      expectedResult = expectedResult.concat(list)
    }
    expect(result).toEqual(expectedResult)
  })
})

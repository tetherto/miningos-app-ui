import { getAttributeWithSmallestTime } from '../getSmallestTimeAttibute'

test('getAttributeWithSmallestTime seconds', () => {
  expect(
    getAttributeWithSmallestTime({
      avg: 1,
      t_30s: 3,
      t_5s: 2,
      t_1m: 4,
      t_5m: 5,
      t_15m: 6,
    }),
  ).toBe('t_5s')
})

test('getAttributeWithSmallestTime minutes', () => {
  expect(
    getAttributeWithSmallestTime({
      avg: 1,
      t_5m: 4,
      t_1m: 3,
      t_15m: 5,
    }),
  ).toBe('t_1m')
})

test('getAttributeWithSmallestTime hours', () => {
  expect(
    getAttributeWithSmallestTime({
      avg: 1,
      t_5h: 2,
    }),
  ).toBe('avg')
})

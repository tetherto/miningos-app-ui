import { getPduIndex, getSocketIndex } from './pduUtils'

describe('getIndices', () => {
  test.each([
    ['1_1_1', '1'],
    ['4_2_1', '4'],
    ['10_2_2', '10'],
  ])('returns the correct PDU index test - %#', (input, expected) => {
    expect(getPduIndex({ info: { pos: input } })).toEqual(expected)
  })

  test.each([
    ['4_1_1', '1_1'],
    ['1_20_1', '20_1'],
    ['1_2_21', '2_21'],
  ])('returns the correct Socket index test - %#', (input, expected) => {
    expect(getSocketIndex({ info: { pos: input } })).toEqual(expected)
  })
})

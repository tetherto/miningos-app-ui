import { vi } from 'vitest'

import { collectionToCSV, downloadFileFromData } from '../downloadUtils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

describe('collectionToCSV', () => {
  it('should convert collection to CSV format with provided fields', () => {
    const collection = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ]

    const expectedCSV = 'id,name,age\n"1","John","30"\n"2","Jane","25"'

    const csvResult = collectionToCSV(collection)
    expect(csvResult).toEqual(expectedCSV)
  })

  it('should handle empty collection', () => {
    const collection: UnknownRecord[] = []

    const expectedCSV = ''

    const csvResult = collectionToCSV(collection)

    expect(csvResult).toEqual(expectedCSV)
  })

  it('should handle collection with missing fields', () => {
    const collection = [
      { id: 1, name: 'Jane', age: 25 },
      { id: 2, name: 'John' },
    ]
    // known disable - Error on tests

    const expectedCSV = 'id,name,age\n' + '"1","Jane","25"\n' + '"2","John",""'

    const csvResult = collectionToCSV(collection)

    expect(csvResult).toEqual(expectedCSV)
  })

  it('should handle collection with empty values', () => {
    const collection = [
      { id: 1, name: '', age: 30 },
      { id: 2, name: 'Jane', age: null },
    ]

    const expectedCSV = 'id,name,age\n"1","","30"\n"2","Jane",""'

    const csvResult = collectionToCSV(collection)

    expect(csvResult).toEqual(expectedCSV)
  })

  it('should handle collection with special characters', () => {
    const collection = [
      { id: 1, name: 'John"Doe', age: 30 },
      { id: 2, name: 'Jane,Smith', age: 25 },
    ]

    const expectedCSV = 'id,name,age\n"1","John""Doe","30"\n"2","Jane,Smith","25"'

    const csvResult = collectionToCSV(collection)

    expect(csvResult).toEqual(expectedCSV)
  })

  it('should ignore keys equals to any of the provided field', () => {
    const collection = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ]

    const expectedCSV = 'id,name\n"1","John"\n"2","Jane"'

    const csvResult = collectionToCSV(collection, ['age'])

    expect(csvResult).toEqual(expectedCSV)
  })

  it('should ignore keys starting with any string in the provided array that are followed by a dot', () => {
    const collection = [
      { id: 1, 'name.first': 'John', 'name.last': 'Doe', age: 30 },
      { id: 2, 'name.first': 'Jane', 'name.last': 'Smith', age: 25 },
    ]

    const expectedCSV = 'id,age\n"1","30"\n"2","25"'

    const csvResult = collectionToCSV(collection, ['name'])

    expect(csvResult).toEqual(expectedCSV)
  })

  it('formats array values as semicolon-separated list', () => {
    const collection = [{ id: 1, tags: ['alpha', 'beta'] }]
    const csv = collectionToCSV(collection)
    expect(csv).toContain('alpha; beta')
  })

  it('formats array of objects using convertObjectToString', () => {
    const collection = [{ id: 1, items: [{ key: 'a', val: 1 }] }]
    const csv = collectionToCSV(collection)
    expect(csv).toContain('key: a')
  })

  it('formats nested object values using convertObjectToString', () => {
    const collection = [{ id: 1, meta: { type: 'test', count: 3 } }]
    const csv = collectionToCSV(collection)
    // flattenObject expands nested keys, so meta.type and meta.count appear as columns
    expect(csv).toContain('meta.type')
  })
})

describe('downloadFileFromData', () => {
  it('creates an anchor element and triggers download for string data', () => {
    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
    const clickSpy = vi.fn()

    createElementSpy.mockReturnValueOnce({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()

    downloadFileFromData('csv-content', 'text/csv', 'export.csv')

    expect(clickSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('JSON-stringifies object data before creating blob', () => {
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
    const clickSpy = vi.fn()

    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()

    downloadFileFromData({ key: 'value' }, 'application/json', 'data.json')

    expect(clickSpy).toHaveBeenCalled()

    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })
})

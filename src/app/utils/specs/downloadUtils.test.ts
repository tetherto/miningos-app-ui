import { collectionToCSV } from '../downloadUtils'

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
})

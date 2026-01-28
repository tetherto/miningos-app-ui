import _forEach from 'lodash/forEach'
import _keys from 'lodash/keys'

import { MOVE_SPARE_PART, SPARE_PART_ACTIONS } from './SpareParts.constants'
import { getSparePartsListActions } from './SpareParts.utils'

describe('getSparePartsListActions', () => {
  it('returns all action is part is not attached', () => {
    const actions = getSparePartsListActions({
      sparePart: {
        parentDeviceId: undefined,
      },
    })
    expect(actions.length).toEqual(_keys(SPARE_PART_ACTIONS).length)
  })

  it('does not return move part action when part is attached', () => {
    const actions = getSparePartsListActions({
      sparePart: {
        parentDeviceId: 'sampleId',
      },
    })

    _forEach(actions, (key: unknown) => {
      expect(SPARE_PART_ACTIONS[key as keyof typeof SPARE_PART_ACTIONS]).not.toBe(MOVE_SPARE_PART)
    })
  })
})

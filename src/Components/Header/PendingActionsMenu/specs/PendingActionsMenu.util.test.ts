import { describe, expect, it } from 'vitest'

import { partitionActionsIntoMineAndOthers } from '../PendingActionsMenu.util'

describe('PendingActionsMenu.util', () => {
  describe('partitionActionsIntoMineAndOthers', () => {
    it('returns [[], []] when actions is empty', () => {
      expect(partitionActionsIntoMineAndOthers([], 'a@b.com')).toEqual([[], []])
    })

    it('returns [[], []] when actions is undefined and email provided', () => {
      expect(partitionActionsIntoMineAndOthers(undefined as never, 'a@b.com')).toEqual([[], []])
    })

    it('partitions actions by votesPos first vote matching email', () => {
      const actions = [
        { id: '1', votesPos: ['a@b.com'] },
        { id: '2', votesPos: ['other@b.com'] },
        { id: '3', votesPos: ['a@b.com'] },
      ]
      const [mine, others] = partitionActionsIntoMineAndOthers(actions, 'a@b.com')
      expect(mine).toHaveLength(2)
      expect(others).toHaveLength(1)
      expect((mine[0] as { id: string }).id).toBe('1')
      expect((others[0] as { id: string }).id).toBe('2')
    })

    it('handles votesPos as number array', () => {
      const actions = [{ id: '1', votesPos: [1] }]
      const [mine, others] = partitionActionsIntoMineAndOthers(actions, '1' as never)
      expect(mine).toHaveLength(0)
      expect(others).toHaveLength(1)
    })
  })
})

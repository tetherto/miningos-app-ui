import { describe, expect, it } from 'vitest'

import {
  getTimelineRadioButtons,
  longTimelineRadioButtons,
  oneMinuteTimeLineRadioButton,
  shortTimelineRadioButtons,
  timelineDropdownItems,
  timelineRadioButtons,
} from '../getTimelineDropdownData'

describe('getTimelineDropdownData', () => {
  describe('timelineRadioButtons', () => {
    it('includes 5m and short timeline options', () => {
      expect(timelineRadioButtons[0]).toEqual({ value: '5m', text: '5 Min' })
      expect(timelineRadioButtons).toContainEqual({ value: '30m', text: '30 Min' })
    })
  })

  describe('shortTimelineRadioButtons', () => {
    it('has 30m, 3h, 1D options', () => {
      expect(shortTimelineRadioButtons).toEqual([
        { value: '30m', text: '30 Min' },
        { value: '3h', text: '3 H' },
        { value: '1D', text: '1 D' },
      ])
    })
  })

  describe('longTimelineRadioButtons', () => {
    it('has single 1D option', () => {
      expect(longTimelineRadioButtons).toEqual([{ value: '1D', text: '1D' }])
    })
  })

  describe('oneMinuteTimeLineRadioButton', () => {
    it('starts with 1m then timeline options', () => {
      expect(oneMinuteTimeLineRadioButton[0]).toEqual({ value: '1m', text: '1 Min' })
    })
  })

  describe('getTimelineRadioButtons', () => {
    it('returns short timeline when isShort is true', () => {
      expect(getTimelineRadioButtons({ isShort: true })).toEqual(shortTimelineRadioButtons)
    })

    it('returns one-minute + timeline when isOneMinEnabled is true', () => {
      const result = getTimelineRadioButtons({ isOneMinEnabled: true })
      expect(result[0]).toEqual({ value: '1m', text: '1 Min' })
      expect(result.length).toBe(oneMinuteTimeLineRadioButton.length)
    })

    it('returns default timeline when no options', () => {
      expect(getTimelineRadioButtons({})).toEqual(timelineRadioButtons)
    })
  })

  describe('timelineDropdownItems', () => {
    it('has minutes, hours, days groups', () => {
      const keys = timelineDropdownItems.map((g) => g.key)
      expect(keys).toContain('minutes')
      expect(keys).toContain('hours')
      expect(keys).toContain('days')
    })

    it('each group has children with key and label', () => {
      for (const group of timelineDropdownItems) {
        expect(group.children).toBeDefined()
        expect(Array.isArray(group.children)).toBe(true)
        for (const child of group.children) {
          expect(child).toHaveProperty('key')
          expect(child).toHaveProperty('label')
        }
      }
    })
  })
})

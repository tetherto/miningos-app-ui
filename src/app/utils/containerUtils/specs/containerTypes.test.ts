import {
  isA1346,
  isAntminerContainer,
  isAntspaceHydro,
  isAntspaceImmersion,
  isAvalonContainer,
  isBitdeer,
  isBitmainImmersion,
  isMicroBT,
  isMicroBTKehua,
  isM30,
  isS19XP,
  isWhatsminerContainer,
} from '../containerTypes'

import { COMPLETE_CONTAINER_TYPE } from '@/constants/containerConstants'

describe('containerTypes', () => {
  describe('type guards', () => {
    it('isA1346', () => {
      expect(isA1346(COMPLETE_CONTAINER_TYPE.BITDEER_A1346)).toBe(true)
      expect(isA1346('other')).toBe(false)
    })
    it('isM30', () => expect(isM30(COMPLETE_CONTAINER_TYPE.BITDEER_M30)).toBe(true))
    it('isS19XP', () => expect(isS19XP(COMPLETE_CONTAINER_TYPE.BITDEER_S19XP)).toBe(true))
    it('isBitdeer', () => {
      expect(isBitdeer('container-bd-d40')).toBe(true)
      expect(isBitdeer('bitdeer-1')).toBe(true)
    })
    it('isMicroBT', () => expect(isMicroBT('container-mbt-kehua')).toBe(true))
    it('isAntspaceHydro', () => expect(isAntspaceHydro('container-as-hk3')).toBe(true))
    it('isMicroBTKehua', () => expect(isMicroBTKehua('container-mbt-kehua')).toBe(true))
    it('isAntspaceImmersion', () =>
      expect(isAntspaceImmersion('container-as-immersion')).toBe(true))
    it('isBitmainImmersion', () => expect(isBitmainImmersion('bitmain-immersion')).toBe(true))
  })
  describe('container type guards', () => {
    it('isAvalonContainer', () => expect(isAvalonContainer('container-bd-d40-a1346')).toBe(true))
    it('isWhatsminerContainer', () => {
      expect(isWhatsminerContainer('container-bd-d40-m56')).toBe(true)
      expect(isWhatsminerContainer('container-mbt-kehua')).toBe(true)
    })
    it('isAntminerContainer', () => {
      expect(isAntminerContainer('container-bd-d40-s19xp')).toBe(true)
      expect(isAntminerContainer('container-as-immersion')).toBe(true)
    })
  })
})

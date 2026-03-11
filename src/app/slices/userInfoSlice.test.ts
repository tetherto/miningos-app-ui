import { userInfoSlice, selectUserInfo, selectUserEmail } from './userInfoSlice'

import type { RootState, UserInfoState } from '@/types/redux.d'

const { setUserInfo } = userInfoSlice.actions
const reducer = userInfoSlice.reducer

const mockState = (userInfo: UserInfoState): RootState => ({ userInfo }) as RootState

describe('userInfoSlice', () => {
  describe('initial state', () => {
    it('starts with empty user info', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.email).toBe('')
      expect(state.id).toBe(0)
      expect(state.roles).toBe('')
      expect(state.password).toBeNull()
      expect(state.token).toBe('')
      expect(state.ips).toEqual([])
      expect(state.metadata).toBeNull()
    })
  })

  describe('setUserInfo', () => {
    it('sets all user info fields', () => {
      const userInfo: UserInfoState = {
        email: 'user@example.com',
        id: 42,
        roles: 'admin',
        password: null,
        created: 1700000000,
        ips: ['192.168.1.1'],
        metadata: null,
        token: 'tok-abc',
      }
      const state = reducer(undefined, setUserInfo(userInfo))
      expect(state.email).toBe('user@example.com')
      expect(state.id).toBe(42)
      expect(state.roles).toBe('admin')
      expect(state.token).toBe('tok-abc')
    })

    it('overwrites existing user info', () => {
      const first: UserInfoState = {
        email: 'old@test.com',
        id: 1,
        roles: '',
        password: null,
        created: 0,
        ips: [],
        metadata: null,
        token: '',
      }
      const second: UserInfoState = {
        email: 'new@test.com',
        id: 2,
        roles: 'user',
        password: null,
        created: 0,
        ips: [],
        metadata: null,
        token: '',
      }
      let state = reducer(undefined, setUserInfo(first))
      state = reducer(state, setUserInfo(second))
      expect(state.email).toBe('new@test.com')
      expect(state.id).toBe(2)
    })

    it('sets metadata when provided', () => {
      const userInfo: UserInfoState = {
        email: '',
        id: 0,
        roles: '',
        password: null,
        created: 0,
        ips: [],
        metadata: { email: 'meta@example.com', id: 7, roles: 'admin', password: null },
        token: '',
      }
      const state = reducer(undefined, setUserInfo(userInfo))
      expect(state.metadata?.email).toBe('meta@example.com')
    })
  })

  describe('immutability', () => {
    it('does not mutate original state', () => {
      const initial: UserInfoState = {
        email: 'a@b.com',
        id: 1,
        roles: '',
        password: null,
        created: 0,
        ips: [],
        metadata: null,
        token: '',
      }
      const copy = { ...initial }
      reducer(initial, setUserInfo({ ...initial, email: 'changed@b.com' }))
      expect(initial).toEqual(copy)
    })
  })

  describe('selectUserEmail', () => {
    it('returns email from metadata when available', () => {
      const state = mockState({
        email: 'direct@test.com',
        metadata: { email: 'meta@test.com', id: 1, roles: '', password: null },
      })
      expect(selectUserEmail(state)).toBe('meta@test.com')
    })

    it('falls back to direct email when metadata is absent', () => {
      const state = mockState({ email: 'direct@test.com', metadata: null })
      expect(selectUserEmail(state)).toBe('direct@test.com')
    })

    it('falls back to direct email when metadata email is empty', () => {
      const state = mockState({
        email: 'direct@test.com',
        metadata: { email: '', id: 1, roles: '', password: null },
      })
      expect(selectUserEmail(state)).toBe('direct@test.com')
    })

    it('returns empty string when no email is available', () => {
      const state = mockState({ email: '', metadata: null })
      expect(selectUserEmail(state)).toBe('')
    })
  })

  describe('selectUserInfo', () => {
    it('returns the full userInfo state', () => {
      const info: UserInfoState = {
        email: 'a@b.com',
        id: 5,
        roles: 'user',
        password: null,
        created: 0,
        ips: [],
        metadata: null,
        token: '',
      }
      expect(selectUserInfo(mockState(info))).toEqual(info)
    })
  })
})

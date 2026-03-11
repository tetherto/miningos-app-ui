import { authSlice, selectToken, selectPermissions } from './authSlice'

import type { AuthState, RootState } from '@/types/redux.d'

const { setToken, setPermissions } = authSlice.actions
const reducer = authSlice.reducer

describe('authSlice', () => {
  describe('initial state', () => {
    it('has null token and null permissions', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.token).toBeNull()
      expect(state.permissions).toBeNull()
    })
  })

  describe('setToken', () => {
    it('sets a valid token', () => {
      const state = reducer(undefined, setToken('abc-123'))
      expect(state.token).toBe('abc-123')
    })

    it('sets token to null', () => {
      const state = reducer({ token: 'old', permissions: null }, setToken(null))
      expect(state.token).toBeNull()
    })

    it('sets an empty string token', () => {
      const state = reducer(undefined, setToken(''))
      expect(state.token).toBe('')
    })

    it('does not mutate permissions when setting token', () => {
      const permissions = { role: 'admin' }
      const initial: AuthState = { token: null, permissions }
      const state = reducer(initial, setToken('new-token'))
      expect(state.permissions).toBe(permissions)
    })
  })

  describe('setPermissions', () => {
    it('sets permissions object', () => {
      const perms = { canRead: true, canWrite: false }
      const state = reducer(undefined, setPermissions(perms))
      expect(state.permissions).toEqual(perms)
    })

    it('sets permissions to null', () => {
      const state = reducer({ token: 'tok', permissions: { x: 1 } }, setPermissions(null))
      expect(state.permissions).toBeNull()
    })

    it('does not mutate token when setting permissions', () => {
      const initial: AuthState = { token: 'my-token', permissions: null }
      const state = reducer(initial, setPermissions({ role: 'user' }))
      expect(state.token).toBe('my-token')
    })
  })

  describe('immutability', () => {
    it('does not mutate the original state object', () => {
      const initial: AuthState = { token: 'original', permissions: null }
      const copy = { ...initial }
      reducer(initial, setToken('changed'))
      expect(initial).toEqual(copy)
    })
  })

  describe('selectors', () => {
    const mockState = (auth: AuthState): RootState => ({ auth }) as RootState

    describe('selectToken', () => {
      it('returns the current token', () => {
        expect(selectToken(mockState({ token: 'tok', permissions: null }))).toBe('tok')
      })

      it('returns null when no token is set', () => {
        expect(selectToken(mockState({ token: null, permissions: null }))).toBeNull()
      })
    })

    describe('selectPermissions', () => {
      it('returns the current permissions', () => {
        const perms = { admin: true }
        expect(selectPermissions(mockState({ token: null, permissions: perms }))).toEqual(perms)
      })

      it('returns null when no permissions are set', () => {
        expect(selectPermissions(mockState({ token: null, permissions: null }))).toBeNull()
      })
    })
  })
})

import { checkPermission, getSignInRedirectUrl } from '../authUtils'

describe('Auth utils', () => {
  describe('checkPermission', () => {
    describe('Super Admin user', () => {
      const config = {
        superAdmin: true,
        permissions: [],
        write: true,
        caps: [],
      }
      test('can access cap', () => {
        expect(
          checkPermission(config, {
            cap: 'features',
          }),
        ).toBe(true)
      })
      test('can access permission', () => {
        expect(
          checkPermission(config, {
            perm: 'features:rw',
          }),
        ).toBe(true)
        expect(
          checkPermission(config, {
            perm: 'features:r',
          }),
        ).toBe(true)
      })
      test('can access write', () => {
        expect(
          checkPermission(config, {
            write: true,
          }),
        ).toBe(true)
      })
    })
    describe('User with write access', () => {
      const config = {
        superAdmin: false,
        permissions: ['miner:rw', 'container:r'],
        write: true,
        caps: ['miner', 'container'],
      }

      test('can access allowed cap', () => {
        expect(
          checkPermission(config, {
            cap: 'miner',
          }),
        ).toBe(true)
      })

      test('can not access cap outside of allowed caps', () => {
        expect(
          checkPermission(config, {
            cap: 'electricity',
          }),
        ).toBe(false)
      })

      test('can access allowed permission', () => {
        expect(
          checkPermission(config, {
            perm: 'container:r',
          }),
        ).toBe(true)
        expect(
          checkPermission(config, {
            perm: 'miner:rw',
          }),
        ).toBe(true)
      })

      test('can not access permissions outside allowed permission', () => {
        expect(
          checkPermission(config, {
            perm: 'container:rw',
          }),
        ).toBe(false)
        expect(
          checkPermission(config, {
            perm: 'container:w',
          }),
        ).toBe(false)
        expect(
          checkPermission(config, {
            perm: 'electricity:rw',
          }),
        ).toBe(false)
      })

      test('can access write', () => {
        expect(
          checkPermission(config, {
            write: true,
          }),
        ).toBe(true)
      })
    })
    describe('User without write access', () => {
      const config = {
        superAdmin: false,
        permissions: ['miner:rw', 'container:r'],
        write: false,
        caps: ['miner', 'container'],
      }

      test('can access allowed cap', () => {
        expect(
          checkPermission(config, {
            cap: 'miner',
          }),
        ).toBe(true)
      })

      test('can not access cap outside of allowed caps', () => {
        expect(
          checkPermission(config, {
            cap: 'electricity',
          }),
        ).toBe(false)
      })

      test('can access allowed permission', () => {
        expect(
          checkPermission(config, {
            perm: 'container:r',
          }),
        ).toBe(true)
        expect(
          checkPermission(config, {
            perm: 'miner:rw',
          }),
        ).toBe(true)
        expect(
          checkPermission(config, {
            perm: 'miner:r',
          }),
        ).toBe(true)
      })

      test('can not access permissions outside allowed permission', () => {
        expect(
          checkPermission(config, {
            perm: 'container:rw',
          }),
        ).toBe(false)
        expect(
          checkPermission(config, {
            perm: 'container:w',
          }),
        ).toBe(false)
        expect(
          checkPermission(config, {
            perm: 'electricity:rw',
          }),
        ).toBe(false)
        expect(
          checkPermission(config, {
            perm: 'miner:pq',
          }),
        ).toBe(false)
      })

      test('can not access write', () => {
        expect(
          checkPermission(config, {
            write: true,
          }),
        ).toBe(false)
      })
    })
  })

  describe('checkPermission with null/undefined config', () => {
    it('returns false when config is null', () => {
      expect(checkPermission(null, { perm: 'miner:r' })).toBe(false)
    })

    it('returns false when config is undefined', () => {
      expect(checkPermission(undefined, { perm: 'miner:r' })).toBe(false)
    })

    it('returns false when no check is specified', () => {
      expect(checkPermission({ superAdmin: false }, {})).toBe(false)
    })
  })
})

describe('getSignInRedirectUrl', () => {
  it('returns "/" for empty/null token', () => {
    expect(getSignInRedirectUrl(null)).toBe('/')
    expect(getSignInRedirectUrl('')).toBe('/')
    expect(getSignInRedirectUrl(undefined)).toBe('/')
  })

  it('returns "/" for a token with no special role', () => {
    // A valid-ish JWT-style token but with a role that doesn't trigger redirect
    const tokenWithUnknownRole = btoa(JSON.stringify({ roles: ['admin'] }))
    const fakeToken = `header.${tokenWithUnknownRole}.sig`
    const result = getSignInRedirectUrl(fakeToken)
    expect(result).toBe('/')
  })
})

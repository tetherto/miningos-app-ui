import { getRolesFromAuthToken } from '../tokenUtils'

const b64url = (obj: object): string =>
  Buffer.from(JSON.stringify(obj)).toString('base64url')

// jwt-decode does not verify signatures, so we can hand-craft tokens.
const buildJwt = (payload: object): string =>
  `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.signature-ignored`

describe('getRolesFromAuthToken', () => {
  it('returns [] for undefined input', () => {
    expect(getRolesFromAuthToken(undefined)).toStrictEqual([])
  })

  it('returns [] for empty string', () => {
    expect(getRolesFromAuthToken('')).toStrictEqual([])
  })

  it('returns [] for a malformed token', () => {
    expect(getRolesFromAuthToken('not-a-jwt')).toStrictEqual([])
  })

  it('returns [] when the JWT has no roles claim', () => {
    const token = buildJwt({ sub: 30, exp: 9999999999 })
    expect(getRolesFromAuthToken(token)).toStrictEqual([])
  })

  it('returns the roles array when present in the JWT payload', () => {
    const token = buildJwt({
      sub: 30,
      roles: ['admin', 'site_manager'],
      exp: 9999999999,
    })
    expect(getRolesFromAuthToken(token)).toStrictEqual(['admin', 'site_manager'])
  })
})

import { getRolesFromAuthToken } from '../tokenUtils'

describe('getRolesFromAuthToken', () => {
  it('should return the correct roles present in the token', () => {
    const token = 'pub:api:ba932f37-34d2-4784-b9d3-350be798cc91-30-roles:admin:site_manager'
    const roles = getRolesFromAuthToken(token)
    expect(roles).toStrictEqual(['admin', 'site_manager'])
  })
})

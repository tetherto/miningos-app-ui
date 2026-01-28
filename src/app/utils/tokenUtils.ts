import _compact from 'lodash/compact'
import _nth from 'lodash/nth'
import _split from 'lodash/split'

export function getRolesFromAuthToken(authToken?: string): string[] {
  const rolesMatch = authToken?.match(/roles:([a-z_*:]*)/)
  return _compact(_split(_nth(rolesMatch, 1), ':'))
}

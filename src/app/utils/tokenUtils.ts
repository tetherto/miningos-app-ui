import { jwtDecode } from 'jwt-decode'

interface AuthTokenPayload {
  roles?: string[]
}

export function getRolesFromAuthToken(authToken?: string): string[] {
  if (!authToken) return []
  try {
    const { roles } = jwtDecode<AuthTokenPayload>(authToken)
    return Array.isArray(roles) ? roles : []
  } catch {
    return []
  }
}

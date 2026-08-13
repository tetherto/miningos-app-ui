import { AUTH_LEVELS, AUTH_PERMISSIONS, USER_ROLE } from '../../../constants/permissions.constants'

export const USER_ROLES = [
  {
    label: 'Admin',
    value: USER_ROLE.ADMIN,
  },
  {
    label: 'Reporting Tool Manager',
    value: USER_ROLE.REPORTING_TOOL_MANAGER,
  },
  {
    label: 'Site Manager',
    value: USER_ROLE.SITE_MANAGER,
  },
  {
    label: 'Site Operator',
    value: USER_ROLE.SITE_OPERATOR,
  },
  {
    label: 'Field Operator',
    value: USER_ROLE.FIELD_OPERATOR,
  },
  {
    label: 'Repair Technician',
    value: USER_ROLE.REPAIR_TECHNICIAN,
  },
  {
    label: 'Read Only User',
    value: USER_ROLE.READ_ONLY,
  },
]

export const MULTI_SITE_USER_ROLES = [
  {
    label: 'Admin',
    value: USER_ROLE.ADMIN,
  },
  {
    label: 'Read Only User',
    value: USER_ROLE.READ_ONLY,
  },
]

export const usersWritePermission = `${AUTH_PERMISSIONS.USERS}:${AUTH_LEVELS.WRITE}`
export const usersReadPermission = `${AUTH_PERMISSIONS.USERS}:${AUTH_LEVELS.READ}`

export const ERROR_CODES = {
  ERR_USER_EXISTS: 'User already exists',
  ERR_AUTH_FAIL_NO_PERMS: 'Not permitted',
  DEFAULT: 'An error occurred',
}

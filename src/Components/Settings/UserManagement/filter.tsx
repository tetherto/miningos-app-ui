import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _toLower from 'lodash/toLower'

interface User {
  email: string
  role: string
  [key: string]: unknown
}

interface FilterUsersParams {
  users: User[]
  email: string | null | undefined
  role: string | null | undefined
}

export const filterUsers = ({ users, email, role }: FilterUsersParams) =>
  _filter(users, (user: User) => {
    let match = true
    if (!_isEmpty(email) && email) {
      match = match && _includes(_toLower(user.email), _toLower(email))
    }
    if (!_isEmpty(role) && role) {
      match = match && user.role === role
    }
    return match
  })

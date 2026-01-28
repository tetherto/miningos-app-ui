import { filterUsers } from './filter'

describe('filterUser', () => {
  const users = [
    {
      id: 1,
      email: 'test1@test.com',
      role: 'admin',
    },
    {
      id: 2,
      email: 'test2@test.com',
      role: 'read_only_user',
    },
  ]

  it('should return all users when no filter is provided', () => {
    const filteredUsers = filterUsers({
      users,
      email: '',
      role: null,
    })
    expect(filteredUsers).toStrictEqual(users)
  })

  it('should filter users by partial email', () => {
    const filteredUsers = filterUsers({
      users,
      email: 'test',
      role: null,
    })
    expect(filteredUsers).toStrictEqual(users)
  })

  it('should filter users by email', () => {
    const filteredUsers = filterUsers({
      users,
      email: 'test2@test.com',
      role: null,
    })
    expect(filteredUsers).toStrictEqual(users.slice(1))
  })

  it('should filter users by role', () => {
    const filteredUsers = filterUsers({
      users,
      email: '',
      role: 'read_only_user',
    })
    expect(filteredUsers).toStrictEqual(users.slice(1))
  })

  it('should filter users by both email and role', () => {
    const filteredUsers = filterUsers({
      users,
      email: 'test2@test.com',
      role: 'read_only_user',
    })
    expect(filteredUsers).toStrictEqual(users.slice(1))
  })

  it('should not return users when no match occurs', () => {
    const filteredUsers = filterUsers({
      users,
      email: 'test3@test.com',
      role: 'read_only_user',
    })
    expect(filteredUsers).toStrictEqual([])
  })
})

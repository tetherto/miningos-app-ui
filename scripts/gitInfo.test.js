import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockExecSync = vi.fn()

vi.mock('child_process', () => ({
  default: { execSync: mockExecSync },
  execSync: mockExecSync,
}))

vi.mock('lodash', () => ({
  default: { trim: (str) => str?.trim() },
}))

const { getGitInfo } = await import('./gitInfo.js')

describe('getGitInfo', () => {
  beforeEach(() => {
    mockExecSync.mockReset()
  })

  it('returns git info with prefix "public" on success', () => {
    mockExecSync
      .mockReturnValueOnce({ toString: () => '  main  ' })
      .mockReturnValueOnce({ toString: () => '  abc1234  ' })
      .mockReturnValueOnce({ toString: () => '  Mon Apr 13 2026  ' })

    expect(getGitInfo()).toEqual({
      prefix: 'public',
      branch: 'main',
      hash: 'abc1234',
      date: 'Mon Apr 13 2026',
    })
  })

  it('returns fallback values with prefix "public" when execSync throws', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('git not found')
    })

    const result = getGitInfo()

    expect(result.prefix).toBe('public')
    expect(result.branch).toBe('unknown')
    expect(result.hash).toBe('unknown')
    expect(typeof result.date).toBe('string')
  })
})

import { execSync } from 'child_process'

// eslint-disable-next-line lodash/import-scope
import _ from 'lodash'

// Function to get git info similar to react-git-info
export const getGitInfo = () => {
  try {
    const branch = _.trim(execSync('git rev-parse --abbrev-ref HEAD').toString())
    const hash = _.trim(execSync('git rev-parse HEAD').toString())
    const date = _.trim(execSync('git log -1 --format=%cd').toString())

    return { branch, hash, date }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating git info:', error)
    // Return fallback values
    return {
      branch: 'unknown',
      hash: 'unknown',
      date: new Date().toString(),
    }
  }
}

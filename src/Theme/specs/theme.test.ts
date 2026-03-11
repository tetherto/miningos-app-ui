import { describe, it, expect } from 'vitest'

import { getConfig } from '../AntdConfig'
import { DarkTheme } from '../DarkTheme'
import { GlobalStyle } from '../GlobalStyle'

describe('DarkTheme', () => {
  it('exports DarkTheme with expected color properties', () => {
    expect(DarkTheme).toBeDefined()
    expect(typeof DarkTheme.background).toBe('string')
    expect(typeof DarkTheme.textPrimary).toBe('string')
    expect(typeof DarkTheme.success).toBe('string')
    expect(typeof DarkTheme.error).toBe('string')
  })

  it('has all required theme sections', () => {
    expect(DarkTheme.buttonPrimary).toBeDefined()
    expect(DarkTheme.tableBackground).toBeDefined()
    expect(DarkTheme.iconGrey).toBeDefined()
    expect(DarkTheme.sideBarActiveItem).toBeDefined()
  })
})

describe('GlobalStyle', () => {
  it('exports a styled-component GlobalStyle', () => {
    expect(GlobalStyle).toBeDefined()
  })
})

describe('AntdConfig', () => {
  it('getConfig returns a valid config for dark mode', () => {
    const config = getConfig('dark')
    expect(config).toBeDefined()
    expect(config.token?.colorPrimary).toBeDefined()
    expect(config.hashed).toBe(false)
  })

  it('getConfig returns a valid config for light mode', () => {
    const config = getConfig('light')
    expect(config).toBeDefined()
    expect(config.token?.colorPrimary).toBeDefined()
  })

  it('dark and light configs use different algorithms', () => {
    const darkConfig = getConfig('dark')
    const lightConfig = getConfig('light')
    expect(darkConfig.algorithm).not.toBe(lightConfig.algorithm)
  })
})

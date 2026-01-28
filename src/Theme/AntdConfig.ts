import type { ThemeConfig } from 'antd/es/config-provider'
import theme from 'antd/es/theme'

import { COLOR } from '@/constants/colors'

const { darkAlgorithm, defaultAlgorithm } = theme

export const getConfig = (mode: 'light' | 'dark'): ThemeConfig => ({
  algorithm: [mode === 'dark' ? darkAlgorithm : defaultAlgorithm],
  token: {
    colorPrimary: COLOR.COLD_ORANGE,
  },
  cssVar: {
    // Enable CSS variables for better tree-shaking and smaller bundle size
    prefix: 'ant',
  },
  hashed: false, // Disable hashed class names for better CSS optimization
})

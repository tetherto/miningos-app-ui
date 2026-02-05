import '@ant-design/v5-patch-for-react-19'
import AntdApp from 'antd/es/app'
import ConfigProvider from 'antd/es/config-provider'
import enUS from 'antd/es/locale/en_US'
import { useSelector } from 'react-redux'
import { RouterProvider } from 'react-router/dom'
import { ThemeProvider } from 'styled-components'

import { getMultiSiteRouter } from './router/multiSiteRouter'
import { getSingleSiteRouter } from './router/singleSiteRouter'
import { getConfig } from './Theme/AntdConfig'
import { DarkTheme } from './Theme/DarkTheme'
import { GlobalStyle } from './Theme/GlobalStyle'

import { CloseAllNotifications } from '@/Components/CloseAllNotifications/CloseAllNotifications'
import { Spinner } from '@/Components/Spinner/Spinner'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import type { RootState } from '@/types'

const App = () => {
  const theme = useSelector((state: RootState) => state.theme)
  const { isMultiSiteModeEnabled, isLoading } = useMultiSiteMode()
  const router = isMultiSiteModeEnabled ? getMultiSiteRouter() : getSingleSiteRouter()

  return (
    <ConfigProvider theme={getConfig(theme.value)} locale={enUS}>
      <AntdApp>
        <ThemeProvider theme={DarkTheme}>
          <GlobalStyle />
          {/* Don't add future={{ v7_startTransition: true }} !!! it breaks the useNavigate hook!!! */}
          {isLoading ? <Spinner /> : <RouterProvider router={router} />}
          <CloseAllNotifications />
        </ThemeProvider>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App

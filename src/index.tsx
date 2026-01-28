import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import App from './App'
import { persistor, store } from './app/store'
import './index.css'

// Only load Sentry in production to reduce dev bundle size
if (import.meta.env.PROD) {
  import('./initSentry')
}

const initApp = (): void => {
  // Preserve GIT_INFO logging in production by using indirect reference
  // eslint-disable-next-line
  ;(window.console?.table || console.log)?.call(console, GIT_INFO)

  const container = document.getElementById('root')
  if (!container) throw new Error('Root element not found')

  const root = createRoot(container)

  root.render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <App />
        </PersistGate>
      </Provider>
    </StrictMode>,
  )
}

initApp()

import { Outlet, ScrollRestoration } from 'react-router-dom'

export const RootLayout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
)

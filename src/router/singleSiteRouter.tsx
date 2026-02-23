import type { ComponentType } from 'react'
import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RootLayout } from './RootLayout'

import { isDemoMode } from '@/app/services/api.utils'
import { SuspenseWrapper } from '@/Components/SuspenseWrapper/SuspenseWrapper'

interface PoolManagerMinerExplorerModule {
  PoolManagerMinerExplorer: ComponentType
}

const PoolManagerMinerExplorer = lazy(() =>
  import('@/Views/PoolManager/PoolManagerMinerExplorer/PoolManagerMinerExplorer').then(
    (module: PoolManagerMinerExplorerModule) => ({
      default: module.PoolManagerMinerExplorer,
    }),
  ),
)
const Layout = lazy(() => import('@/Views/Layout/Layout'))
const SiteOverviewDetails = lazy(
  () => import('@/Views/PoolManager/SiteOverviewDetails/SiteOverviewDetails'),
)
const SitesOverview = lazy(() => import('@/Views/PoolManager/SitesOverview/SitesOverview'))
const Dashboard = lazy(() => import('@/Views/Dashboard/Dashboard'))
const SignIn = lazy(() => import('@/Views/SignIn/SignIn'))
const SignOut = lazy(() => import('@/Views/SignOut/SignOut'))
const Explorer = lazy(() => import('@/Views/Explorer/Explorer'))
const Settings = lazy(() => import('@/Views/Settings/Settings'))
const Thing = lazy(() => import('@/Views/Explorer/Things/Thing'))
const Things = lazy(() => import('@/Views/Explorer/Things/Things'))
const OperationsDashboard = lazy(() => import('@/Views/Reports/OperationsDashboard'))
const OperationsEfficiency = lazy(
  () => import('@/Views/Reports/OperationsEfficiency/OperationsEfficiency'),
)
const InventoryDashboard = lazy(() => import('@/Views/Inventory/Dashboard'))
const InventorySpareParts = lazy(() => import('@/Views/Inventory/SpareParts/SpareParts'))
const InventoryRepairs = lazy(() => import('@/Views/Inventory/Repairs/Repairs'))
const InventoryMiners = lazy(() => import('@/Views/Inventory/Miners/Miners'))
const InventoryHistoricalMovements = lazy(
  () => import('@/Views/Inventory/HistoricalMovements/HistoricalMovements'),
)
const PoolManagerLayout = lazy(() => import('@/Views/PoolManager/PoolManagerLayout'))
const PoolManagerDashboard = lazy(() => import('@/Views/PoolManager/PoolManagerDashboard'))
const PoolManagerPools = lazy(() => import('@/Views/PoolManager/Pools/PoolManagerPools'))
const ContainerWidgets = lazy(() => import('@/Views/ContainerWidgets/ContainerWidgets'))
const ContainerCharts = lazy(() => import('@/Views/ContainersChart/ContainerCharts'))
const Cabinet = lazy(() => import('@/Views/Cabinet/Cabinet'))
const LVCabinetWidgets = lazy(() => import('@/Views/LVCabinetWidgets/LVCabinetWidgets'))
const Alerts = lazy(() => import('@/Views/Alerts/Alerts'))
const ReportsLayout = lazy(() => import('@/Views/Reports/ReportsLayout'))
const Comments = lazy(() => import('@/Views/Comments/Comments'))
const SingleDeviceCommentsHistoryView = lazy(
  () => import('@/Views/Comments/SingleDeviceCommentsHistoryView'),
)
// Financial Reports Components
const Cost = lazy(() => import('@/Views/Financial/Cost/Cost'))
const SubsidyFee = lazy(() => import('@/Views/Financial/SubsidyFee/SubsidyFee'))
const Ebitda = lazy(() => import('@/Views/Financial/EBITDA/EBITDA'))
const RevenueSummary = lazy(() => import('@/Views/Financial/RevenueSummary/RevenueSummary'))
const EnergyRevenue = lazy(() => import('@/MultiSiteViews/RevenueAndCost/EnergyRevenue'))
const InventoryLayout = lazy(() => import('@/Views/Inventory/InventoryLayout'))
const ExplorerLayout = lazy(() => import('@/Views/Explorer/ExplorerLayout'))
const CommentsLayout = lazy(() => import('@/Views/Comments/CommentsLayout'))
const AlertsLayout = lazy(() => import('@/Views/Alerts/AlertsLayout'))
const NotFoundPage = lazy(() => import('@/Views/NotFoundPage/NotFoundPage'))
const EnergyReport = lazy(() => import('@/Views/Reports/EnergyReport/EnergyReport'))
const MinersReport = lazy(() => import('@/Views/Reports/Miners/MinersReport'))
const HashBalance = lazy(() => import('@/Views/Financial/HashBalance/HashBalance'))
const CostInput = lazy(() => import('@/Views/Financial/CostInput/CostInput'))
const EnergyBalance = lazy(() => import('@/Views/Financial/EnergyBalance/EnergyBalance'))
const Hashrate = lazy(() => import('@/Views/Reports/Hashrate/Hashrate'))

export const getSingleSiteRouter = () =>
  createBrowserRouter(
    [
      {
        element: <RootLayout />,
        children: [
          {
            path: '/',
            element: <SuspenseWrapper component={Layout} />,
            children: [
              { index: true, element: <SuspenseWrapper component={Dashboard} /> },
              {
                path: 'operations',
                children: [
                  {
                    index: true,
                    element: (
                      <Navigate
                        to={isDemoMode ? '/operations/mining' : '/operations/energy'}
                        replace
                      />
                    ),
                  },
                  ...(isDemoMode
                    ? []
                    : [
                        {
                          path: 'energy',
                          children: [
                            {
                              index: true,
                              element: <SuspenseWrapper component={LVCabinetWidgets} />,
                            },
                          ],
                        },
                      ]),
                  {
                    path: 'mining',
                    children: [
                      {
                        index: true,
                        element: (
                          <Navigate to="/operations/mining/explorer?tab=container" replace />
                        ),
                      },
                      {
                        path: 'site-overview',
                        children: [
                          { index: true, element: <Navigate to="container-widgets" replace /> },
                          {
                            path: 'container-widgets',
                            element: <SuspenseWrapper component={ContainerWidgets} />,
                          },
                          ...(isDemoMode
                            ? []
                            : [
                                {
                                  path: 'container-charts',
                                  element: <SuspenseWrapper component={ContainerCharts} />,
                                },
                              ]),
                        ],
                      },
                      {
                        path: 'explorer',
                        element: <SuspenseWrapper component={ExplorerLayout} />,
                        children: [
                          { index: true, element: <SuspenseWrapper component={Explorer} /> },
                          {
                            path: ':tag',
                            children: [
                              { index: true, element: <SuspenseWrapper component={Things} /> },
                              {
                                path: ':id/:tab?/:flow?',
                                element: <SuspenseWrapper component={Thing} />,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        path: 'container-charts',
                        element: <SuspenseWrapper component={ContainerCharts} />,
                      },
                    ],
                  },
                ],
              },
              // Backward compatibility redirects
              {
                path: 'explorer',
                element: <Navigate to="/operations/mining/explorer" replace />,
              },
              {
                path: 'containers',
                element: <Navigate to="/operations/mining/site-overview" replace />,
              },
              {
                path: 'cabinet-widgets',
                element: <Navigate to="/operations/energy" replace />,
              },
              {
                path: 'cabinets/:id',
                children: [{ index: true, element: <SuspenseWrapper component={Cabinet} /> }],
              },
              {
                path: 'inventory',
                element: <SuspenseWrapper component={InventoryLayout} />,
                children: [
                  { path: '', element: <Navigate to="dashboard" replace /> },
                  {
                    path: 'dashboard',
                    element: <SuspenseWrapper component={InventoryDashboard} />,
                  },
                  /**
                   * Not implemented yet
                   */
                  // { path: 'dry-coolers', element: <SuspenseWrapper component={InventoryDryCooler} /> },
                  /**
                   * Not implemented yet
                   */
                  // {
                  //   path: 'container',
                  //   element: <SuspenseWrapper component={InventoryContainerList} />,
                  // },
                  {
                    path: 'spare-parts',
                    element: <SuspenseWrapper component={InventorySpareParts} />,
                  },
                  { path: 'miners', element: <SuspenseWrapper component={InventoryMiners} /> },
                  { path: 'repairs', element: <SuspenseWrapper component={InventoryRepairs} /> },
                  /**
                   * Not implemented yet
                   */
                  // { path: 'shipping', element: <SuspenseWrapper component={InventoryShipping} /> },
                  {
                    path: 'movements',
                    element: <SuspenseWrapper component={InventoryHistoricalMovements} />,
                  },
                  {
                    path: 'movements/:deviceId',
                    element: <SuspenseWrapper component={InventoryHistoricalMovements} />,
                  },
                ],
              },
              {
                path: 'pool-manager',
                element: <SuspenseWrapper component={PoolManagerLayout} />,
                children: [
                  { path: '', element: <Navigate to="dashboard" replace /> },
                  {
                    path: 'dashboard',
                    element: <SuspenseWrapper component={PoolManagerDashboard} />,
                  },
                  {
                    path: 'pool-endpoints',
                    element: <SuspenseWrapper component={PoolManagerPools} />,
                  },
                  {
                    path: 'sites-overview',
                    element: <SuspenseWrapper component={SitesOverview} />,
                  },
                  {
                    path: 'sites-overview/:unit',
                    element: <SuspenseWrapper component={SiteOverviewDetails} />,
                  },
                  {
                    path: 'miner-explorer',
                    element: <SuspenseWrapper component={PoolManagerMinerExplorer} />,
                  },
                ],
              },
              {
                path: 'reports',
                element: <SuspenseWrapper component={ReportsLayout} />,
                children: [
                  { index: true, element: <Navigate to="/reports/operations/dashboard" replace /> },
                  {
                    path: 'operations',
                    children: [
                      { index: true, element: <Navigate to="dashboard" replace /> },
                      {
                        path: 'dashboard',
                        element: <SuspenseWrapper component={OperationsDashboard} />,
                      },
                      {
                        path: 'hashrate',
                        element: <SuspenseWrapper component={Hashrate} />,
                      },
                      { path: 'energy', element: <SuspenseWrapper component={EnergyReport} /> },
                      { path: 'miners', element: <SuspenseWrapper component={MinersReport} /> },
                      {
                        path: 'efficiency',
                        element: <SuspenseWrapper component={OperationsEfficiency} />,
                      },
                    ],
                  },
                  {
                    path: 'financial',
                    children: [
                      { index: true, element: <Navigate to="revenue-summary" replace /> },
                      {
                        path: 'revenue-summary',
                        element: <SuspenseWrapper component={RevenueSummary} />,
                      },
                      {
                        path: 'cost-summary',
                        element: <SuspenseWrapper component={Cost} />,
                      },
                      {
                        path: 'ebitda',
                        element: <SuspenseWrapper component={Ebitda} />,
                      },
                      {
                        path: 'subsidy-fee',
                        element: <SuspenseWrapper component={SubsidyFee} />,
                      },
                      {
                        path: 'energy-revenue-cost',
                        element: <SuspenseWrapper component={EnergyRevenue} />,
                      },
                      {
                        path: 'hash-balance',
                        element: <SuspenseWrapper component={HashBalance} />,
                      },
                      {
                        path: 'cost-input',
                        element: <SuspenseWrapper component={CostInput} />,
                      },
                      {
                        path: 'energy-balance',
                        element: <SuspenseWrapper component={EnergyBalance} />,
                      },
                    ],
                  },
                ],
              },
              // Backward compatibility redirect
              {
                path: 'reporting-tool',
                element: <Navigate to="/reports" replace />,
              },
              ...(isDemoMode
                ? []
                : [
                    {
                      path: 'comments',
                      element: <SuspenseWrapper component={CommentsLayout} />,
                      children: [
                        {
                          index: true,
                          element: <SuspenseWrapper component={Comments} />,
                        },
                        {
                          path: ':id',
                          element: <SuspenseWrapper component={SingleDeviceCommentsHistoryView} />,
                        },
                      ],
                    },
                  ]),
              {
                path: 'settings',
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  ...(isDemoMode
                    ? []
                    : [
                        {
                          path: 'dashboard',
                          element: <SuspenseWrapper component={Settings} />,
                        },
                      ]),
                ],
              },
              {
                path: 'alerts',
                element: <SuspenseWrapper component={AlertsLayout} />,
                children: [
                  { index: true, element: <SuspenseWrapper component={Alerts} /> },
                  { path: ':id', element: <SuspenseWrapper component={Alerts} /> },
                ],
              },
            ],
          },
          { path: 'signin', element: <SuspenseWrapper component={SignIn} /> },
          { path: 'signout', element: <SuspenseWrapper component={SignOut} /> },
          { path: '*', element: <SuspenseWrapper component={NotFoundPage} /> },
        ],
      },
    ],
    { basename: import.meta.env.VITE_BASE_URL ?? '/' },
  )

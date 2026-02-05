import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import { lazyWithNoFeatures } from '@/Components/NoFeaturesRestriction/NoFeaturesRestriction'
import { SuspenseWrapper } from '@/Components/SuspenseWrapper/SuspenseWrapper'

const Layout = lazy(() => import('@/Views/Layout/Layout'))
const UserManagement = lazyWithNoFeatures(() => import('@/Views/Settings/UserManagement'))
const Dashboard = lazy(() => import('@/MultiSiteViews/Dashboard/Dashboard'))
const SiteOperations = lazy(() => import('@/MultiSiteViews/SiteOperations/SiteOperations'))
const SiteOperationsHashrate = lazy(
  () => import('@/MultiSiteViews/SiteOperations/SiteOperations.hashrate'),
)
const SiteOperationsEfficiency = lazy(
  () => import('@/MultiSiteViews/SiteOperations/SiteOperations.efficiency'),
)
const SiteOperationsMiners = lazy(
  () => import('@/MultiSiteViews/SiteOperations/SiteOperations.miners'),
)
const SiteOperationsPowerConsumption = lazy(
  () => import('@/MultiSiteViews/SiteOperations/SiteOperations.PowerConsumption'),
)
const Reports = lazy(() => import('@/MultiSiteViews/Reports/Reports'))
const Report = lazy(() => import('@/MultiSiteViews/Report/Report'))
const SiteReportsLayout = lazy(() => import('@/MultiSiteViews/SiteReportsLayout/SiteReportsLayout'))
const NotFoundPage = lazy(() => import('@/Views/NotFoundPage/NotFoundPage'))
const SignIn = lazy(() => import('@/Views/SignIn/SignIn'))
const SignOut = lazy(() => import('@/Views/SignOut/SignOut'))
const Ebitda = lazy(() => import('@/MultiSiteViews/RevenueAndCost/Ebitda/Ebitda'))
const Revenue = lazy(() => import('@/MultiSiteViews/RevenueAndCost/Revenue'))
const Cost = lazy(() => import('@/MultiSiteViews/RevenueAndCost/Cost/CostMultiSite'))
const SubsidyFee = lazy(() => import('@/MultiSiteViews/RevenueAndCost/SubsidyFee'))
const EnergyRevenue = lazy(() => import('@/MultiSiteViews/RevenueAndCost/EnergyRevenue'))
const EnergyCost = lazy(() => import('@/MultiSiteViews/RevenueAndCost/EnergyCost'))
const HashRevenue = lazy(() => import('@/MultiSiteViews/RevenueAndCost/HashRevenue'))
const HashCost = lazy(() => import('@/MultiSiteViews/RevenueAndCost/HashCost'))
const RevenuePerMonth = lazy(() => import('@/MultiSiteViews/Dashboard/RevenuePerMonth'))
const BtcProduction = lazy(() => import('@/MultiSiteViews/Dashboard/BtcProduction'))
const Hashrate = lazy(() => import('@/MultiSiteViews/Dashboard/Hashrate'))
const MonthlyAvgDowntime = lazy(() => import('@/MultiSiteViews/Dashboard/MonthlyAvgDowntime'))
const CostInput = lazy(() => import('@/MultiSiteViews/RevenueAndCost/CostInput/CostInput'))

export const getMultiSiteRouter = () =>
  createBrowserRouter(
    [
      {
        path: '/',
        element: <SuspenseWrapper component={Layout} />,
        children: [
          { index: true, element: <SuspenseWrapper component={Dashboard} /> },
          {
            path: 'dashboard',
            children: [
              { index: true, element: <SuspenseWrapper component={Dashboard} /> },
              {
                path: 'revenue',
                element: <SuspenseWrapper component={RevenuePerMonth} />,
              },
              {
                path: 'btc-production-cost',
                element: <SuspenseWrapper component={BtcProduction} />,
              },
              {
                path: 'hashrate',
                element: <SuspenseWrapper component={Hashrate} />,
              },
              {
                path: 'monthly-avg-downtime',
                element: <SuspenseWrapper component={MonthlyAvgDowntime} />,
              },
            ],
          },
          {
            path: 'revenue-and-cost',
            children: [
              {
                path: 'revenue',
                element: <SuspenseWrapper component={Revenue} />,
              },
              {
                path: 'cost',
                element: <SuspenseWrapper component={Cost} />,
              },
              {
                path: 'cost-input',
                element: <SuspenseWrapper component={CostInput} />,
              },
            ],
          },
          {
            path: 'site-operations',
            children: [
              { index: true, element: <SuspenseWrapper component={SiteOperations} /> },
              { path: 'dashboard', element: <SuspenseWrapper component={SiteOperations} /> },
              { path: 'hashrate', element: <SuspenseWrapper component={SiteOperationsHashrate} /> },
              {
                path: 'efficiency',
                element: <SuspenseWrapper component={SiteOperationsEfficiency} />,
              },
              { path: 'miners', element: <SuspenseWrapper component={SiteOperationsMiners} /> },
              {
                path: 'power-consumption',
                element: <SuspenseWrapper component={SiteOperationsPowerConsumption} />,
              },
            ],
          },
          {
            path: 'site-reports',
            element: <SuspenseWrapper component={SiteReportsLayout} />,
            children: [
              { index: true, element: <SuspenseWrapper component={Reports} /> },
              { path: 'report', element: <SuspenseWrapper component={Report} /> },
            ],
          },
          {
            path: 'sites/:siteId',
            children: [
              {
                index: true,
                element: <SuspenseWrapper component={Dashboard} />,
              },
              {
                path: 'dashboard',
                children: [
                  { index: true, element: <SuspenseWrapper component={Dashboard} /> },
                  {
                    path: 'revenue',
                    element: <SuspenseWrapper component={RevenuePerMonth} />,
                  },
                  {
                    path: 'btc-production-cost',
                    element: <SuspenseWrapper component={BtcProduction} />,
                  },
                  { path: 'hashrate', element: <SuspenseWrapper component={Hashrate} /> },
                  {
                    path: 'monthly-avg-downtime',
                    element: <SuspenseWrapper component={MonthlyAvgDowntime} />,
                  },
                ],
              },
              {
                path: 'revenue-and-cost',
                children: [
                  { index: true, element: <SuspenseWrapper component={Revenue} /> },
                  { path: 'ebitda', element: <SuspenseWrapper component={Ebitda} /> },
                  { path: 'subsidy-fee', element: <SuspenseWrapper component={SubsidyFee} /> },
                  {
                    path: 'energy-revenue',
                    element: <SuspenseWrapper component={EnergyRevenue} />,
                  },
                  { path: 'energy-cost', element: <SuspenseWrapper component={EnergyCost} /> },
                  { path: 'hash-revenue', element: <SuspenseWrapper component={HashRevenue} /> },
                  { path: 'hash-cost', element: <SuspenseWrapper component={HashCost} /> },
                  {
                    path: 'cost-input',
                    element: <SuspenseWrapper component={CostInput} />,
                  },
                ],
              },
              {
                path: 'site-operations',
                children: [
                  { index: true, element: <SuspenseWrapper component={SiteOperations} /> },
                  { path: 'dashboard', element: <SuspenseWrapper component={SiteOperations} /> },
                  {
                    path: 'hashrate',
                    element: <SuspenseWrapper component={SiteOperationsHashrate} />,
                  },
                  {
                    path: 'efficiency',
                    element: <SuspenseWrapper component={SiteOperationsEfficiency} />,
                  },
                  {
                    path: 'miners',
                    element: <SuspenseWrapper component={SiteOperationsMiners} />,
                  },
                  {
                    path: 'power-consumption',
                    element: <SuspenseWrapper component={SiteOperationsPowerConsumption} />,
                  },
                ],
              },
              {
                path: 'site-reports',
                element: <SuspenseWrapper component={SiteReportsLayout} />,
                children: [
                  { index: true, element: <SuspenseWrapper component={Reports} /> },
                  { path: 'report', element: <SuspenseWrapper component={Report} /> },
                ],
              },
            ],
          },
          {
            path: 'settings',
            children: [
              {
                index: true,
                element: <SuspenseWrapper component={UserManagement} />,
              },
            ],
          },
        ],
      },
      { path: 'signin', element: <SuspenseWrapper component={SignIn} /> },
      { path: 'signout', element: <SuspenseWrapper component={SignOut} /> },
      { path: '*', element: <SuspenseWrapper component={NotFoundPage} /> },
    ],
    { basename: import.meta.env.VITE_BASE_URL ?? '/' },
  )

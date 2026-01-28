import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'

import { actionsEndpoints } from './actions'
import { authEndpoints } from './auth'
import { btcDataEndpoints } from './btcData'
import { downtimeEndpoints } from './downtime'
import { financialEndpoints } from './financial'
import { globalEndpoints } from './global'
import { logsEndpoints } from './logs'
import { minersEndpoints } from './miners'
import { operationsEndpoints } from './operations'
import { reportsEndpoints } from './reports'
import { thingsEndpoints } from './things'
import { usersEndpoints } from './users'

export const createEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  ...authEndpoints(builder),
  ...logsEndpoints(builder),
  ...thingsEndpoints(builder),
  ...actionsEndpoints(builder),
  ...minersEndpoints(builder),
  ...operationsEndpoints(builder),
  ...btcDataEndpoints(builder),
  ...financialEndpoints(builder),
  ...downtimeEndpoints(builder),
  ...globalEndpoints(builder),
  ...usersEndpoints(builder),
  ...reportsEndpoints(builder),
})

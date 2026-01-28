import { useGetGlobalDataQuery } from '@/app/services/api'
import { ProductionCostResponse } from '@/types'

export function useProductionCosts() {
  // Production costs
  return useGetGlobalDataQuery<ProductionCostResponse>({ type: 'productionCosts' })
}

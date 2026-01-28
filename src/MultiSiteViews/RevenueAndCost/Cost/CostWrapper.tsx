import CostMultiSite from './CostMultiSite'
import CostSingleSite from './CostSingleSite'

import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

/**
 * Wrapper component that conditionally renders the appropriate Cost component
 * based on whether multi-site mode is enabled
 * - Multi-site mode: Renders CostMultiSite (uses useCostData hook)
 * - Single-site mode: Renders CostSingleSite (provides empty/default data)
 */
const CostWrapper = () => {
  const { isMultiSiteModeEnabled } = useMultiSiteMode()

  if (isMultiSiteModeEnabled) {
    return <CostMultiSite />
  }

  return <CostSingleSite />
}

export default CostWrapper

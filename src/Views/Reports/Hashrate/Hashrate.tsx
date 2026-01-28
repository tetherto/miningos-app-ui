import { useState } from 'react'

import MinerTypeView from './components/MinerTypeView'
import MiningUnitView from './components/MiningUnitView'
import SiteView from './components/SiteView'
import { PageRoot, StyledTabs } from './Hashrate.styles'
import type { HashrateTab } from './Hashrate.types'

const HASHRATE_TAB = {
  SITE: 'site',
  MINER_TYPE: 'minerType',
  MINING_UNIT: 'miningUnit',
} as const

const TAB_ITEMS = [
  { key: HASHRATE_TAB.SITE, label: 'Site View' },
  { key: HASHRATE_TAB.MINER_TYPE, label: 'Miner Type View' },
  { key: HASHRATE_TAB.MINING_UNIT, label: 'Mining Unit View' },
]

const Hashrate = () => {
  const [activeTab, setActiveTab] = useState<HashrateTab>(HASHRATE_TAB.SITE)

  const handleTabChange = (key: string) => {
    setActiveTab(key as HashrateTab)
  }

  return (
    <PageRoot>
      <StyledTabs activeKey={activeTab} onChange={handleTabChange} items={TAB_ITEMS} />

      {activeTab === HASHRATE_TAB.SITE && <SiteView />}

      {activeTab === HASHRATE_TAB.MINER_TYPE && <MinerTypeView />}

      {activeTab === HASHRATE_TAB.MINING_UNIT && <MiningUnitView />}
    </PageRoot>
  )
}

export default Hashrate

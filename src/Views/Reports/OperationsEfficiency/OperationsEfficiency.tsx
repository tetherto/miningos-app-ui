import Tabs from 'antd/es/tabs'
import { useState } from 'react'

import { tabs, VIEW_BY_TAB_TYPE } from './constants'
import { OperationsEfficiencyWrapper } from './OperationsEfficiency.styles'

const OperationsEfficiency = () => {
  const [activeTab, setActiveTab] = useState('site-view')

  const TabContentView = VIEW_BY_TAB_TYPE[activeTab]

  return (
    <OperationsEfficiencyWrapper>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabs}
        renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} />}
      />
      {TabContentView}
    </OperationsEfficiencyWrapper>
  )
}

export default OperationsEfficiency

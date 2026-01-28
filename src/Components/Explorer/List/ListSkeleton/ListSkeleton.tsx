import Skeleton from 'antd/es/skeleton'
import _times from 'lodash/times'
import { FC } from 'react'

import { DeviceCardContainer, ExplorerDeviceCardContainer } from '../ListView.styles'

const NO_SKELETON_ITEMS = 5
const SINGLE_LIST_ITEM_SKELETON_ITEMS = 13

const SingleListItemSkeleton: FC = () => (
  <ExplorerDeviceCardContainer $explorer>
    {_times(SINGLE_LIST_ITEM_SKELETON_ITEMS, (index: number) => (
      <Skeleton.Input active size="small" key={index} />
    ))}
  </ExplorerDeviceCardContainer>
)

const ListSkeleton: FC = () => (
  <DeviceCardContainer $explorer>
    {_times(NO_SKELETON_ITEMS, (index: number) => (
      <SingleListItemSkeleton key={index} />
    ))}
  </DeviceCardContainer>
)

export default ListSkeleton

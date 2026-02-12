import Skeleton from 'antd/es/skeleton'
import styled from 'styled-components'

import { flexCenterRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const RemovedLabel = styled.div`
  border: 1px solid ${COLOR.BRICK_RED};
  background: ${COLOR.BRICK_RED}33;
  padding: 4px;
  width: 150px;
  ${flexCenterRow};
`

export const AddedLabel = styled.div`
  border: 1px solid ${COLOR.EMERALD};
  background: ${COLOR.EMERALD}33;
  padding: 4px;
  width: 150px;
  ${flexCenterRow};
`

export const MinerCodeSkeleton = styled(Skeleton.Input)`
  width: 120px;

  .ant-skeleton-input {
    height: 20px;
    min-width: 120px;
  }
`

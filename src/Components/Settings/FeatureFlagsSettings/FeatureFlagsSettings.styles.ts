import Col from 'antd/es/col'
import styled from 'styled-components'

import { flexRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const AddFeatureFlagsContainer = styled.div`
  ${flexRow};
  gap: 12px;
`

export const FeatureFlagsOuterContainer = styled.div`
  padding: 20px;
`

export const DeleteIconContainer = styled.div`
  color: ${COLOR.BRICK_RED};
  cursor: pointer;
`

export const FeatureTogglesContainer = styled.div`
  margin-top: 40px;
`

export const SaveFeatureFlagsContainer = styled.div`
  margin-top: 40px;
`

export const StyledCol = styled(Col)`
  word-break: break-word;
`

export const ColSwitcher = styled(Col)`
  padding-left: 10px;
`

import Skeleton from 'antd/es/skeleton'
import styled from 'styled-components'

interface StyledProps {
  $paddingTop?: unknown
  $gap?: string | number
  $width?: string | number
  $height?: string | number
}

import { flexAlign, flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const StyledLineChartSkeletonContainer = styled.div<StyledProps>`
  width: 100%;
  height: 100%;
  min-height: 400px;
  contain: layout;
`

export const StyledFlexRow = styled.div<StyledProps>`
  ${flexAlign};
  flex-wrap: wrap;
  gap: 10px;
  padding-top: ${({ $paddingTop }) => `${$paddingTop}px`} !important;

  @media (min-width: 1240px) {
    flex-wrap: nowrap;
    gap: ${({ $gap }) => `${$gap}px`} !important;
  }
`

export const StyledCurrentValueWrapper = styled.div<StyledProps>``

export const StyledDivider = styled.div<StyledProps>`
  padding-bottom: 20px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const StyledSkeletonBodyWrapper = styled.div<StyledProps>`
  height: 220px;
  margin: 20px 0;
`

export const StyledSkeletonHeaderWrapper = styled.div<StyledProps>`
  ${flexAlign};
  justify-content: space-between;
`

export const StyledSkeletonItem = styled(Skeleton.Input)<StyledProps>`
  border-radius: 0 !important;
  min-width: unset !important;
  width: ${({ $width }) => `${$width}px`} !important;
  height: ${({ $height }) => `${$height}px`} !important;
`

export const StyledSkeletonDivider = styled.div<StyledProps>`
  width: 100%;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const StyledSkeletonItemGroup = styled.div<StyledProps>`
  ${flexAlign};
  gap: 10px;
`

export const StyledSkeletonBody = styled.div<StyledProps>`
  ${flexColumn};
  height: 100%;
  justify-content: space-between;
`

export const StyledTimelineSkeleton = styled.div<StyledProps>`
  ${flexAlign};
  justify-content: space-around;
`

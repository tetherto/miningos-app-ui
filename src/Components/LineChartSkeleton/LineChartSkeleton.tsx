import _times from 'lodash/times'
import type { FC } from 'react'

import LineChartCardToggle from '../LineChartCard/LineChartCardToggle'

import {
  INITIAL_SKELETON_COUNT,
  INITIAL_SKELETON_TIMELINE_COUNT,
  INITIAL_SKELETON_MIN_MAX_AVG_COUNT,
} from './LineChartSkeleton.const'
import {
  StyledFlexRow,
  StyledDivider,
  StyledSkeletonBody,
  StyledSkeletonItem,
  StyledSkeletonDivider,
  StyledTimelineSkeleton,
  StyledSkeletonItemGroup,
  StyledSkeletonBodyWrapper,
  StyledCurrentValueWrapper,
  StyledSkeletonHeaderWrapper,
  StyledLineChartSkeletonContainer,
} from './LineChartSkeleton.styles'

interface LineChartSkeletonProps {
  title: string
  radioButtons?: unknown[]
  hasMinMaxAvg?: boolean
  hasCurrValueLabel?: boolean
  skeletonItems?: number
}

export const LineChartSkeleton: FC<LineChartSkeletonProps> = ({
  title,
  radioButtons = [],
  hasMinMaxAvg = true,
  hasCurrValueLabel = true,
  skeletonItems = INITIAL_SKELETON_COUNT,
}) => (
  <StyledLineChartSkeletonContainer>
    <StyledDivider />
    <LineChartCardToggle
      title={title}
      radioButtons={radioButtons as Array<{ value: string; disabled?: boolean; label?: string }>}
    />

    <StyledSkeletonHeaderWrapper>
      <StyledFlexRow $gap={30}>
        {_times(skeletonItems, (index) => (
          <StyledSkeletonItem key={index as number} $width={165} $height={17} active />
        ))}
      </StyledFlexRow>

      {hasCurrValueLabel && (
        <StyledCurrentValueWrapper>
          <StyledSkeletonItem active $width={180} $height={38} />
        </StyledCurrentValueWrapper>
      )}
    </StyledSkeletonHeaderWrapper>

    <StyledSkeletonBodyWrapper>
      <StyledSkeletonBody>
        {_times(INITIAL_SKELETON_COUNT, (index) => (
          <StyledSkeletonItemGroup key={index as number}>
            <StyledSkeletonItem active $width={28} $height={17} />
            <StyledSkeletonDivider />
          </StyledSkeletonItemGroup>
        ))}
      </StyledSkeletonBody>
      <StyledTimelineSkeleton>
        {_times(INITIAL_SKELETON_TIMELINE_COUNT, (index) => (
          <StyledSkeletonItem key={index as number} active $width={54} $height={20} />
        ))}
      </StyledTimelineSkeleton>
    </StyledSkeletonBodyWrapper>

    {hasMinMaxAvg && (
      <StyledFlexRow $gap={10} $paddingTop={20}>
        {_times(INITIAL_SKELETON_MIN_MAX_AVG_COUNT, (index) => (
          <StyledSkeletonItem key={index as number} active $height={19} $width={102} />
        ))}
      </StyledFlexRow>
    )}
  </StyledLineChartSkeletonContainer>
)

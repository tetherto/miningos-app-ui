import type { ReactNode } from 'react'

import {
  ChartCardWrapper,
  ChartContent,
  ChartHeader,
  ChartTitle,
  ErrorContainer,
  NoDataContainer,
} from '../styles'

import { ChartExpandAction } from './ChartExpandAction'

interface ChartCardLayoutProps {
  id: string
  title: string
  titleExtra?: ReactNode
  isExpanded: boolean
  hasExpandedButton?: boolean
  hasHeaderMarginBottom?: boolean
  hasHeaderPaddingLeft?: boolean
  onToggleExpand: VoidFunction
  contentCentered?: boolean
  error?: unknown
  errorMessage: string
  hasData: boolean
  noDataMessage: string
  children: ReactNode
}

/**
 * Reusable layout component for chart cards
 * Handles common structure, errors, and empty states
 */
export const ChartCardLayout = ({
  id,
  title,
  error,
  hasData,
  children,
  isExpanded,
  titleExtra,
  errorMessage,
  noDataMessage,
  onToggleExpand,
  contentCentered,
  hasExpandedButton = true,
  hasHeaderPaddingLeft = false,
  hasHeaderMarginBottom = false,
}: ChartCardLayoutProps) => {
  const renderContent = () => {
    if (error) {
      return <ErrorContainer>{errorMessage}</ErrorContainer>
    }

    if (!hasData) {
      return <NoDataContainer>{noDataMessage}</NoDataContainer>
    }

    return children
  }

  return (
    <ChartCardWrapper $isExpanded={isExpanded} id={id}>
      <ChartHeader
        $hasHeaderMarginBottom={hasHeaderMarginBottom}
        $hasHeaderPaddingLeft={hasHeaderPaddingLeft}
      >
        <ChartTitle>
          {title}
          {titleExtra}
        </ChartTitle>
        {hasExpandedButton && (
          <ChartExpandAction isExpanded={isExpanded} onToggle={onToggleExpand} />
        )}
      </ChartHeader>
      <ChartContent $contentCentered={contentCentered}>{renderContent()}</ChartContent>
    </ChartCardWrapper>
  )
}

import type { ReactNode } from 'react'

import { ContentPanelWrapper } from './ContentPanel.styles'

type ContentPanelProps = {
  children: ReactNode
}

const ContentPanel = ({ children }: ContentPanelProps) => (
  <ContentPanelWrapper>{children}</ContentPanelWrapper>
)

export default ContentPanel

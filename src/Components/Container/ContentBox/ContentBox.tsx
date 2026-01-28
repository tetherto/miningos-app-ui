import { FC, ReactNode } from 'react'

import { Content, ContentBoxContainer, Title } from './ContentBox.styles'

interface ContentBoxProps {
  children?: ReactNode
  title?: string
  [key: string]: unknown
}

const ContentBox: FC<ContentBoxProps> = ({ children, title, ...props }) => (
  <ContentBoxContainer {...props}>
    {title ? <Title>{title}</Title> : null}
    <Content>{children}</Content>
  </ContentBoxContainer>
)

export { ContentBox }

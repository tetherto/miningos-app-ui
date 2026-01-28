import { FC, ReactNode } from 'react'

import { StyledButton } from './WebappButton.styles'

interface WebappButtonProps {
  children: ReactNode
  [key: string]: unknown
}

const WebappButton: FC<WebappButtonProps> = ({ children, ...props }) => (
  <StyledButton {...props}>{children}</StyledButton>
)

export { WebappButton }

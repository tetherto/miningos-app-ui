import { FC } from 'react'
import { Link } from 'react-router'

import {
  BackText,
  BackWrapper,
  BreadcrumbsWrapper,
  BreadcrumbTitle,
  LeftOutlinedIcon,
} from './Breadcrumbs.styles'

interface BreadcrumbsProps {
  title: string
  useGoBack?: boolean
  destination?: string
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({
  title,
  useGoBack = false,
  destination = '/reporting-tool',
}) => (
  <BreadcrumbsWrapper>
    <Link
      to={useGoBack ? (-1 as unknown as string) : destination}
      style={{ textDecoration: 'none' }}
    >
      <BackWrapper>
        <LeftOutlinedIcon />
        <BackText>Back</BackText>
      </BackWrapper>
    </Link>
    <BreadcrumbTitle>{title}</BreadcrumbTitle>
  </BreadcrumbsWrapper>
)

export { Breadcrumbs }

import _map from 'lodash/map'
import type { FC } from 'react'

import {
  ReportNavWrapper as Wrapper,
  ReportNavTitle as Title,
  ReportLinksContainer as LinksContainer,
  ReportLinkBtn as LinkBtn,
  ReportLink,
} from './ReportNavSection.styles'

interface Link {
  title: string
  path: string
}

interface ReportNavSectionProps {
  links: Link[]
}

const ReportNavSection: FC<ReportNavSectionProps> = ({ links }) => (
  <Wrapper>
    <Title>REPORTS</Title>
    <LinksContainer>
      {_map(links, ({ title, path }, index) => (
        <ReportLink key={index} to={path}>
          <LinkBtn>{title}</LinkBtn>
        </ReportLink>
      ))}
    </LinksContainer>
  </Wrapper>
)

export { ReportNavSection }

import { Star } from './Icons/Star'
import { FarmName, Location, Starred, SummaryBoxContainer } from './SummaryBox.styles'

interface SummaryBoxProps {
  farmName?: string
  location?: string
  starred?: number | string
}

const SummaryBox = ({ farmName, location, starred }: SummaryBoxProps) => (
  <SummaryBoxContainer>
    <FarmName>{farmName}</FarmName>
    <Location>{location}</Location>
    <Starred>
      <Star />
      {starred}
    </Starred>
  </SummaryBoxContainer>
)

export { SummaryBox }

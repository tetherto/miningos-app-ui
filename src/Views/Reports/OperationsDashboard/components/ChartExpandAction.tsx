import { ChartActions, ExpandIcon, CompressIcon } from '../styles'

interface ChartExpandActionProps {
  isExpanded: boolean
  onToggle: () => void
}

export const ChartExpandAction = ({ isExpanded, onToggle }: ChartExpandActionProps) => (
  <ChartActions>
    {isExpanded ? <CompressIcon onClick={onToggle} /> : <ExpandIcon onClick={onToggle} />}
  </ChartActions>
)

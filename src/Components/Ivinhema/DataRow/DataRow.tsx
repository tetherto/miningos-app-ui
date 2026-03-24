import { DataRowLabel, DataRowRight, DataRowValue, DataRowWrapper } from './DataRow.styles'

type DataRowProps = {
  label: string
  value: string
  color?: string
}

const DataRow = ({ label, value, color }: DataRowProps) => (
  <DataRowWrapper>
    <DataRowLabel>{label}</DataRowLabel>
    <DataRowRight>
      <DataRowValue $color={color}>{value}</DataRowValue>
    </DataRowRight>
  </DataRowWrapper>
)

export default DataRow

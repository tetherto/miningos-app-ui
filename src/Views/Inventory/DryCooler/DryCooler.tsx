import { Breadcrumbs } from '../../../Components/Breadcrumbs/Breadcrumbs'
import {
  inventoryData,
  dryCoolerColumns,
} from '../../../Components/Inventory/Dashboard/Dashboard.constants'
import { InventoryTable as Table } from '../../../Components/Inventory/InventoryTable/InventoryTable'

import { Wrapper, TableWrapper } from './DryCooler.styles'

const InventoryDryCooler = () => (
  <Wrapper>
    <Breadcrumbs title={'Dry Cooler Inventory'} destination={'/inventory/dashboard'} />
    <TableWrapper>
      <Table data={inventoryData} columns={dryCoolerColumns} isLoading={false} />
    </TableWrapper>
  </Wrapper>
)

export default InventoryDryCooler

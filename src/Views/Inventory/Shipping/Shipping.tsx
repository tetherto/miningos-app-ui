import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import { format } from 'date-fns/format'
import _head from 'lodash/head'
import _map from 'lodash/map'
import { useEffect, useState } from 'react'

import { useGetListRacksQuery, useGetListThingsQuery } from '../../../app/services/api'
import { getMajorLocation, getMinorLocation } from '../../../app/utils/inventoryUtils'
import { Breadcrumbs } from '../../../Components/Breadcrumbs/Breadcrumbs'
import useInventoryItemFilter from '../../../Components/Inventory/hooks/useInventoryItemFilter'
import AddShipmentModal from '../../../Components/Inventory/Shipments/AddShipmentModal/AddShipmentModal'
import ConfirmShipmentStatusChangeModal from '../../../Components/Inventory/Shipments/ConfirmShipmentStatusChangeModal/ConfirmShipmentStatusChangeModal'
import { getShipmentItinerary } from '../../../Components/Inventory/Shipments/Shipment.utils'
import {
  EDIT_SHIPMENT,
  getShipmentsListColumns,
  SEARCHABLE_SHIPMENT_ATTRIBUTES,
  type Shipment,
} from '../../../Components/Inventory/Shipments/Shipments.constants'
import { DATE_TIME_FORMAT } from '../../../constants/dates'
import { useContextualModal } from '../../../hooks/useContextualModal'
import { FilterWrapper, ListViewActionCol, Wrapper } from '../Inventory.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import AppTable from '@/Components/AppTable/AppTable'
import { Spinner } from '@/Components/Spinner/Spinner'

const InventoryShipping = () => {
  const [mappedItems, setMappedItems] = useState<Shipment[]>([])
  const [filteredItems, setFilteredItems] = useState<Shipment[]>([])

  const {
    data,
    isLoading: isListShipmentsLoading,
    isFetching: isListShipmentsFetching,
    refetch: refetchShipments,
  } = useGetListThingsQuery({
    query: JSON.stringify({
      type: { $eq: 'SHIPPING' },
    }),
  })

  const {
    modalOpen: addShipmentModalOpen,
    handleOpen: openAddShipmentModal,
    handleClose: closeAddShipmentModal,
    subject: shipmentToEdit,
  } = useContextualModal({
    onClose: () => {
      refetchShipments()
    },
  })

  const {
    modalOpen: confirmStatusChangeModalOpen,
    handleOpen: openConfirmStatusChangeModal,
    handleClose: closeConfirmStatusChangeModal,
    subject: shipmentStatusChange,
  } = useContextualModal({
    onClose: () => {
      refetchShipments()
    },
  })

  const handleActionSelect = (shipmentSelected: Shipment, action: string) => {
    switch (action) {
      case EDIT_SHIPMENT:
        openAddShipmentModal(shipmentSelected)
        break

      default:
        break
    }
  }

  const { data: rackIds, isLoading: isGetListRacksLoading } = useGetListRacksQuery({
    type: 'ticket',
  })

  const rackId = (_head(rackIds as unknown[]) as UnknownRecord)?.id as string

  useEffect(() => {
    const shipments = _head(data as unknown[]) as UnknownRecord[] | undefined
    if (!isListShipmentsLoading && shipments?.length) {
      const mappedItems = _map(shipments, (shipment: UnknownRecord) => ({
        id: shipment.id as string,
        site: shipment.currentLocation
          ? getMajorLocation(shipment.currentLocation as string)
          : 'unknown',
        location: shipment.currentLocation
          ? getMinorLocation(shipment.currentLocation as string)
          : 'unknown',
        itinerary: getShipmentItinerary(shipment),
        createdAt: shipment.createdAt ? format(shipment.createdAt as number, DATE_TIME_FORMAT) : '',
        source: shipment.source as string,
        destination: shipment.destination as string,
        status: (shipment.status as string) ?? 'unknown',
        boxes: shipment.boxes,
        raw: shipment,
      }))
      setFilteredItems(mappedItems)
      setMappedItems(mappedItems)
    }
  }, [data, isListShipmentsLoading])

  const { handleFilterSelect } = useInventoryItemFilter({
    setFilteredItems: setFilteredItems as (items: unknown[]) => void,
    allItems: mappedItems,
    attributes: SEARCHABLE_SHIPMENT_ATTRIBUTES,
  })

  const handleStatusChange = (shipment: Shipment, status: string) => {
    openConfirmStatusChangeModal({
      shipment,
      status,
    })
  }

  const isLoading = isListShipmentsLoading || isGetListRacksLoading || isListShipmentsFetching

  return (
    <Wrapper>
      <Breadcrumbs title={'Shipping'} destination={'/inventory/dashboard'} />

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Row>
            <Col md={20}>
              <FilterWrapper placeholder="Search" onChange={handleFilterSelect} allowClear />
            </Col>
            <ListViewActionCol md={4}>
              <Button type="primary" onClick={() => openAddShipmentModal(undefined)}>
                New Shipment
              </Button>
            </ListViewActionCol>
          </Row>

          <AppTable<Shipment>
            $fullSize
            dataSource={filteredItems}
            columns={getShipmentsListColumns({ handleActionSelect, handleStatusChange })}
            loading={isLoading}
            scroll={{ x: 'max-content', y: 600 }}
            pagination={{
              showSizeChanger: true,
            }}
          />
        </>
      )}

      {addShipmentModalOpen && (
        <AddShipmentModal
          isOpen={addShipmentModalOpen}
          onClose={closeAddShipmentModal}
          shipment={shipmentToEdit as unknown as Parameters<typeof AddShipmentModal>[0]['shipment']}
          rackId={rackId}
        />
      )}

      {confirmStatusChangeModalOpen && (
        <ConfirmShipmentStatusChangeModal
          isOpen={confirmStatusChangeModalOpen}
          onClose={closeConfirmStatusChangeModal}
          shipment={(shipmentStatusChange as { shipment: Shipment; status: string }).shipment}
          status={(shipmentStatusChange as { shipment: Shipment; status: string }).status}
          rackId={rackId}
        />
      )}
    </Wrapper>
  )
}

export default InventoryShipping

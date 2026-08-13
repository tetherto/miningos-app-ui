import Button from 'antd/es/button'
import Select from 'antd/es/select'
import { FormikProvider, useFormik } from 'formik'
import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _reject from 'lodash/reject'
import _set from 'lodash/set'
import _startCase from 'lodash/startCase'
import _startsWith from 'lodash/startsWith'
import _values from 'lodash/values'
import { useEffect, useState } from 'react'
import * as yup from 'yup'

import { useGetListThingsQuery, useLazyGetListThingsQuery } from '../../../../app/services/api'
import { getMajorLocation, getMinorLocation } from '../../../../app/utils/inventoryUtils'
import { getByIdsQuery } from '../../../../app/utils/queryUtils'
import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'
import useLocationOptions from '../../LocationSelectDropdown/useLocationOptions'
import {
  getShippedContentsListColumns,
  getShippingContentsListColumns,
  SHIPMENT_STATUS_NAMES,
  SHIPMENT_STATUSES,
} from '../Shipments.constants'

import {
  AddItemFormActions,
  AddItemFormControl,
  AddItemFormRow,
  FormActions,
  ModalTitle,
  ShipmentFields,
  ShipmentFieldsRow,
  StyledModal,
} from './AddShipmentModal.styles'

import AppTable from '@/Components/AppTable/AppTable'
import { FormikInput } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ACTION_TYPES } from '@/constants/actions'

const validationSchema = yup.object({
  box: yup.string().required(),
})

const addShipmentValidationSchema = yup.object({
  originSite: yup.string().nullable().required(),
  originLocation: yup.string().nullable().required(),
  destinationSite: yup.string().nullable().required(),
  destinationLocation: yup.string().nullable().required(),
  status: yup.string().nullable().required(),
})

const statusOptions = _map(_values(SHIPMENT_STATUSES), (value) => ({
  key: value as string,
  label: SHIPMENT_STATUS_NAMES[value as keyof typeof SHIPMENT_STATUS_NAMES],
}))

interface Shipment {
  id: string
  source?: string | null
  destination?: string | null
  status?: string | null
  boxes?: string[]
  [key: string]: unknown
}

interface ShipmentItem {
  id: string
  received?: boolean
}

interface AddShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  shipment?: Shipment | null
  rackId: string
}

interface BoxThing {
  id: string
  [key: string]: unknown
}

const AddShipmentModal = ({ isOpen, onClose, shipment, rackId }: AddShipmentModalProps) => {
  const [items, setItems] = useState<ShipmentItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)

  const { submitAction } = useDirectSubmitAction()
  const [getListThings] = useLazyGetListThingsQuery()

  const { data: itemsData, isLoading: isItemsLoading } = useGetListThingsQuery(
    {
      query: getByIdsQuery(shipment?.boxes || []),
      fields: JSON.stringify({
        id: 1,
      }),
    },
    {
      skip: _isEmpty(shipment?.boxes),
    },
  )

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  useEffect(() => {
    const itemsArray = itemsData as BoxThing[][] | undefined
    if (!isItemsLoading && itemsArray && _head(itemsArray)?.length) {
      const mappedItems = _map(_head(itemsArray) as BoxThing[], (item: BoxThing) => ({
        id: item.id,
        received: false,
      }))
      setItems(mappedItems)
    }
  }, [itemsData, isItemsLoading])

  const formik = useFormik({
    initialValues: {
      box: '',
    },
    validationSchema,
    onSubmit: async (values: { box: string }, { setFieldError }) => {
      try {
        const { box } = values

        const response = await getListThings({
          query: JSON.stringify({
            $and: [
              {
                id: box,
                status: SHIPMENT_STATUSES.CLOSED,
              },
              {
                // The box should not be part of another shipment
                $or: [
                  {
                    shippingTicketId: null,
                  },
                  {
                    shippingTicketId: {
                      $exists: false,
                    },
                  },
                ],
              },
            ],
          }),
          limit: 1,
        }).unwrap()

        const responseArray = response as BoxThing[][]
        const thing = _head(_head(responseArray)) as BoxThing | undefined
        if (!_isNil(thing)) {
          setItems([
            ...items,
            {
              id: thing.id,
            },
          ])
          setShowAddForm(false)
        } else {
          setFieldError('box', 'No box found')
        }
      } catch {
        setFieldError('box', 'Error finding box')
      }
    },
  })

  const handleSubmit = async (values: {
    destinationLocation: string | null
    originLocation: string | null
    status: string | null
    originSite?: string | null
    destinationSite?: string | null
    [key: string]: unknown
  }) => {
    const { destinationLocation, originLocation, status } = values
    if (!destinationLocation || !originLocation || !status) {
      return
    }

    const params = [
      {
        rackId,
        type: 'SHIPPING',
        source: originLocation,
        destination: destinationLocation,
        currentLocation: originLocation,
        status,
        boxes: _map(items, ({ id }) => id),
        info: {},
      },
    ]

    let action: {
      type: string
      action: string
      params: unknown[]
      minerId?: string
      [key: string]: unknown
    } = {
      type: 'voting',
      action: ACTION_TYPES.REGISTER_THING,
      params,
    }

    if (shipment) {
      // Editing an existing shipment
      action = {
        ...action,
        minerId: shipment.id,
        action: ACTION_TYPES.UPDATE_THING as string,
      }

      _set(action, ['params', '0', 'id'], shipment.id)
    }

    await executeAction({ executor: submitAction as never, action, onSuccess: handleSuccess })
  }

  const addShipmentFormik = useFormik<{
    originLocation: string | null
    destinationLocation: string | null
    originSite: string | null
    destinationSite: string | null
    status: string | null
  }>({
    initialValues: {
      originLocation: shipment?.source ?? null,
      destinationLocation: shipment?.destination ?? null,
      originSite: getMajorLocation(shipment?.source || '') ?? null,
      destinationSite: getMajorLocation(shipment?.destination || '') ?? null,
      status: shipment?.status ?? null,
    },
    validationSchema: addShipmentValidationSchema,
    onSubmit: handleSubmit,
  })

  const handleDeleteItem = (itemToDelete: ShipmentItem) => {
    setItems(_reject(items, { id: itemToDelete.id }) as ShipmentItem[])
  }

  const handleAddItem = () => {
    setShowAddForm(true)
  }

  const handleCancel = () => {
    onClose()
  }

  const {
    isLoading: isLocationsLoading,
    majorLocationOptions: siteOptions,
    locationOptions,
  } = useLocationOptions()

  const handleOriginSiteSelect = (value: unknown) => {
    addShipmentFormik.setValues(
      {
        ...addShipmentFormik.values,
        originSite: value as string,
        originLocation: null as unknown as string,
      },
      false,
    )
  }

  const handleDestinationSiteSelect = (value: unknown) => {
    addShipmentFormik.setValues(
      {
        ...addShipmentFormik.values,
        destinationSite: value as string,
        destinationLocation: null as unknown as string,
      },
      false,
    )
  }

  const getFilteredLocationOptions = (site: string | null) =>
    site
      ? _map(
          _filter(locationOptions, ({ value }) => _startsWith(value, site)),
          ({ value }) => ({
            label: _startCase(getMinorLocation(value)),
            value,
          }),
        )
      : []

  const handleReceivedChange = (box: ShipmentItem, checked: boolean) => {
    setItems(
      _map(items, (item: ShipmentItem) => {
        if (item.id !== box.id) {
          return item
        }

        return {
          ...item,
          received: checked,
        }
      }),
    )
  }
  const handleAllReceivedClick = () => {
    setItems(_map(items, (item: ShipmentItem) => ({ ...item, received: true })))
  }
  const handleItemAddCancel = () => {
    setShowAddForm(false)
  }

  const isLoading = isLocationsLoading || isItemsLoading

  return (
    <StyledModal
      title={<ModalTitle>Shipping Ticket</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={400}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <ShipmentFields>
            <ShipmentFieldsRow>
              <Select
                placeholder="Origin Site"
                options={siteOptions}
                onSelect={handleOriginSiteSelect}
                value={addShipmentFormik.values.originSite as string | undefined}
              />
              <Select
                placeholder="Origin Location"
                options={getFilteredLocationOptions(addShipmentFormik.values.originSite)}
                disabled={_isNil(addShipmentFormik.values.originSite)}
                onSelect={(value: unknown) => {
                  addShipmentFormik.setFieldValue('originLocation', value as string | null)
                }}
                value={addShipmentFormik.values.originLocation as string | undefined}
              />
            </ShipmentFieldsRow>
            <ShipmentFieldsRow>
              <Select
                placeholder="Destination Site"
                options={siteOptions}
                onSelect={handleDestinationSiteSelect}
                value={addShipmentFormik.values.destinationSite as string | undefined}
              />
              <Select
                placeholder="Destination Location"
                options={getFilteredLocationOptions(addShipmentFormik.values.destinationSite)}
                disabled={_isNil(addShipmentFormik.values.destinationSite)}
                onSelect={(value: unknown) => {
                  addShipmentFormik.setFieldValue('destinationLocation', value as string | null)
                }}
                value={addShipmentFormik.values.destinationLocation as string | undefined}
              />
            </ShipmentFieldsRow>
            <ShipmentFieldsRow>
              <Select
                placeholder="Status"
                options={statusOptions}
                onSelect={(value: string) => {
                  addShipmentFormik.setFieldValue('status', value)
                }}
                value={addShipmentFormik.values.status}
              />
            </ShipmentFieldsRow>
          </ShipmentFields>
          <h3>Item List</h3>
          {shipment?.status !== SHIPMENT_STATUSES.SHIPPED ? (
            <>
              <AppTable
                dataSource={items.concat([null as unknown as ShipmentItem]) as never}
                pagination={false}
                columns={
                  getShippingContentsListColumns({
                    onDelete: handleDeleteItem as never,
                    numRows: items.length + 1,
                    renderLastRow: () => (
                      <>
                        {showAddForm ? (
                          <FormikProvider value={formik}>
                            <form onSubmit={formik.handleSubmit}>
                              <AddItemFormRow>
                                <AddItemFormControl>
                                  <FormikInput name="box" />
                                </AddItemFormControl>
                                <AddItemFormActions>
                                  <Button
                                    onClick={handleItemAddCancel}
                                    disabled={formik.isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={formik.isSubmitting}
                                  >
                                    Add
                                  </Button>
                                </AddItemFormActions>
                              </AddItemFormRow>
                            </form>
                          </FormikProvider>
                        ) : (
                          <Button block type="primary" onClick={handleAddItem}>
                            Add Item
                          </Button>
                        )}
                      </>
                    ),
                  }) as never
                }
                scroll={{ x: 'max-content', y: 380 }}
              />
            </>
          ) : (
            <>
              <AppTable
                dataSource={items.concat([null as unknown as ShipmentItem]) as never}
                columns={
                  getShippedContentsListColumns({
                    handleReceivedChange: handleReceivedChange as never,
                    numRows: items.length + 1,
                    renderLastRow: () => (
                      <Button block type="primary" onClick={handleAllReceivedClick}>
                        Mark All as Received
                      </Button>
                    ),
                  }) as never
                }
                scroll={{ x: 'max-content', y: 380 }}
                pagination={false}
              />
            </>
          )}
          {!showAddForm && (
            <FormActions>
              <Button onClick={handleCancel} disabled={addShipmentFormik.isSubmitting}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => addShipmentFormik.handleSubmit()}
                loading={addShipmentFormik.isSubmitting}
              >
                Save
              </Button>
            </FormActions>
          )}
        </>
      )}
    </StyledModal>
  )
}

export default AddShipmentModal

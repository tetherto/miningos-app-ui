import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _flatten from 'lodash/flatten'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _startsWith from 'lodash/startsWith'
import * as yup from 'yup'

import { useGetListRacksQuery, useLazyGetListThingsQuery } from '../../../../app/services/api'
import { getRackNameFromId } from '../../../../app/utils/deviceUtils'
import { SparePartNames } from '../../SpareParts/SpareParts.constants'
import { MINER_PART_LIMITS } from '../Miners.constants'

import { FormActions, FormBody, ModalTitle, StyledModal } from './AttachSparePartModal.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { FormikInput, FormikSelect } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'

interface SparePart {
  removed?: boolean
  serialNum?: string
  raw: {
    rack: string
  }
  [key: string]: unknown
}

interface Rack {
  id?: string
  type?: string
  [key: string]: unknown
}

interface AttachSparePartModalProps {
  isOpen: boolean
  onClose: () => void
  spareParts: SparePart[]
  onSubmit: (part: UnknownRecord) => void
}

const validationSchema = yup.object({
  type: yup.string().required('Type is a required field'),

  serialNum: yup.string().required('Serial Number is a required field').trim(),
})

const AttachSparePartModal = ({
  isOpen,
  onClose,
  spareParts,
  onSubmit,
}: AttachSparePartModalProps) => {
  const [searchSparePart, { isFetching: isSearchingSparePart }] = useLazyGetListThingsQuery()

  const { data: inventoryRacksData, isLoading: isRackTypesLoading } = useGetListRacksQuery({
    type: 'inventory',
  })

  const inventoryRacks = _filter(
    _flatten(inventoryRacksData as Rack[] | undefined) as Rack[],
    (rack: Rack) => _startsWith(rack?.type as string | undefined, 'inventory-miner_part'),
  )

  const sparePartTypeOptions = _map(inventoryRacks, (rack: Rack) => {
    const rackId = rack?.id
    if (!rackId) return null
    const rackName = getRackNameFromId(rackId)
    return {
      value: rackName,
      label: SparePartNames[rackName] || rackName,
    }
  }).filter((option): option is { value: string; label: string } => option !== null)

  const formik = useFormik({
    initialValues: {
      type: null,
      serialNum: '',
    },
    validationSchema,
    onSubmit: async (rawValues, { setFieldError }) => {
      const values = validationSchema.cast(rawValues)
      const { type, serialNum: searchText } = values

      const existingPartsOfType = _filter(
        spareParts,
        (part: SparePart) => !part.removed && getRackNameFromId(part.raw?.rack) === type,
      )

      if (existingPartsOfType.length >= MINER_PART_LIMITS[type]) {
        setFieldError(
          'type',
          'Miner already has maximum number of parts for this type. Remove part of this type before adding a new one',
        )
        return
      }

      const partAlreadyAdded = _find(
        spareParts,
        (part: SparePart) =>
          !part.removed &&
          getRackNameFromId(part.raw?.rack) === type &&
          part.serialNum === searchText,
      )

      if (!_isNil(partAlreadyAdded)) {
        setFieldError('serialNum', 'This part is already attached to the miner')
        return
      }

      const { data } = await searchSparePart({
        query: JSON.stringify({
          $and: [
            {
              type,
            },
            {
              $or: [
                {
                  'info.parentDeviceId': {
                    $exists: false,
                  },
                },
                {
                  'info.parentDeviceId': null,
                },
              ],
            },
            {
              $or: [
                {
                  'info.serialNum': searchText,
                },
                {
                  'info.macAddress': searchText,
                },
                {
                  code: searchText,
                },
              ],
            },
          ],
        }),
      })

      const dataArray = data as UnknownRecord[] | undefined
      const firstArray = _head(dataArray) as UnknownRecord[] | undefined

      if (_isEmpty(firstArray)) {
        formik.setFieldError('serialNum', 'No spare part found with this Code, SN or MAC')
        return
      }

      const part = _head(firstArray) as UnknownRecord | undefined

      if (part) {
        onSubmit(part as UnknownRecord)
      }
      onClose()
    },
  })

  const isLoading = isRackTypesLoading

  return (
    <StyledModal
      title={<ModalTitle>Register Repair {'>'} Add Spare Part</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={600}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <FormBody>
              <FormikSelect name="type" options={sparePartTypeOptions} placeholder="Type" />
              <FormikInput name="serialNum" placeholder="Search by Code / Serial Number / MAC" />
              <FormActions>
                <Button type="primary" htmlType="submit" loading={isSearchingSparePart}>
                  Search and Add
                </Button>
                <Button htmlType="button" onClick={onClose} disabled={isSearchingSparePart}>
                  Cancel
                </Button>
              </FormActions>
            </FormBody>
          </form>
        </FormikProvider>
      )}
    </StyledModal>
  )
}

export default AttachSparePartModal

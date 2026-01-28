import Select from 'antd/es/select'
import { ErrorMessage, useField } from 'formik'
import _filter from 'lodash/filter'
import _flatten from 'lodash/flatten'
import _map from 'lodash/map'
import _startsWith from 'lodash/startsWith'
import { FC } from 'react'

import { ErrorMessageWrapper, FormFieldWrapper } from './FormikInput.styles'

import { useGetListRacksQuery } from '@/app/services/api'
import { getRackNameFromId } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { MINER_TYPE_NAME_MAP } from '@/constants/deviceConstants'

interface FormikRackIdSelectProps {
  name: string
  placeholder?: string | null
}

const FormikRackIdSelect: FC<FormikRackIdSelectProps> = ({ name, placeholder = null }) => {
  const [field, meta, helpers] = useField(name)
  const { data, isLoading } = useGetListRacksQuery({
    type: 'miner',
  })

  const filteredData = _filter(
    _flatten(data as UnknownRecord[] | undefined),
    (rack) => !_startsWith((rack as UnknownRecord)?.type as string, 'minerpool-'),
  )

  const selectOptions = _map(filteredData, (rack) => {
    const rackRecord = rack as UnknownRecord
    const rackId = rackRecord?.id as string
    const rackName = getRackNameFromId(rackId)
    return {
      value: rackId,
      label: (MINER_TYPE_NAME_MAP as Record<string, string>)[rackName] ?? rackName,
    }
  })

  const handleChange = (value: unknown) => {
    helpers.setValue(value as string | null)
  }

  const handleBlur = () => {
    helpers.setTouched(true)
  }

  // Convert value to string for Select component
  const selectValue =
    field.value !== null && field.value !== undefined ? String(field.value) : undefined

  return (
    <FormFieldWrapper>
      <Select
        placeholder={placeholder}
        value={selectValue}
        style={{ width: '100%' }}
        onChange={handleChange}
        onBlur={handleBlur}
        options={selectOptions}
        loading={isLoading}
        status={meta.touched && meta.error ? 'error' : ''}
      />
      <ErrorMessageWrapper>
        <ErrorMessage name={name} />
      </ErrorMessageWrapper>
    </FormFieldWrapper>
  )
}

export default FormikRackIdSelect

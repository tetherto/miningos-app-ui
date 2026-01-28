import Select from 'antd/es/select'
import type { DefaultOptionType } from 'antd/es/select'
import { ErrorMessage, useField } from 'formik'
import { FC } from 'react'

import { ErrorMessageWrapper, FormFieldWrapper } from './FormikInput.styles'

import useLocationOptions from '@/Components/Inventory/LocationSelectDropdown/useLocationOptions'

interface FormikLocationSelectProps {
  name: string
  placeholder?: string
  filterLocationOptions?: (options: DefaultOptionType[]) => DefaultOptionType[]
}

const FormikLocationSelect: FC<FormikLocationSelectProps> = ({
  name,
  placeholder = 'Location',
  filterLocationOptions,
}) => {
  const [field, meta, helpers] = useField(name)
  const { locationOptions, isLoading } = useLocationOptions()

  const options = filterLocationOptions?.(locationOptions) ?? locationOptions

  return (
    <FormFieldWrapper>
      <Select
        placeholder={placeholder}
        value={field.value ?? undefined}
        options={options as DefaultOptionType[]}
        onChange={(value) => {
          helpers.setValue(value)
        }}
        onBlur={() => {
          helpers.setTouched(true)
        }}
        loading={isLoading}
        status={meta.touched && meta.error ? 'error' : ''}
      />
      <ErrorMessageWrapper>
        <ErrorMessage name={name} />
      </ErrorMessageWrapper>
    </FormFieldWrapper>
  )
}

export default FormikLocationSelect

import Select, { SelectProps } from 'antd/es/select'
import { ErrorMessage, useField } from 'formik'
import { FC } from 'react'

import { ErrorMessageWrapper, FormFieldWrapper } from './FormikInput.styles'

interface FormikSelectProps extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: string
}

const FormikSelect: FC<FormikSelectProps> = ({ name, ...selectProps }) => {
  const [field, meta, helpers] = useField(name)

  return (
    <FormFieldWrapper>
      <Select
        {...selectProps}
        value={field.value ?? undefined}
        onChange={(value) => {
          helpers.setValue(value)
        }}
        onBlur={() => {
          helpers.setTouched(true)
        }}
        status={meta.touched && meta.error ? 'error' : ''}
      />
      <ErrorMessageWrapper>
        <ErrorMessage name={name} />
      </ErrorMessageWrapper>
    </FormFieldWrapper>
  )
}

export default FormikSelect

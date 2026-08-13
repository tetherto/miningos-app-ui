import DatePicker, { DatePickerProps } from 'antd/es/date-picker'
import dayjs, { Dayjs } from 'dayjs'
import { ErrorMessage, useField } from 'formik'
import _isNumber from 'lodash/isNumber'
import { FC } from 'react'

import { ErrorMessageWrapper, FormFieldWrapper } from './FormikInput.styles'

interface FormikDatePickerProps extends Omit<
  DatePickerProps,
  'name' | 'value' | 'onChange' | 'onBlur'
> {
  name: string
}

const FormikDatePicker: FC<FormikDatePickerProps> = ({ name, ...datePickerProps }) => {
  const [, meta, helpers] = useField<number | string | null>(name)

  const handleChange = (date: Dayjs | null) => {
    helpers.setValue(date?.valueOf() ?? new Date().valueOf())
  }

  const handleBlur = () => {
    helpers.setTouched(true)
  }

  // Convert timestamp/number to dayjs object for DatePicker
  const dayjsValue = meta.value
    ? dayjs(_isNumber(meta.value) ? meta.value : Number(meta.value))
    : null

  return (
    <FormFieldWrapper>
      <DatePicker
        {...datePickerProps}
        value={dayjsValue}
        onChange={handleChange}
        onBlur={handleBlur}
        status={meta.touched && meta.error ? 'error' : ''}
      />
      <ErrorMessageWrapper>
        <ErrorMessage name={name} />
      </ErrorMessageWrapper>
    </FormFieldWrapper>
  )
}

export default FormikDatePicker

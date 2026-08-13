import Input, { InputProps } from 'antd/es/input'
import { ErrorMessage, useField } from 'formik'
import { ChangeEvent, FC } from 'react'

import { ErrorMessageWrapper, FormFieldWrapper } from './FormikInput.styles'

interface FormikInputWithTransformProps extends Omit<
  InputProps,
  'name' | 'value' | 'onChange' | 'onBlur'
> {
  name: string
  transform?: (value: string) => string
  formatDisplay?: (value: string) => string
  onValueChange?: (value: string) => void
}

const FormikInputWithTransform: FC<FormikInputWithTransformProps> = ({
  name,
  transform,
  formatDisplay,
  onValueChange,
  ...inputProps
}) => {
  const [field, meta, helpers] = useField(name)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Apply transformation if provided
    if (transform) {
      value = transform(value)
    }

    // Set the transformed value
    helpers.setValue(value)

    // Call optional callback
    if (onValueChange) {
      onValueChange(value)
    }
  }

  const handleBlur = () => {
    helpers.setTouched(true)
  }

  // Use formatDisplay for display value, or raw value
  const displayValue = formatDisplay ? formatDisplay(field.value) : field.value

  return (
    <FormFieldWrapper>
      <Input
        {...inputProps}
        name={name}
        value={displayValue}
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

export default FormikInputWithTransform

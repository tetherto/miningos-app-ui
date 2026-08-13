import Input, { InputProps } from 'antd/es/input'
import { ErrorMessage, useField } from 'formik'
import { FC } from 'react'

import { ErrorMessageWrapper, FormFieldWrapper } from './FormikInput.styles'

interface FormikInputProps extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: string
}

const FormikInput: FC<FormikInputProps> = ({ name, ...inputProps }) => {
  const [field, meta] = useField(name)

  return (
    <FormFieldWrapper>
      <Input {...field} {...inputProps} status={meta.touched && meta.error ? 'error' : ''} />
      <ErrorMessageWrapper>
        <ErrorMessage name={name} />
      </ErrorMessageWrapper>
    </FormFieldWrapper>
  )
}

export default FormikInput

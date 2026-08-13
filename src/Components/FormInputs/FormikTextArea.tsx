import Input from 'antd/es/input'
import { TextAreaProps } from 'antd/es/input'
import { ErrorMessage, useField } from 'formik'
import { FC } from 'react'
import styled from 'styled-components'

import { ErrorMessageWrapper, FormikTextAreaWrapper } from './FormikInput.styles'

interface FormikTextAreaProps extends Omit<
  TextAreaProps,
  'name' | 'value' | 'onChange' | 'onBlur'
> {
  name: string
  $hasMarginTop?: boolean
}

const StyledTextArea = styled(Input.TextArea)`
  resize: none !important;
`

const FormikTextArea: FC<FormikTextAreaProps> = ({ name, $hasMarginTop, ...textAreaProps }) => {
  const [field, meta] = useField(name)

  return (
    <FormikTextAreaWrapper $hasMarginTop={$hasMarginTop}>
      <StyledTextArea
        {...field}
        {...textAreaProps}
        status={meta.touched && meta.error ? 'error' : ''}
      />
      <ErrorMessageWrapper>
        <ErrorMessage name={name} />
      </ErrorMessageWrapper>
    </FormikTextAreaWrapper>
  )
}

export default FormikTextArea

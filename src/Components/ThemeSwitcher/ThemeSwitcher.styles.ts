import styled from 'styled-components'

export const ThemeSwitcherContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
`

export const Checkbox = styled.input.attrs(() => ({
  type: 'checkbox',
}))``

export const Label = styled.label`
  font-size: 14px;
  font-weight: 400;
`

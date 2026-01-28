import { useDispatch, useSelector } from 'react-redux'

import { setDarkTheme, setLightTheme } from '../../app/store'

import { Checkbox, Label, ThemeSwitcherContainer } from './ThemeSwitcher.styles'

const ThemeSwitcher = () => {
  const theme = useSelector((state: unknown) => (state as { theme: { value: string } }).theme)
  const dispatch = useDispatch()

  const toggleTheme = () => {
    dispatch(theme.value === 'light' ? setDarkTheme() : setLightTheme())
  }

  return (
    <ThemeSwitcherContainer>
      <Checkbox id="switch-theme-checkbox" checked={theme.value === 'dark'} onClick={toggleTheme} />
      <Label htmlFor="switch-theme-checkbox">Dark theme</Label>
    </ThemeSwitcherContainer>
  )
}

export { ThemeSwitcher }

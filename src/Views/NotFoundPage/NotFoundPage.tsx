import { HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '../../constants/routes'

import {
  NotFoundContainer,
  NotFoundTitle,
  NotFoundMessage,
  NotFoundButton,
} from './NotFoundPage.styles'

const NotFoundPage = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate(ROUTE.HOME)
  }

  return (
    <NotFoundContainer>
      <NotFoundTitle>Page Not Found</NotFoundTitle>
      <NotFoundMessage>
        The page you are looking for does not exist or is temporarily unavailable. Please check that
        the URL is correct, try refreshing the page, or go to the Home page.
      </NotFoundMessage>
      <NotFoundButton type="primary" icon={<HomeOutlined />} onClick={handleGoHome}>
        Go to the Home page
      </NotFoundButton>
    </NotFoundContainer>
  )
}

export default NotFoundPage

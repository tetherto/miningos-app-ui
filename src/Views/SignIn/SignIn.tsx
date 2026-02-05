import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useSearchParams } from 'react-router'

import { selectToken } from '../../app/slices/authSlice'
import { getSignInRedirectUrl } from '../../app/utils/authUtils'
import MosLogoPng from '../../Components/Header/Icons/mos-logo.png'
import MosLogoWebP from '../../Components/Header/Icons/mos-logo.webp'
import { useDemoToken } from '../../hooks/useDemoToken'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

import { GoogleIcon } from './GoogleIcon'
import { ErrorMessages } from './SignIn.const'
import { ErrorMessage, GoogleButton, LogoContainer, SigninContainer, Title } from './SignIn.styles'

import { getLastVisitedUrl, clearLastVisitedUrl } from '@/app/utils/localStorageUtils'

const SignIn = () => {
  const authToken = useSelector(selectToken)
  const [searchParams] = useSearchParams()
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  useDocumentTitle()
  useDemoToken()

  useEffect(() => {
    if (authToken) {
      const lastUrl = getLastVisitedUrl()

      if (lastUrl) {
        setRedirectPath(lastUrl)
      } else {
        setRedirectPath(getSignInRedirectUrl(authToken))
      }
    }
  }, [authToken])

  if (redirectPath) {
    clearLastVisitedUrl()
    return <Navigate to={redirectPath} />
  }

  const err = searchParams.get('error')

  return (
    <SigninContainer>
      <LogoContainer href="/">
        <picture>
          <source srcSet={MosLogoWebP} type="image/webp" />
          <img src={MosLogoPng} alt="Mos logo" width={500} height={112} />
        </picture>
      </LogoContainer>
      <Title>Sign in</Title>
      <GoogleButton href="/oauth/google">
        <GoogleIcon />
        Sign in with Google
      </GoogleButton>
      {err ? (
        <ErrorMessage>{ErrorMessages[err] || ErrorMessages.GENERIC_ERROR}</ErrorMessage>
      ) : null}
    </SigninContainer>
  )
}

export default SignIn

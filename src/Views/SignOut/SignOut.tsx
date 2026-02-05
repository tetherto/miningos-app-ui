import { Navigate } from 'react-router'

import useSignOut from '../../hooks/useSignOut'

const SignOut = () => {
  useSignOut()

  return <Navigate to="/" />
}

export default SignOut

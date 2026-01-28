import { Navigate } from 'react-router-dom'

import useSignOut from '../../hooks/useSignOut'

const SignOut = () => {
  useSignOut()

  return <Navigate to="/" />
}

export default SignOut

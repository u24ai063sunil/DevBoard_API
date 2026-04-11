import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const AuthCallback = () => {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const { setGoogleUser } = useAuthStore()

  useEffect(() => {
    const token  = searchParams.get('token')
    const name   = searchParams.get('name')
    const email  = searchParams.get('email')
    const id     = searchParams.get('id')
    const avatar = searchParams.get('avatar')
    const role   = searchParams.get('role')
    const error  = searchParams.get('error')

    if (error) {
      navigate('/login?error=google_failed')
      return
    }

    if (token && id) {
      // Store token
      localStorage.setItem('accessToken', token)

      // Update auth store
      setGoogleUser({
        id,
        _id:   id,
        name,
        email,
        avatar: avatar || null,
        role:   role || 'user',
      }, token)

      navigate('/dashboard')
    } else {
      navigate('/login?error=missing_data')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-400 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}

export default AuthCallback
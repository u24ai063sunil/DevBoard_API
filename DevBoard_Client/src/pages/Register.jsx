import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [registered, setRegistered] = useState(false)
  const [resending,  setResending]  = useState(false)
  const [resendMsg,  setResendMsg]  = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword)
      return setError('Passwords do not match')
    if (formData.password.length < 8)
      return setError('Password must be at least 8 characters')
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      return setError('Password must contain uppercase, lowercase and a number')

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
      })
      setRegistered(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendMsg('')
    try {
      await api.post('/auth/resend-verification', { email: formData.email })
      setResendMsg('Verification email resent! Check your inbox.')
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend')
    } finally {
      setResending(false)
    }
  }

  // Show success screen after register
  if (registered) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📧</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Check your email!</h2>
          <p className="text-gray-400 text-sm mb-2">
            We sent a verification link to
          </p>
          <p className="text-white font-medium mb-6">{formData.email}</p>
          <p className="text-gray-500 text-xs mb-8">
            Click the link in the email to verify your account.
            After verifying, you can log in.
          </p>

          {resendMsg && (
            <p className="text-green-400 text-sm mb-4">{resendMsg}</p>
          )}

          <button
            onClick={handleResend}
            disabled={resending}
            className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50 transition"
          >
            {resending ? 'Sending...' : "Didn't receive it? Resend email"}
          </button>

          <div className="mt-6">
            <Link to="/login" className="text-gray-500 hover:text-gray-300 text-sm transition">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">DevBoard</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full name</label>
              <input
                type="text" name="name" value={formData.name}
                onChange={handleChange} placeholder="Raj Patel" required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="raj@example.com" required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password" name="password" value={formData.password}
                onChange={handleChange} placeholder="Min 8 chars, uppercase, number" required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm password</label>
              <input
                type="password" name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} placeholder="••••••••" required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {formData.password && (
              <ul className="text-xs space-y-1">
                <li className={formData.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}>
                  {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}>
                  {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}>
                  {/[0-9]/.test(formData.password) ? '✓' : '○'} One number
                </li>
              </ul>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-lg px-4 py-3 text-sm transition"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800"/>
            <span className="text-gray-500 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-gray-800"/>
          </div>

          {/* Google button */}
          <a  href="http://localhost:5000/api/auth/google"
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition"
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </a>
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
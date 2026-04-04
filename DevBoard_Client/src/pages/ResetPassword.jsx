import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'

const ResetPassword = () => {
  const navigate                     = useNavigate()
  const [searchParams]               = useSearchParams()
  const token                        = searchParams.get('token')

  const [formData, setFormData]      = useState({ newPassword: '', confirmPassword: '' })
  const [loading,  setLoading]       = useState(false)
  const [error,    setError]         = useState('')
  const [success,  setSuccess]       = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) return setError('Invalid reset link. Please request a new one.')

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (formData.newPassword.length < 8) {
      return setError('Password must be at least 8 characters')
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      return setError('Password must contain uppercase, lowercase and a number')
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Password reset!</h2>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">DevBoard</h1>
          <p className="text-gray-400 mt-2">Set a new password</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {!token && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              Invalid reset link.{' '}
              <Link to="/forgot-password" className="underline">
                Request a new one
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Min 8 chars, uppercase, number"
                required
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm new password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Password strength */}
            {formData.newPassword && (
              <ul className="text-xs space-y-1">
                <li className={formData.newPassword.length >= 8 ? 'text-green-400' : 'text-gray-500'}>
                  {formData.newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-400' : 'text-gray-500'}>
                  {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'} One uppercase letter
                </li>
                <li className={/[0-9]/.test(formData.newPassword) ? 'text-green-400' : 'text-gray-500'}>
                  {/[0-9]/.test(formData.newPassword) ? '✓' : '○'} One number
                </li>
              </ul>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-lg px-4 py-3 text-sm transition"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
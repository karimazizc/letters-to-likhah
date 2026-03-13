import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

const SITE_PASSWORD = '13march2003'
const STORAGE_KEY = 'site_unlocked'

export default function SiteGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === SITE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  if (unlocked) return children

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-200">
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Lock className="w-7 h-7 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Letters to Likhah
        </h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          Enter the password to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Password"
              autoFocus
              className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors ${
                error
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-400 text-center">
                Wrong password, try again
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Enter
          </button>
        </form>

        {/* Hint */}
        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          hint: password is likhah's birthday 'daymonthyear' 
          <br/>example: 
          '15july2002'
        </p>
      </div>
    </div>
  )
}

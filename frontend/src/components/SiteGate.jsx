import { useState, useEffect, useCallback } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { analyticsApi, getSessionId } from '../services/api'
import { ALLOWED_USER_AGENTS } from '../lib/allowedAgents'
import FloatingHearts from './FloatingHearts'
import BloomingFlower from './BloomingFlower'



// And replace the img tag with:
const SITE_PASSWORD = '13march2003'
const STORAGE_KEY = 'site_unlocked'

// User agents that bypass the password gate entirely
const BYPASS_USER_AGENTS = [
  // 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/145.0.7632.108 Mobile/15E148 Safari/604.1',
]

// User agents (or substrings) that see a hidden message on the gate page
// (uses the shared ALLOWED_USER_AGENTS list from lib/allowedAgents.js)

const HIDDEN_MESSAGE = "wait, stop i love you - ur avoidant ex"

function shouldBypassGate() {
  const ua = navigator.userAgent
  return BYPASS_USER_AGENTS.some((allowed) => ua.includes(allowed))
}

function shouldShowHiddenMessage() {
  const ua = navigator.userAgent
  return ALLOWED_USER_AGENTS.some((fragment) => ua.includes(fragment))
}

export default function SiteGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') return true
    if (shouldBypassGate()) {
      localStorage.setItem(STORAGE_KEY, 'true')
      return true
    }
    return false
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [showHidden, setShowHidden] = useState(false)
  const [blooming, setBlooming] = useState(false)

    // Add this near the top of your component
  const BUNNY_IMAGES = [
    '/reconsider-bunny.png',
    '/this-cannot-continue.jpg',
    '/i-am-at-my-limit.jpeg',
  ]
  // Then use this in your component:
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % BUNNY_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Track gate (login page) view when the user hasn't unlocked yet
  useEffect(() => {
    if (!unlocked) {
      analyticsApi.track('gate', null, getSessionId())
    }
    // Check hidden message UA after mount (navigator is guaranteed available)
    setShowHidden(shouldShowHiddenMessage())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === SITE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setBlooming(true)
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleBloomComplete = useCallback(() => {
    setUnlocked(true)
  }, [])

  if (blooming && !unlocked) {
    return <BloomingFlower onComplete={handleBloomComplete} />
  }

  if (unlocked) return children

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-200 relative overflow-hidden">
      <FloatingHearts />
      <div className={`relative z-10 w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-52 h-52 rounded-full mb-10 bg-gray-100 dark:bg-gray-800 flex items-center  justify-center">
            {/* <Lock className="w-7 h-7 text-gray-500 dark:text-gray-400" /> */}
             <img 
            src={BUNNY_IMAGES[imageIndex]} 
            alt="bunny" 
            className='rounded-xl transition-opacity duration-1000'
            style={{ opacity: 1 }}
          />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Letters to Likhah
        </h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          Enter the password to continue. 
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
          <br/>
          example: '15july2002'
        </p>

        {/* Hidden message for specific user agents */}
        {showHidden && (
          <p className="mt-4 text-center text-xs text-pink-400 dark:text-pink-300 italic opacity-75">
            {HIDDEN_MESSAGE}
          </p>
        )}
      </div>
    </div>
  )
}

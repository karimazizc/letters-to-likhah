import { useState, useEffect } from 'react'
import { isAllowedAgent } from '../lib/allowedAgents'

/**
 * Hook that returns whether the current user agent is in the allowed list.
 * Evaluates once after mount so navigator.userAgent is guaranteed available.
 */
export default function useAllowedAgent() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(isAllowedAgent())
  }, [])

  return allowed
}

import { Navigate } from 'react-router-dom'
import { useUserAuth } from '../context/UserAuthContext'

function UserProtectedRoute({ children }) {
  const { isUserAuthenticated, loading } = useUserAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default UserProtectedRoute

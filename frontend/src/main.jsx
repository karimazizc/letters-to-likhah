import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import { AudioPlayerProvider } from './context/AudioPlayerContext'
import { ThemeProvider } from './context/ThemeContext'
import { QueryProvider } from './lib/queryClient'
import MiniPlayer from './components/MiniPlayer'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <UserAuthProvider>
            <AuthProvider>
              <AudioPlayerProvider>
                <App />
                <MiniPlayer />
              </AudioPlayerProvider>
            </AuthProvider>
          </UserAuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

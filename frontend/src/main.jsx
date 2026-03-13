import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { AudioPlayerProvider } from './context/AudioPlayerContext'
import { ThemeProvider } from './context/ThemeContext'
import { QueryProvider } from './lib/queryClient'
import MiniPlayer from './components/MiniPlayer'
import SiteGate from './components/SiteGate'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <SiteGate>
            <AuthProvider>
              <AudioPlayerProvider>
                <App />
                <MiniPlayer />
              </AudioPlayerProvider>
            </AuthProvider>
          </SiteGate>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { AudioPlayerProvider } from './context/AudioPlayerContext'
import { ThemeProvider } from './context/ThemeContext'
import MiniPlayer from './components/MiniPlayer'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AudioPlayerProvider>
            <App />
            <MiniPlayer />
          </AudioPlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

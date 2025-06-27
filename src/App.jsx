
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './ThemeProvider'
import Login from './Login'
import SpotifyCallback from './SpotifyCallback'
import Dashboard from './Dashboard'
import PlaylistView from './PlaylistView'

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<SpotifyCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/playlist/:playlistId" element={<PlaylistView />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

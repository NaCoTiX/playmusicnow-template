import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { redirectToSpotifyAuth } from './spotifyAuth.jsx'

export default function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already authenticated
    const authCode = localStorage.getItem('spotifyAuthCode')
    if (authCode) {
      navigate('/dashboard')
    }
  }, [navigate])
  const handleLogin = () => {
    redirectToSpotifyAuth()
  }

  return (
    <div style={{ 
      textAlign: 'center', 
      marginTop: '3rem',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#1DB954', fontSize: '3rem', marginBottom: '1rem' }}>
        PlayMusicNow
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
        Connect with Spotify and share your favorite playlists with the community
      </p>
      <button 
        onClick={handleLogin}
        style={{
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(29, 185, 84, 0.3)'
        }}
      >
        🎵 Connect to Spotify
      </button>
    </div>
  )
}

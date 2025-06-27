
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
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: '#1DB954', 
        fontSize: '3.5rem', 
        marginBottom: '1rem',
        fontWeight: 'bold'
      }}>
        PlayMusicNow
      </h1>
      <p style={{ 
        fontSize: '1.3rem', 
        marginBottom: '3rem', 
        color: '#333',
        maxWidth: '600px',
        margin: '0 auto 3rem auto'
      }}>
        Let anyone add songs to your Spotify playlist
      </p>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#333', marginBottom: '2rem' }}>Getting started is easy</h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem',
          flexWrap: 'wrap',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '200px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧙</div>
            <h3>1. Sign in with Spotify</h3>
            <p style={{ color: '#666' }}>Connect your Spotify account securely</p>
          </div>
          <div style={{ textAlign: 'center', maxWidth: '200px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👷‍♀️</div>
            <h3>2. Create a playlist</h3>
            <p style={{ color: '#666' }}>Set up a collaborative playlist</p>
          </div>
          <div style={{ textAlign: 'center', maxWidth: '200px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕺</div>
            <h3>3. Add songs and share your link</h3>
            <p style={{ color: '#666' }}>Share with friends to collaborate</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleLogin}
        style={{
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          padding: '1.2rem 3rem',
          fontSize: '1.2rem',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(29, 185, 84, 0.3)',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        🎵 Sign in with Spotify
      </button>
    </div>
  )
}

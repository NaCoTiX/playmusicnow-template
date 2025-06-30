
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeProvider'
import { redirectToSpotifyAuth } from './spotifyAuth.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { isDark, toggleTheme, colors } = useTheme()

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
      padding: '1rem',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: isDark 
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          backgroundColor: colors.surface,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div style={{ 
        maxWidth: '800px',
        padding: '2rem',
        backgroundColor: colors.surface,
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        border: `1px solid ${colors.border}`
      }}>
        <h1 style={{ 
          color: colors.primary, 
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
          marginBottom: '1rem',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🎵 SpotMusic.xyz
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 1.3rem)', 
          marginBottom: '3rem', 
          color: colors.textSecondary,
          lineHeight: '1.6'
        }}>
          Create collaborative playlists that anyone can contribute to
        </p>

        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: colors.text, marginBottom: '2rem', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>
            Getting started is easy
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧙</div>
              <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>1. Sign in with Spotify</h3>
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Connect your Spotify account securely</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👷‍♀️</div>
              <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>2. Create a playlist</h3>
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Set up a collaborative playlist</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕺</div>
              <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>3. Share & collaborate</h3>
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Share with friends to collaborate</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogin}
          style={{
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            padding: 'clamp(1rem, 3vw, 1.2rem) clamp(2rem, 5vw, 3rem)',
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(29, 185, 84, 0.3)',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 6px 20px rgba(29, 185, 84, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 15px rgba(29, 185, 84, 0.3)'
          }}
        >
          Sign in with Spotify
        </button>
      </div>
    </div>
  )
}

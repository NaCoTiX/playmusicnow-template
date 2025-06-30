import React from 'react'
import { redirectToSpotifyAuth } from './spotifyAuth'

export default function Login() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#191414',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#1DB954' }}>
        SpotMusic.xyz
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center' }}>
        Connect with Spotify to discover and share your music
      </p>
      <button
        onClick={redirectToSpotifyAuth}
        style={{
          backgroundColor: '#1DB954',
          color: '#ffffff',
          border: 'none',
          padding: '12px 24px',
          fontSize: '1.1rem',
          borderRadius: '50px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#1ed760'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#1DB954'}
      >
        Login with Spotify
      </button>
    </div>
  )
}
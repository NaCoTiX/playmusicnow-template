import React from 'react'
import { redirectToSpotifyAuth } from './spotifyAuth'

export default function Login() {
  const handleLogin = () => {
    redirectToSpotifyAuth()
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>PlayMusicNow</h1>
      <button onClick={handleLogin}>Connect to Spotify</button>
    </div>
  )
}

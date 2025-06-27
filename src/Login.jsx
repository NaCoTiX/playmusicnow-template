import React from 'react'
import { redirectToSpotifyAuth } from './spotifyAuth'

export default function Login() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <h1>PlayMusicNow</h1>
      <button onClick={redirectToSpotifyAuth}>Login with Spotify</button>
    </div>
  )
}
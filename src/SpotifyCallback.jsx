import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SpotifyService from './spotifyService.js'

export default function SpotifyCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const error = params.get('error')

        if (error) {
          throw new Error(`Spotify authorization failed: ${error}`)
        }

        if (!code) {
          throw new Error('Authorization code not found in callback URL')
        }

        // Exchange code for access token
        const spotifyService = new SpotifyService()
        await spotifyService.exchangeCodeForToken(code)

        // Store code for reference
        localStorage.setItem('spotifyAuthCode', code)

        // Clean the URL
        window.history.replaceState({}, document.title, '/')

        // Redirect to dashboard after successful auth
        navigate('/dashboard')
      } catch (err) {
        console.error('Spotify callback error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [navigate])

  if (loading) return <div>Logging in with Spotify, please wait...</div>

  if (error)
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
        <p>Error: {error}</p>
        <p>Please try logging in again.</p>
        <button onClick={() => (window.location.href = '/')}>Go back</button>
      </div>
    )

  return null
}

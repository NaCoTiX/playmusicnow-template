import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SpotifyCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (!code) {
          throw new Error('Authorization code not found in callback URL')
        }

        // Store code for backend token exchange (PKCE step 2)
        localStorage.setItem('spotifyAuthCode', code)

        // Optionally: Clean the URL to just '/' (remove code query)
        window.history.replaceState({}, document.title, '/')

        // Redirect to dashboard after successful auth
        navigate('/dashboard')
      } catch (err) {
        console.error(err)
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

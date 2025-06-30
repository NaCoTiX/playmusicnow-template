import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SpotifyService from './spotifyService'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      try {
        const spotifyService = new SpotifyService()

        if (!spotifyService.accessToken) {
          navigate('/')
          return
        }

        const [userProfile, userPlaylists] = await Promise.all([
          spotifyService.getUserProfile(),
          spotifyService.getUserPlaylists()
        ])

        setUser(userProfile)
        setPlaylists(userPlaylists.items || [])
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token')
    navigate('/')
  }

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading...</div>
  if (error) return <div style={{ padding: '2rem', color: '#ff6b6b' }}>Error: {error}</div>

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#191414',
      color: '#ffffff',
      padding: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Welcome, {user?.display_name || 'User'}!</h1>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#e22134',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <h2>Your Playlists</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {playlists.map(playlist => (
          <div
            key={playlist.id}
            onClick={() => navigate(`/playlist/${playlist.id}`)}
            style={{
              backgroundColor: '#282828',
              padding: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#3e3e3e'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#282828'}
          >
            {playlist.images?.[0] && (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                style={{ width: '100%', borderRadius: '4px', marginBottom: '0.5rem' }}
              />
            )}
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{playlist.name}</h3>
            <p style={{ margin: 0, color: '#b3b3b3' }}>{playlist.tracks?.total || 0} tracks</p>
          </div>
        ))}
      </div>
    </div>
  )
}
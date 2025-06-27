
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [sharedPlaylists, setSharedPlaylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authCode = localStorage.getItem('spotifyAuthCode')
    if (!authCode) {
      navigate('/')
      return
    }
    
    // Simulate loading user data and playlists
    // In a real app, you'd exchange the code for tokens and fetch from Spotify API
    setUser({ name: 'Spotify User', id: 'user123' })
    setPlaylists([
      { id: '1', name: 'My Awesome Playlist', tracks: 25 },
      { id: '2', name: 'Chill Vibes', tracks: 18 }
    ])
    
    // Load shared playlists from localStorage
    const saved = localStorage.getItem('sharedPlaylists')
    if (saved) {
      setSharedPlaylists(JSON.parse(saved))
    }
    
    setLoading(false)
  }, [navigate])

  const sharePlaylist = (playlist) => {
    const sharedPlaylist = {
      ...playlist,
      sharedBy: user.name,
      sharedAt: new Date().toISOString()
    }
    
    const updated = [...sharedPlaylists, sharedPlaylist]
    setSharedPlaylists(updated)
    localStorage.setItem('sharedPlaylists', JSON.stringify(updated))
    alert(`Shared "${playlist.name}" successfully!`)
  }

  const logout = () => {
    localStorage.removeItem('spotifyAuthCode')
    localStorage.removeItem('code_verifier')
    navigate('/')
  }

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>PlayMusicNow Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user.name}!</span>
          <button onClick={logout} style={{ padding: '0.5rem 1rem' }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h2>Your Playlists</h2>
          {playlists.map(playlist => (
            <div key={playlist.id} style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              marginBottom: '1rem',
              borderRadius: '8px'
            }}>
              <h3>{playlist.name}</h3>
              <p>{playlist.tracks} tracks</p>
              <button 
                onClick={() => sharePlaylist(playlist)}
                style={{ 
                  backgroundColor: '#1DB954', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Share Playlist
              </button>
            </div>
          ))}
        </div>

        <div>
          <h2>Community Shared Playlists</h2>
          {sharedPlaylists.length === 0 ? (
            <p>No shared playlists yet. Share yours to get started!</p>
          ) : (
            sharedPlaylists.map((playlist, index) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginBottom: '1rem',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3>{playlist.name}</h3>
                <p>{playlist.tracks} tracks</p>
                <p style={{ fontSize: '0.9em', color: '#666' }}>
                  Shared by {playlist.sharedBy} on {new Date(playlist.sharedAt).toLocaleDateString()}
                </p>
                <button style={{ 
                  backgroundColor: '#1976d2', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Listen
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

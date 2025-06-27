
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [collaborativePlaylists, setCollaborativePlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')

  useEffect(() => {
    const authCode = localStorage.getItem('spotifyAuthCode')
    if (!authCode) {
      navigate('/')
      return
    }
    
    // Simulate loading user data and playlists
    setUser({ name: 'Spotify User', id: 'user123' })
    setPlaylists([
      { id: '1', name: 'My Awesome Playlist', tracks: 25, description: 'My personal favorites' },
      { id: '2', name: 'Chill Vibes', tracks: 18, description: 'Relaxing music' }
    ])
    
    // Load collaborative playlists from localStorage
    const saved = localStorage.getItem('collaborativePlaylists')
    if (saved) {
      setCollaborativePlaylists(JSON.parse(saved))
    }
    
    setLoading(false)
  }, [navigate])

  const createCollaborativePlaylist = () => {
    if (!newPlaylistName.trim()) return

    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      description: newPlaylistDescription,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      songs: [],
      shareLink: `${window.location.origin}/playlist/${Date.now()}`
    }
    
    const updated = [...collaborativePlaylists, newPlaylist]
    setCollaborativePlaylists(updated)
    localStorage.setItem('collaborativePlaylists', JSON.stringify(updated))
    
    setNewPlaylistName('')
    setNewPlaylistDescription('')
    setShowCreateForm(false)
    alert(`Created "${newPlaylist.name}" successfully! Share link: ${newPlaylist.shareLink}`)
  }

  const copyShareLink = (shareLink) => {
    navigator.clipboard.writeText(shareLink)
    alert('Share link copied to clipboard!')
  }

  const logout = () => {
    localStorage.removeItem('spotifyAuthCode')
    localStorage.removeItem('code_verifier')
    navigate('/')
  }

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        borderBottom: '2px solid #1DB954',
        paddingBottom: '1rem'
      }}>
        <h1 style={{ color: '#1DB954', margin: 0 }}>PlayMusicNow Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 'bold' }}>Welcome, {user.name}!</span>
          <button 
            onClick={logout} 
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#333' }}>Your Collaborative Playlists</h2>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              backgroundColor: '#1DB954',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Create New Playlist
          </button>
        </div>

        {showCreateForm && (
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '2rem', 
            borderRadius: '8px', 
            marginBottom: '2rem',
            border: '1px solid #ddd'
          }}>
            <h3>Create Collaborative Playlist</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Playlist Name:
              </label>
              <input 
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Enter playlist name"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Description:
              </label>
              <textarea 
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  minHeight: '80px'
                }}
                placeholder="Enter description (optional)"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={createCollaborativePlaylist}
                style={{
                  backgroundColor: '#1DB954',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Playlist
              </button>
              <button 
                onClick={() => setShowCreateForm(false)}
                style={{
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {collaborativePlaylists.map(playlist => (
            <div key={playlist.id} style={{ 
              border: '1px solid #ddd', 
              padding: '1.5rem', 
              borderRadius: '12px',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#1DB954', marginBottom: '0.5rem' }}>{playlist.name}</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{playlist.description}</p>
              <p style={{ fontSize: '0.9em', color: '#999', marginBottom: '1rem' }}>
                Created by {playlist.createdBy} • {playlist.songs.length} songs
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => copyShareLink(playlist.shareLink)}
                  style={{ 
                    backgroundColor: '#1DB954', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.6rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  📋 Copy Share Link
                </button>
                <button style={{ 
                  backgroundColor: '#1976d2', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  🎵 Manage Songs
                </button>
              </div>
            </div>
          ))}
        </div>

        {collaborativePlaylists.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#666',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <h3>No collaborative playlists yet</h3>
            <p>Create your first playlist to start collaborating with friends!</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Your Spotify Playlists</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {playlists.map(playlist => (
            <div key={playlist.id} style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{playlist.name}</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{playlist.description}</p>
              <p style={{ fontSize: '0.9em', color: '#999' }}>{playlist.tracks} tracks</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

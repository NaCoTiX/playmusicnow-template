import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeProvider'
import SpotifyService from './spotifyService.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const { isDark, toggleTheme, colors } = useTheme()
  const [user, setUser] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [collaborativePlaylists, setCollaborativePlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [showQRCode, setShowQRCode] = useState(null)

  useEffect(() => {
    const spotifyService = new SpotifyService()

    if (!spotifyService.isAuthenticated()) {
      navigate('/')
      return
    }

    async function loadData() {
      try {
        // Load real user data and playlists
        const userData = await spotifyService.getCurrentUser()
        setUser({ name: userData.display_name, id: userData.id })

        const playlistData = await spotifyService.getUserPlaylists()
        setPlaylists(playlistData.items.map(p => ({
          id: p.id,
          name: p.name,
          tracks: p.tracks.total,
          description: p.description || ''
        })))

        // Load collaborative playlists from localStorage
        const saved = localStorage.getItem('collaborativePlaylists')
        if (saved) {
          setCollaborativePlaylists(JSON.parse(saved))
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
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
      shareLink: `${window.location.origin}/playlist/${Date.now()}`,
      analytics: {
        totalContributors: 0,
        topGenres: [],
        activityTimeline: []
      }
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

  const generateQRCode = (text) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
  }

  const syncToSpotify = async (playlist) => {
    try {
      const spotifyService = new SpotifyService()

      // Create Spotify playlist
      const spotifyPlaylist = await spotifyService.createPlaylist(
        playlist.name,
        `${playlist.description} (Synced from SpotMusic.xyz)`
      )

      // Add tracks to Spotify playlist if there are any
      if (playlist.songs.length > 0) {
        const trackUris = playlist.songs.map(song => song.uri).filter(uri => uri)
        if (trackUris.length > 0) {
          await spotifyService.addTracksToPlaylist(spotifyPlaylist.id, trackUris)
        }
      }

      // Update local playlist with Spotify ID
      const updated = collaborativePlaylists.map(p => 
        p.id === playlist.id ? { ...p, spotifyId: spotifyPlaylist.id } : p
      )
      setCollaborativePlaylists(updated)
      localStorage.setItem('collaborativePlaylists', JSON.stringify(updated))

      alert(`Playlist "${playlist.name}" synced to Spotify! You can now play it on Spotify.`)
    } catch (error) {
      console.error('Error syncing to Spotify:', error)
      alert('Error syncing to Spotify. Please try again.')
    }
  }

  const logout = () => {
    localStorage.removeItem('spotifyAuthCode')
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    navigate('/')
  }

  const getPlaylistAnalytics = (playlist) => {
    const uniqueContributors = new Set(playlist.songs.map(s => s.addedBy)).size
    const totalVotes = playlist.songs.reduce((sum, song) => 
      (song.upvotes || 0) + (song.downvotes || 0) + sum, 0
    )

    return {
      contributors: uniqueContributors,
      totalSongs: playlist.songs.length,
      totalVotes,
      avgScore: playlist.songs.length > 0 
        ? playlist.songs.reduce((sum, song) => 
            sum + ((song.upvotes || 0) - (song.downvotes || 0)), 0) / playlist.songs.length
        : 0
    }
  }

  if (loading) return (
    <div style={{ 
      textAlign: 'center', 
      marginTop: '3rem', 
      color: colors.text 
    }}>
      Loading...
    </div>
  )

  return (
    <div style={{ 
      padding: 'clamp(1rem, 3vw, 2rem)', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ color: colors.primary, marginBottom: '0.5rem' }}>
            Welcome back, {user?.name}! 🎵
          </h1>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            Manage your collaborative playlists
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'SpotMusic.xyz - Collaborative Playlists',
                  text: 'Create collaborative playlists that anyone can contribute to!',
                  url: window.location.origin
                })
              } else {
                navigator.clipboard.writeText(window.location.origin)
                alert('Website link copied to clipboard! Share it with friends.')
              }
            }}
            style={{
              backgroundColor: '#FF6B35',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
          >
            📤 Share App
          </button>
          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button 
            onClick={logout}
            style={{
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Collaborative Playlists Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ color: colors.text, margin: 0 }}>Your Collaborative Playlists</h2>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            + Create New Playlist
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div style={{ 
            backgroundColor: colors.surface, 
            padding: '2rem', 
            borderRadius: '12px', 
            marginBottom: '2rem',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Create Collaborative Playlist</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                color: colors.text
              }}>
                Playlist Name:
              </label>
              <input 
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="Enter playlist name"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                color: colors.text
              }}>
                Description:
              </label>
              <textarea 
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  minHeight: '80px',
                  backgroundColor: colors.background,
                  color: colors.text,
                  resize: 'vertical'
                }}
                placeholder="Enter description (optional)"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={createCollaborativePlaylist}
                style={{
                  backgroundColor: colors.primary,
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

        {/* Playlists Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {collaborativePlaylists.map(playlist => {
            const analytics = getPlaylistAnalytics(playlist)
            return (
              <div key={playlist.id} style={{ 
                border: `1px solid ${colors.border}`, 
                padding: '1.5rem', 
                borderRadius: '12px',
                backgroundColor: colors.card,
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}>
                <h3 style={{ color: colors.primary, marginBottom: '0.5rem' }}>
                  {playlist.name}
                </h3>
                <p style={{ color: colors.textSecondary, marginBottom: '1rem' }}>
                  {playlist.description}
                </p>

                {/* Analytics */}
                <div style={{ 
                  backgroundColor: colors.surface,
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: colors.text, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    📊 Analytics
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: colors.textSecondary }}>Songs: {analytics.totalSongs}</span>
                    <span style={{ color: colors.textSecondary }}>Contributors: {analytics.contributors}</span>
                    <span style={{ color: colors.textSecondary }}>Total Votes: {analytics.totalVotes}</span>
                    <span style={{ color: colors.textSecondary }}>Avg Score: {analytics.avgScore.toFixed(1)}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9em', color: colors.textSecondary, marginBottom: '1rem' }}>
                  Created by {playlist.createdBy}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => copyShareLink(playlist.shareLink)}
                    style={{ 
                      backgroundColor: colors.primary, 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      flex: '1',
                      minWidth: '120px'
                    }}
                  >
                    📋 Copy Link
                  </button>
                  <button 
                    onClick={() => setShowQRCode(showQRCode === playlist.id ? null : playlist.id)}
                    style={{ 
                      backgroundColor: '#2196F3', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    📱 QR
                  </button>
                  <button 
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    style={{ 
                      backgroundColor: '#FF9800', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    🎵 View
                  </button>
                </div>

                {/* QR Code */}
                {showQRCode === playlist.id && (
                  <div style={{ 
                    textAlign: 'center', 
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: colors.surface,
                    borderRadius: '8px'
                  }}>
                    <img 
                      src={generateQRCode(playlist.shareLink)} 
                      alt="QR Code"
                      style={{ maxWidth: '150px', height: 'auto' }}
                    />
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: colors.textSecondary }}>
                      Scan to share playlist
                    </p>
                  </div>
                )}

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {!playlist.spotifyId ? (
                    <button 
                      onClick={() => syncToSpotify(playlist)}
                      style={{ 
                        backgroundColor: '#FF6B35', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.6rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        flex: '1'
                      }}
                    >
                      🔄 Sync to Spotify
                    </button>
                  ) : (
                    <a 
                      href={`https://open.spotify.com/playlist/${playlist.spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        backgroundColor: colors.primary, 
                        color: 'white', 
                        textDecoration: 'none',
                        padding: '0.6rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        display: 'block',
                        textAlign: 'center',
                        flex: '1'
                      }}
                    >
                      ▶️ Play on Spotify
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {collaborativePlaylists.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: colors.textSecondary,
            backgroundColor: colors.surface,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
            <h3 style={{ color: colors.text }}>No collaborative playlists yet</h3>
            <p>Create your first playlist to start collaborating with friends!</p>
          </div>
        )}
      </div>

      {/* Spotify Playlists Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ color: colors.text, marginBottom: '1rem' }}>Your Spotify Playlists</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1rem' 
        }}>
          {playlists.map(playlist => (
            <div key={playlist.id} style={{ 
              border: `1px solid ${colors.border}`, 
              padding: '1rem', 
              borderRadius: '8px',
              backgroundColor: colors.surface,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => window.open(`https://open.spotify.com/playlist/${playlist.id}`, '_blank')}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              <h3 style={{ marginBottom: '0.5rem', color: colors.text }}>{playlist.name}</h3>
              <p style={{ color: colors.textSecondary, marginBottom: '1rem' }}>{playlist.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.9em', color: colors.textSecondary, margin: 0 }}>{playlist.tracks} tracks</p>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: colors.primary,
                  fontWeight: 'bold'
                }}>
                  Click to open →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
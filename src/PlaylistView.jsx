
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SpotifyService from './spotifyService.js'

export default function PlaylistView() {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load playlist from localStorage
    const saved = localStorage.getItem('collaborativePlaylists')
    if (saved) {
      const playlists = JSON.parse(saved)
      const found = playlists.find(p => p.id === playlistId || p.shareLink.includes(playlistId))
      if (found) {
        setPlaylist(found)
      }
    }
    setLoading(false)
  }, [playlistId])

  const searchSpotify = async () => {
    if (!searchTerm.trim()) return

    try {
      const spotifyService = new SpotifyService()
      const searchData = await spotifyService.searchTracks(searchTerm)
      
      const results = searchData.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        duration: formatDuration(track.duration_ms),
        uri: track.uri,
        external_urls: track.external_urls
      }))
      
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching Spotify:', error)
      alert('Error searching Spotify. Please try again.')
    }
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}:${seconds.padStart(2, '0')}`
  }

  const addSongToPlaylist = async (song) => {
    if (!playlist) return

    const newSong = {
      ...song,
      addedBy: 'Anonymous User',
      addedAt: new Date().toISOString()
    }

    const updatedPlaylist = {
      ...playlist,
      songs: [...playlist.songs, newSong]
    }

    // Update localStorage
    const saved = localStorage.getItem('collaborativePlaylists')
    if (saved) {
      const playlists = JSON.parse(saved)
      const updated = playlists.map(p => 
        p.id === playlistId || p.shareLink.includes(playlistId) ? updatedPlaylist : p
      )
      localStorage.setItem('collaborativePlaylists', JSON.stringify(updated))
    }

    setPlaylist(updatedPlaylist)

    // Auto-sync to Spotify if playlist is already synced
    if (playlist.spotifyId && song.uri) {
      try {
        const spotifyService = new SpotifyService()
        await spotifyService.addTracksToPlaylist(playlist.spotifyId, [song.uri])
        alert(`Added "${song.name}" to the playlist and synced to Spotify!`)
      } catch (error) {
        console.error('Error syncing to Spotify:', error)
        alert(`Added "${song.name}" to the playlist, but failed to sync to Spotify.`)
      }
    } else {
      alert(`Added "${song.name}" to the playlist!`)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>
  }

  if (!playlist) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem' }}>
        <h2>Playlist not found</h2>
        <p>The playlist you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          ← Back to Home
        </button>
        
        <h1 style={{ color: '#1DB954', marginBottom: '0.5rem' }}>{playlist.name}</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>{playlist.description}</p>
        <p style={{ fontSize: '0.9rem', color: '#999' }}>
          Created by {playlist.createdBy} • {playlist.songs.length} songs
          {playlist.spotifyId && (
            <span>
              {' • '}
              <a 
                href={`https://open.spotify.com/playlist/${playlist.spotifyId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1DB954', textDecoration: 'none' }}
              >
                ▶️ Play on Spotify
              </a>
            </span>
          )}
        </p>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          border: '1px solid #2196f3'
        }}>
          <p style={{ margin: 0, color: '#1976d2', fontWeight: 'bold' }}>
            📤 Share this playlist: Anyone with this link can add songs!
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '0.9rem', 
            color: '#666',
            wordBreak: 'break-all'
          }}>
            {window.location.href}
          </p>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              alert('Playlist link copied to clipboard!')
            }}
            style={{
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            📋 Copy Link
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '2rem', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Add Songs to Playlist</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchSpotify()}
            style={{ 
              flex: 1, 
              padding: '0.8rem', 
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
            placeholder="Search for songs, artists, or albums..."
          />
          <button 
            onClick={searchSpotify}
            style={{
              backgroundColor: '#1DB954',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Search Results</h3>
            {searchResults.map(song => (
              <div key={song.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '0.5rem'
              }}>
                <div>
                  <h4 style={{ margin: 0, color: '#333' }}>{song.name}</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{song.artist} • {song.duration}</p>
                </div>
                <button 
                  onClick={() => addSongToPlaylist(song)}
                  style={{
                    backgroundColor: '#1DB954',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ marginBottom: '1rem' }}>Current Playlist ({playlist.songs.length} songs)</h2>
        {playlist.songs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <p style={{ color: '#666' }}>No songs in this playlist yet. Be the first to add one!</p>
          </div>
        ) : (
          playlist.songs.map((song, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              marginBottom: '0.5rem'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#333' }}>{song.name}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {song.artist} • {song.duration}
                </p>
                <p style={{ margin: 0, color: '#999', fontSize: '0.8rem' }}>
                  Added by {song.addedBy} on {new Date(song.addedAt).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => {
                  if (song.external_urls && song.external_urls.spotify) {
                    window.open(song.external_urls.spotify, '_blank')
                  } else {
                    alert('Spotify link not available for this song')
                  }
                }}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ▶️ Play on Spotify
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

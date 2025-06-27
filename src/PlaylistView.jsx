
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeProvider'
import { VotingSystem } from './VotingSystem'
import SpotifyService from './spotifyService.js'

export default function PlaylistView() {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const { colors } = useTheme()
  const [playlist, setPlaylist] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [userVotes, setUserVotes] = useState({})

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
    
    // Load user votes
    const savedVotes = localStorage.getItem(`votes_${playlistId}`)
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes))
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
        external_urls: track.external_urls,
        preview_url: track.preview_url,
        popularity: track.popularity
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

    const contributorName = prompt('Enter your name (optional):') || 'Anonymous User'

    const newSong = {
      ...song,
      addedBy: contributorName,
      addedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0
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

  const handleVote = (songId, voteType, newVote) => {
    if (!playlist) return

    const updatedSongs = playlist.songs.map(song => {
      if (song.id === songId) {
        const currentUserVote = userVotes[songId]
        let newUpvotes = song.upvotes || 0
        let newDownvotes = song.downvotes || 0

        // Remove previous vote
        if (currentUserVote === 'up') newUpvotes--
        if (currentUserVote === 'down') newDownvotes--

        // Add new vote
        if (newVote === 'up') newUpvotes++
        if (newVote === 'down') newDownvotes++

        return {
          ...song,
          upvotes: Math.max(0, newUpvotes),
          downvotes: Math.max(0, newDownvotes)
        }
      }
      return song
    })

    const updatedPlaylist = { ...playlist, songs: updatedSongs }
    setPlaylist(updatedPlaylist)

    // Update user votes
    const newUserVotes = { ...userVotes, [songId]: newVote }
    setUserVotes(newUserVotes)
    localStorage.setItem(`votes_${playlistId}`, JSON.stringify(newUserVotes))

    // Update localStorage
    const saved = localStorage.getItem('collaborativePlaylists')
    if (saved) {
      const playlists = JSON.parse(saved)
      const updated = playlists.map(p => 
        p.id === playlistId || p.shareLink.includes(playlistId) ? updatedPlaylist : p
      )
      localStorage.setItem('collaborativePlaylists', JSON.stringify(updated))
    }
  }

  const getSortedSongs = () => {
    if (!playlist?.songs) return []
    
    const songs = [...playlist.songs]
    
    switch (sortBy) {
      case 'votes':
        return songs.sort((a, b) => 
          ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0))
        )
      case 'oldest':
        return songs.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
      case 'newest':
      default:
        return songs.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    }
  }

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem',
        color: colors.text
      }}>
        Loading...
      </div>
    )
  }

  if (!playlist) {
    return (
      <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem', 
        padding: '2rem',
        color: colors.text
      }}>
        <h2 style={{ color: colors.text }}>Playlist not found</h2>
        <p style={{ color: colors.textSecondary }}>
          The playlist you're looking for doesn't exist or has been removed.
        </p>
        <button 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: colors.primary,
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

  const sortedSongs = getSortedSongs()

  return (
    <div style={{ 
      padding: 'clamp(1rem, 3vw, 2rem)', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      {/* Header */}
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
        
        <h1 style={{ 
          color: colors.primary, 
          marginBottom: '0.5rem',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
        }}>
          {playlist.name}
        </h1>
        <p style={{ color: colors.textSecondary, marginBottom: '1rem' }}>
          {playlist.description}
        </p>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          alignItems: 'center',
          fontSize: '0.9rem', 
          color: colors.textSecondary
        }}>
          <span>Created by {playlist.createdBy}</span>
          <span>•</span>
          <span>{playlist.songs.length} songs</span>
          {playlist.spotifyId && (
            <>
              <span>•</span>
              <a 
                href={`https://open.spotify.com/playlist/${playlist.spotifyId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.primary, textDecoration: 'none' }}
              >
                ▶️ Play on Spotify
              </a>
            </>
          )}
        </div>
        
        {/* Share Section */}
        <div style={{ 
          backgroundColor: colors.surface, 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          border: `1px solid ${colors.border}`
        }}>
          <p style={{ margin: 0, color: colors.text, fontWeight: 'bold' }}>
            📤 Share this playlist: Anyone with this link can add songs!
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginTop: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              value={window.location.href}
              readOnly
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '0.5rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                backgroundColor: colors.background,
                color: colors.text,
                fontSize: '0.9rem'
              }}
            />
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
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div style={{ 
        backgroundColor: colors.surface, 
        padding: 'clamp(1rem, 3vw, 2rem)', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ marginBottom: '1rem', color: colors.text }}>Add Songs to Playlist</h2>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchSpotify()}
            style={{ 
              flex: '1', 
              minWidth: '200px',
              padding: '0.8rem', 
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="Search for songs, artists, or albums..."
          />
          <button 
            onClick={searchSpotify}
            style={{
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem', color: colors.text }}>Search Results</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {searchResults.map(song => (
                <div key={song.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <h4 style={{ margin: 0, color: colors.text }}>{song.name}</h4>
                    <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
                      {song.artist} • {song.duration}
                    </p>
                    {song.popularity && (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: colors.textSecondary,
                        marginTop: '0.2rem'
                      }}>
                        Popularity: {song.popularity}/100
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {song.preview_url && (
                      <audio 
                        controls 
                        style={{ width: '150px', height: '30px' }}
                        preload="none"
                      >
                        <source src={song.preview_url} type="audio/mpeg" />
                      </audio>
                    )}
                    <button 
                      onClick={() => addSongToPlaylist(song)}
                      style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Playlist */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ color: colors.text, margin: 0 }}>
            Current Playlist ({sortedSongs.length} songs)
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.background,
              color: colors.text
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="votes">Highest Voted</option>
          </select>
        </div>

        {sortedSongs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            backgroundColor: colors.surface,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
            <h3 style={{ color: colors.text }}>No songs in this playlist yet</h3>
            <p style={{ color: colors.textSecondary }}>Be the first to add one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sortedSongs.map((song, index) => (
              <div key={`${song.id}-${index}`} style={{ 
                padding: '1rem',
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <h4 style={{ margin: 0, color: colors.text }}>{song.name}</h4>
                    <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
                      {song.artist} • {song.duration}
                    </p>
                    <p style={{ margin: '0.2rem 0 0 0', color: colors.textSecondary, fontSize: '0.8rem' }}>
                      Added by {song.addedBy} on {new Date(song.addedAt).toLocaleDateString()}
                    </p>
                    
                    <VotingSystem 
                      song={song}
                      onVote={handleVote}
                      userVote={userVotes[song.id]}
                    />
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
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ▶️ Play on Spotify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

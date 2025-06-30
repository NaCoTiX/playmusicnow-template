import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function PlaylistView() {
  const { playlistId } = useParams()
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#191414',
      color: '#ffffff',
      padding: '2rem'
    }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          backgroundColor: '#1DB954',
          color: '#ffffff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        ← Back to Dashboard
      </button>

      <h1>Playlist View</h1>
      <p>Playlist ID: {playlistId}</p>
      <p>This feature is coming soon!</p>
    </div>
  )
}
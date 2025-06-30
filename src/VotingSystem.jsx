
import React from 'react'
import { useTheme } from './ThemeProvider'

export function VotingSystem({ song, onVote, userVote }) {
  const { colors } = useTheme()
  
  const handleVote = (voteType) => {
    const newVote = userVote === voteType ? null : voteType
    onVote(song.id, voteType, newVote)
  }

  const upvotes = song.upvotes || 0
  const downvotes = song.downvotes || 0
  const score = upvotes - downvotes

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      margin: '0.5rem 0'
    }}>
      <button
        onClick={() => handleVote('up')}
        style={{
          backgroundColor: userVote === 'up' ? '#4CAF50' : 'transparent',
          color: userVote === 'up' ? 'white' : '#4CAF50',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          padding: '0.3rem 0.6rem',
          cursor: 'pointer',
          fontSize: '0.8rem',
          transition: 'all 0.2s ease'
        }}
      >
        👍 {upvotes}
      </button>

      <span style={{ 
        color: score > 0 ? '#4CAF50' : score < 0 ? '#f44336' : colors.textSecondary,
        fontWeight: 'bold'
      }}>
        {score > 0 ? '+' : ''}{score}
      </span>

      <button
        onClick={() => handleVote('down')}
        style={{
          backgroundColor: userVote === 'down' ? '#f44336' : 'transparent',
          color: userVote === 'down' ? 'white' : '#f44336',
          border: '1px solid #f44336',
          borderRadius: '4px',
          padding: '0.3rem 0.6rem',
          cursor: 'pointer',
          fontSize: '0.8rem',
          transition: 'all 0.2s ease'
        }}
      >
        👎 {downvotes}
      </button>
    </div>
  )
}

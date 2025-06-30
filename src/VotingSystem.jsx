import React from 'react'
import { useTheme } from './ThemeProvider'

export function VotingSystem({ song, onVote, userVote }) {
  const { colors } = useTheme()

  const handleVote = (voteType) => {
    // If user clicks the same vote type, remove their vote
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
      gap: '1rem', 
      marginTop: '0.5rem',
      fontSize: '0.9rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => handleVote('up')}
          style={{
            backgroundColor: userVote === 'up' ? colors.primary : 'transparent',
            color: userVote === 'up' ? 'white' : colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            padding: '0.3rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
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
            color: userVote === 'down' ? 'white' : colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            padding: '0.3rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          👎 {downvotes}
        </button>
      </div>
    </div>
  )
}
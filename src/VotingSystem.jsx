
import React from 'react'

export const VotingSystem = ({ song, onVote, currentVotes = 0, userVote = null }) => {
  const handleVote = (voteType) => {
    onVote(song.id, voteType, userVote === voteType ? null : voteType)
  }

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
          fontSize: '0.8rem'
        }}
      >
        👍 {song.upvotes || 0}
      </button>
      <button
        onClick={() => handleVote('down')}
        style={{
          backgroundColor: userVote === 'down' ? '#f44336' : 'transparent',
          color: userVote === 'down' ? 'white' : '#f44336',
          border: '1px solid #f44336',
          borderRadius: '4px',
          padding: '0.3rem 0.6rem',
          cursor: 'pointer',
          fontSize: '0.8rem'
        }}
      >
        👎 {song.downvotes || 0}
      </button>
      <span style={{ fontSize: '0.8rem', color: '#666' }}>
        Score: {(song.upvotes || 0) - (song.downvotes || 0)}
      </span>
    </div>
  )
}

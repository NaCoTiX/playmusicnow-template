// Spotify API service
const CLIENT_ID = 'f802e53f98464b8b9f91ce37a97b7ad6' // Your actual client ID

// Use dynamic redirect URI based on current domain
const getRedirectURI = () => {
  const currentDomain = window.location.origin

  // For Vercel deployments
  if (currentDomain.includes('vercel.app') || currentDomain === 'https://spotmusic.xyz') {
    return 'https://spotmusic.xyz/callback'
  }

  // For development
  if (currentDomain.includes('replit.dev') || currentDomain.includes('localhost')) {
    return `${currentDomain}/callback`
  }

  // Default to production URL
  return 'https://spotmusic.xyz/callback'
}

class SpotifyService {
  constructor() {
    this.accessToken = localStorage.getItem('spotify_access_token')
    this.refreshToken = localStorage.getItem('spotify_refresh_token')
  }

  getRedirectURI() {
    return getRedirectURI()
  }

  async exchangeCodeForToken(code) {
    const verifier = localStorage.getItem('code_verifier')

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.getRedirectURI(),
      client_id: CLIENT_ID,
    })

    // Only add PKCE verifier if it exists (for Safari iOS compatibility)
    if (verifier) {
      body.append('code_verifier', verifier)
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token

    localStorage.setItem('spotify_access_token', this.accessToken)
    localStorage.setItem('spotify_refresh_token', this.refreshToken)
    localStorage.removeItem('code_verifier')

    return data
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: CLIENT_ID,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    this.accessToken = data.access_token
    localStorage.setItem('spotify_access_token', this.accessToken)

    return data
  }

  async apiCall(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    let response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // If token is expired, try to refresh
    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken()
      response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
    }

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }

    return response.json()
  }

  async getCurrentUser() {
    return this.apiCall('/me')
  }

  async getUserPlaylists() {
    return this.apiCall('/me/playlists')
  }

  async searchTracks(query, limit = 20) {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    })
    return this.apiCall(`/search?${params}`)
  }

  async createPlaylist(name, description, isPublic = true) {
    const user = await this.getCurrentUser()
    return this.apiCall(`/users/${user.id}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
        collaborative: false,
      }),
    })
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    return this.apiCall(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({
        uris: trackUris,
      }),
    })
  }

  async getPlaylist(playlistId) {
    return this.apiCall(`/playlists/${playlistId}`)
  }

  isAuthenticated() {
    return !!this.accessToken
  }

  logout() {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotifyAuthCode')
    this.accessToken = null
    this.refreshToken = null
  }
}

export default SpotifyService
// spotifyAuth.js
const CLIENT_ID = 'f802e53f98464b8b9f91ce37a97b7ad6'

// Use dynamic redirect URI based on current domain
const getRedirectURI = () => {
  const currentDomain = window.location.origin
  if (currentDomain.includes('replit.dev') || currentDomain.includes('localhost')) {
    return `${currentDomain}/callback`
  }
  return 'https://spotmusic.xyz/callback'
}

const REDIRECT_URI = getRedirectURI()

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state'
]

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => charset[x % charset.length])
    .join('')
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function redirectToSpotifyAuth() {
  const verifier = generateRandomString(128)
  const challenge = await generateCodeChallenge(verifier)

  localStorage.setItem('code_verifier', verifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

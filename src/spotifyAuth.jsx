
// spotifyAuth.js
const CLIENT_ID = 'f802e53f98464b8b9f91ce37a97b7ad6'

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
  let result = ''
  
  // Use Math.random for better compatibility across all devices
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

async function generateCodeChallenge(verifier) {
  // Check if crypto.subtle is available
  if (typeof crypto === 'undefined' || !crypto.subtle || !window.TextEncoder) {
    return null
  }
  
  try {
    const data = new TextEncoder().encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch (error) {
    console.warn('PKCE not supported, falling back to basic auth flow')
    return null
  }
}

export async function redirectToSpotifyAuth() {
  const state = generateRandomString(16)
  localStorage.setItem('spotify_auth_state', state)
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    redirect_uri: REDIRECT_URI,
    state: state
  })

  // Try to use PKCE if supported
  try {
    const verifier = generateRandomString(128)
    const challenge = await generateCodeChallenge(verifier)
    
    if (challenge) {
      localStorage.setItem('code_verifier', verifier)
      params.append('code_challenge_method', 'S256')
      params.append('code_challenge', challenge)
    }
  } catch (error) {
    console.warn('PKCE not supported on this device, using basic flow')
  }

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

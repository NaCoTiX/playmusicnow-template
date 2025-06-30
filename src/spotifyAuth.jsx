
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
  
  // Fallback for Safari iOS - use Math.random instead of crypto
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return result
  }
  
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length]
  }
  return result
}

async function generateCodeChallenge(verifier) {
  // Fallback for Safari iOS - skip PKCE if crypto.subtle not available
  if (typeof crypto === 'undefined' || !crypto.subtle) {
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
  const verifier = generateRandomString(128)
  let challenge = null
  
  // Try to generate code challenge, fallback gracefully
  try {
    challenge = await generateCodeChallenge(verifier)
  } catch (error) {
    console.warn('PKCE not supported on this device')
  }

  if (challenge) {
    localStorage.setItem('code_verifier', verifier)
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    redirect_uri: REDIRECT_URI
  })

  // Only add PKCE params if supported
  if (challenge) {
    params.append('code_challenge_method', 'S256')
    params.append('code_challenge', challenge)
  }

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

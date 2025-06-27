import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './Login'
import SpotifyCallback from './SpotifyCallback'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<SpotifyCallback />} />
      </Routes>
    </Router>
  )
}

'use client'

import { useState } from 'react'

export default function ApiTestPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [token, setToken] = useState('')
  const [songName, setSongName] = useState('')
  const [songs, setSongs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${baseUrl}/api/auth/login-api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        setToken(data.token)
        setMessage('✅ Login successful! Token saved.')
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGetFavorites = async () => {
    if (!token) {
      setMessage('❌ Please login first to get a token')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${baseUrl}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setSongs(data.songs || [])
        setMessage(`✅ Found ${data.songs?.length || 0} songs`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to fetch favorites')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFavorite = async () => {
    if (!token) {
      setMessage('❌ Please login first to get a token')
      return
    }
    if (!songName.trim()) {
      setMessage('❌ Please enter a song name')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${baseUrl}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songName: songName.trim() }),
      })
      const data = await response.json()
      if (response.ok) {
        setSongName('')
        setMessage('✅ Song added successfully!')
        handleGetFavorites() // Refresh list
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to add song')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) {
      setMessage('❌ Please login first')
      return
    }
    if (!confirm('Delete this song?')) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${baseUrl}/api/favorites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setMessage('✅ Song deleted!')
        handleGetFavorites() // Refresh list
      } else {
        const data = await response.json()
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to delete song')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">
          API Testing UI
        </h1>

        {/* Login Section */}
        <div className="border border-gray-300 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">1. Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full border border-gray-300 py-3 px-4 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login & Get Token'}
            </button>
            {token && (
              <div className="mt-4 p-3 border border-gray-300 bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Token (copy for Postman):
                </p>
                <code className="text-xs bg-white p-2 border border-gray-300 block break-all">
                  {token}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 p-4 border border-gray-300 bg-gray-50">
            {message}
          </div>
        )}

        {/* Add Favorite Section */}
        <div className="border border-gray-300 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            2. Add Favorite Song
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="Enter song name..."
              className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFavorite()}
            />
            <button
              onClick={handleAddFavorite}
              disabled={loading || !token}
              className="border border-gray-300 px-6 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Get Favorites Section */}
        <div className="border border-gray-300 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              3. My Favorite Songs
            </h2>
            <button
              onClick={handleGetFavorites}
              disabled={loading || !token}
              className="border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          {songs.length === 0 ? (
            <p className="text-center py-8 text-gray-600">
              No songs yet. Add one above!
            </p>
          ) : (
            <ul className="space-y-3">
              {songs.map((song) => (
                <li
                  key={song.id}
                  className="flex justify-between items-center p-4 border border-gray-300 hover:bg-gray-50"
                >
                  <span>
                    {song.songName}
                  </span>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Instructions */}
        <div className="border border-gray-300 p-6">
          <h2 className="text-xl font-bold mb-4">
            Postman Instructions
          </h2>
          <div className="space-y-2">
            <p>
              <strong>1. Login:</strong> POST {baseUrl}/api/auth/login-api
            </p>
            <p className="ml-4">Body: {`{"email": "...", "password": "..."}`}</p>
            <p>
              <strong>2. Use Token:</strong> Add header: Authorization: Bearer
              {'<token>'}
            </p>
            <p>
              <strong>3. Get Favorites:</strong> GET {baseUrl}/api/favorites
            </p>
            <p>
              <strong>4. Add Favorite:</strong> POST {baseUrl}/api/favorites
            </p>
            <p className="ml-4">Body: {`{"songName": "..."}`}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


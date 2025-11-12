'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface FavoriteSong {
  id: string
  songName: string
  createdAt: string
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [songName, setSongName] = useState('')
  const [songs, setSongs] = useState<FavoriteSong[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchSongs()
    }
  }, [status, router])

  const fetchSongs = async () => {
    try {
      setFetching(true)
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setSongs(data.songs)
      } else {
        setError('Failed to fetch songs')
      }
    } catch (err) {
      setError('An error occurred while fetching songs')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!songName.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songName: songName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setSongs([data.song, ...songs])
        setSongName('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save song')
      }
    } catch (err) {
      setError('An error occurred while saving the song')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return

    try {
      const response = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSongs(songs.filter((song) => song.id !== id))
      } else {
        setError('Failed to delete song')
      }
    } catch (err) {
      setError('An error occurred while deleting the song')
    }
  }

  if (status === 'loading' || fetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="border border-gray-300 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Favorite Songs</h1>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
          <p className="mb-4">
            Welcome, {session.user?.email || session.user?.name || 'User'}!
          </p>

          <form onSubmit={handleSubmit} className="mb-6">
            {error && (
              <div className="border border-gray-300 px-4 py-3 bg-gray-50 mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Enter song name..."
                className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="border border-gray-300 px-6 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        <div className="border border-gray-300 p-6">
          <h2 className="text-xl font-bold mb-4">Saved Songs</h2>
          {songs.length === 0 ? (
            <p className="text-center py-8 text-gray-600">
              No favorite songs
            </p>
          ) : (
            <ul className="space-y-3">
              {songs.map((song) => (
                <li
                  key={song.id}
                  className="flex justify-between items-center p-4 border border-gray-300 hover:bg-gray-50"
                >
                  <span>{song.songName}</span>
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
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FavoriteSong {
  id: string
  songName: string
  createdAt: string
}

const SONG_LIST = [
  'Tere Bin',
  'Aadat',
  'Dil Diyan Gallan',
  'Jeena Jeena',
  'Tum Hi Ho',
  'Afreen Afreen',
  'Sayonee',
  'Dil Dil Pakistan',
  'Aankhon Mein Teri',
  'Tera Hone Laga Hoon',
  'Channa Mereya',
  'Tere Sang Yaara',
  'Kun Faya Kun',
  'Tum Mile',
  'Pehli Nazar Mein',
  'Woh Lamhe',
  'Kuch Kuch Hota Hai',
  'Tere Bina',
  'Chal Dil Merey',
  'Dil Kya Kare',
]

export default function SongsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([])
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchFavoriteSongs()
    }
  }, [status, router])

  const fetchFavoriteSongs = async () => {
    try {
      setFetching(true)
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavoriteSongs(data.songs)
      } else {
        setError('Failed to fetch favorite songs')
      }
    } catch (err) {
      setError('An error occurred while fetching favorite songs')
    } finally {
      setFetching(false)
    }
  }

  const isFavorite = (songName: string): boolean => {
    return favoriteSongs.some(
      (song) => song.songName.toLowerCase() === songName.toLowerCase()
    )
  }

  const getFavoriteId = (songName: string): string | null => {
    const favorite = favoriteSongs.find(
      (song) => song.songName.toLowerCase() === songName.toLowerCase()
    )
    return favorite?.id || null
  }

  const handleAddToFavorites = async (songName: string) => {
    if (isFavorite(songName)) return

    setLoading({ ...loading, [songName]: true })
    setError('')

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songName }),
      })

      if (response.ok) {
        const data = await response.json()
        setFavoriteSongs([data.song, ...favoriteSongs])
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to add song to favorites')
      }
    } catch (err) {
      setError('An error occurred while adding the song')
    } finally {
      setLoading({ ...loading, [songName]: false })
    }
  }

  const handleRemoveFromFavorites = async (songName: string) => {
    const favoriteId = getFavoriteId(songName)
    if (!favoriteId) return

    if (!confirm('Are you sure you want to remove this song from favorites?')) return

    setLoading({ ...loading, [songName]: true })
    setError('')

    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavoriteSongs(favoriteSongs.filter((song) => song.id !== favoriteId))
      } else {
        setError('Failed to remove song from favorites')
      }
    } catch (err) {
      setError('An error occurred while removing the song')
    } finally {
      setLoading({ ...loading, [songName]: false })
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
      <div className="max-w-4xl mx-auto">
        <div className="border border-gray-300 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Songs List</h1>
            <div className="flex gap-2">
              <Link
                href="/favorites"
                className="border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                My Favorites
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="mb-4">
            Welcome, {session.user?.email || session.user?.name || 'User'}!
          </p>
          <p className="text-gray-600 mb-4">
            Browse through the songs below and add your favorites. You can also remove songs from your favorites list.
          </p>
        </div>

        {error && (
          <div className="border border-gray-300 px-4 py-3 bg-gray-50 mb-6">
            {error}
          </div>
        )}

        <div className="border border-gray-300 p-6">
          <h2 className="text-xl font-bold mb-4">Available Songs</h2>
          {SONG_LIST.length === 0 ? (
            <p className="text-center py-8 text-gray-600">No songs available</p>
          ) : (
            <ul className="space-y-3">
              {SONG_LIST.map((song) => {
                const isFav = isFavorite(song)
                const isLoading = loading[song] || false

                return (
                  <li
                    key={song}
                    className="flex justify-between items-center p-4 border border-gray-300 hover:bg-gray-50"
                  >
                    <span className="flex-1">{song}</span>
                    {isFav ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                          ✓ In Favorites
                        </span>
                        <button
                          onClick={() => handleRemoveFromFavorites(song)}
                          disabled={isLoading}
                          className="border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToFavorites(song)}
                        disabled={isLoading}
                        className="border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Adding...' : 'Add to Favorites'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}


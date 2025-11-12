import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/favorites')
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Song Favorites App</h1>
        <p className="text-center mb-8 text-gray-600">
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full border border-gray-300 py-3 px-4 text-center hover:bg-gray-50"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block w-full border border-gray-300 py-3 px-4 text-center hover:bg-gray-50"
          >
            Register
          </Link>
          <Link
            href="/api-test"
            className="block w-full border border-gray-300 py-3 px-4 text-center hover:bg-gray-50"
          >
            API Testing UI
          </Link>
        </div>
      </div>
    </div>
  )
}


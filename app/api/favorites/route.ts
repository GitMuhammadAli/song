import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// Helper function to get user ID from Bearer token or NextAuth session
async function getUserId(request: Request) {
  // Try Authorization header (for API testing with Bearer token)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '')
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      return decoded.userId
    } catch (e) {
      // Invalid token format, continue to session check
    }
  }

  // Fall back to NextAuth session (for browser)
  const session = await getServerSession(authOptions)
  return session?.user?.id
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favoriteSongs = await prisma.favoriteSong.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ songs: favoriteSongs })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { songName } = await request.json()

    if (!songName || typeof songName !== 'string' || songName.trim() === '') {
      return NextResponse.json(
        { error: 'Song name is required' },
        { status: 400 }
      )
    }

    const favoriteSong = await prisma.favoriteSong.create({
      data: {
        songName: songName.trim(),
        userId,
      },
    })

    return NextResponse.json({ song: favoriteSong }, { status: 201 })
  } catch (error) {
    console.error('Error creating favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


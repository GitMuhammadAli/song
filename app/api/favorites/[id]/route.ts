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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favoriteSong = await prisma.favoriteSong.findUnique({
      where: { id: params.id },
    })

    if (!favoriteSong) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    if (favoriteSong.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.favoriteSong.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Song deleted successfully' })
  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


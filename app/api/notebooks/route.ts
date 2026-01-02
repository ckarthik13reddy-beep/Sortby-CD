import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'templates'
    const search = searchParams.get('search') || ''

    // TODO: Get actual user ID from session
    const userId = "user-1"

    let where: any = { userId }

    // Filter by type
    switch (type) {
      case 'schedule':
        // Get scheduled notebooks
        where.isScheduled = true
        break
      case 'shared':
        // Get notebooks shared with this user
        where.sharedBy = { not: null }
        break
      case 'runs':
        // Get notebook run history
        // This would query a separate NotebookRun table
        return NextResponse.json({ notebooks: [] })
      case 'templates':
      default:
        // Get all user notebooks
        break
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const notebooks = await prisma.notebook.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      notebooks: notebooks.map((notebook) => ({
        id: notebook.id,
        name: notebook.name,
        description: notebook.content ? JSON.parse(notebook.content).description : null,
        sharedBy: notebook.user.name || notebook.user.email,
        updatedAt: formatRelativeTime(notebook.updatedAt),
        createdAt: formatRelativeTime(notebook.createdAt),
        isScheduled: false, // TODO: Add isScheduled field to schema
        userId: notebook.userId,
      })),
    })
  } catch (error) {
    console.error("Error fetching notebooks:", error)
    return NextResponse.json(
      { error: "Failed to fetch notebooks" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, content } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // TODO: Get actual user ID from session
    const userId = "user-1"

    const notebook = await prisma.notebook.create({
      data: {
        name,
        content: JSON.stringify({
          description,
          cells: [],
          metadata: {},
        }),
        userId,
      },
    })

    return NextResponse.json({
      notebook: {
        id: notebook.id,
        name: notebook.name,
        createdAt: formatRelativeTime(notebook.createdAt),
        updatedAt: formatRelativeTime(notebook.updatedAt),
      },
    })
  } catch (error) {
    console.error("Error creating notebook:", error)
    return NextResponse.json(
      { error: "Failed to create notebook" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { notebookIds } = await request.json()

    if (!notebookIds || !Array.isArray(notebookIds)) {
      return NextResponse.json(
        { error: "Invalid notebook IDs" },
        { status: 400 }
      )
    }

    await prisma.notebook.deleteMany({
      where: {
        id: {
          in: notebookIds,
        },
      },
    })

    return NextResponse.json({
      success: true,
      deleted: notebookIds.length,
    })
  } catch (error) {
    console.error("Error deleting notebooks:", error)
    return NextResponse.json(
      { error: "Failed to delete notebooks" },
      { status: 500 }
    )
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

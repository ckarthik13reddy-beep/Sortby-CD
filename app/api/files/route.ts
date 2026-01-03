import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual user ID from session
    const userId = "user-1"

    const files = await prisma.file.findMany({
      where: {
        userId,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    })

    return NextResponse.json({
      files: files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: file.uploadedAt.toISOString(),
        path: file.path,
      })),
    })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileIds } = await request.json()

    if (!fileIds || !Array.isArray(fileIds)) {
      return NextResponse.json(
        { error: "Invalid file IDs" },
        { status: 400 }
      )
    }

    // Delete files from database
    await prisma.file.deleteMany({
      where: {
        id: {
          in: fileIds,
        },
      },
    })

    // TODO: Also delete physical files from filesystem
    // This would require reading the file paths and using fs.unlink

    return NextResponse.json({
      success: true,
      deleted: fileIds.length,
    })
  } catch (error) {
    console.error("Error deleting files:", error)
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 }
    )
  }
}

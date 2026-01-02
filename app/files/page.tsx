"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { FileUpload } from "@/components/files/file-upload"
import { FileList } from "@/components/files/file-list"
import { BulkActionsToolbar } from "@/components/files/bulk-actions-toolbar"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  path: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files")
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedFiles(checked ? files.map((f) => f.id) : [])
  }

  const handleUploadComplete = () => {
    setShowUpload(false)
    fetchFiles()
  }

  const handleDownload = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    // Open file in new tab for download
    window.open(file.path, "_blank")
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: [fileId] }),
      })

      if (response.ok) {
        fetchFiles()
        setSelectedFiles((prev) => prev.filter((id) => id !== fileId))
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const handleBulkExport = () => {
    selectedFiles.forEach((fileId) => {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        window.open(file.path, "_blank")
      }
    })
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) return

    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: selectedFiles }),
      })

      if (response.ok) {
        fetchFiles()
        setSelectedFiles([])
      }
    } catch (error) {
      console.error("Error deleting files:", error)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        <div className="border-b px-6 py-4 bg-white dark:bg-gray-800 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Files</h1>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4 mr-2" />
            {showUpload ? "Hide Upload" : "Upload Files"}
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {showUpload && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
              <h2 className="text-lg font-semibold mb-4">Your Files</h2>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
                </div>
              ) : (
                <FileList
                  files={files}
                  selectedFiles={selectedFiles}
                  onSelectFile={handleSelectFile}
                  onSelectAll={handleSelectAll}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onRefresh={fetchFiles}
                />
              )}
            </div>
          </div>
        </div>

        <BulkActionsToolbar
          selectedCount={selectedFiles.length}
          onExport={handleBulkExport}
          onDelete={handleBulkDelete}
        />
      </div>
    </AppLayout>
  )
}

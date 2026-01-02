"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Download, Trash2, MessageSquare, ArrowUpDown, FileIcon } from "lucide-react"
import { useState } from "react"

interface TeamFile {
  id: string
  name: string
  size: string
  uploadDate: string
}

export default function TeamFilesPage({ params }: { params: { teamId: string } }) {
  const [files] = useState<TeamFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [sortField, setSortField] = useState<"uploadDate">("uploadDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file upload logic here
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(files.map((f) => f.id))
    }
  }

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Upload Section */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg py-12 transition-colors duration-150 ${
            isDragging
              ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-900"
              : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
          }`}
        >
          <div className="flex flex-col items-center">
            <FileIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Drag files to upload</p>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Upload to increase file
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="ghost"
            disabled={selectedFiles.length === 0}
            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Download ({selectedFiles.length})
          </Button>
          <Button
            variant="ghost"
            disabled={selectedFiles.length === 0}
            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete ({selectedFiles.length})
          </Button>
          <Button
            variant="ghost"
            disabled={selectedFiles.length === 0}
            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with files ({selectedFiles.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-gray-900 dark:text-white text-lg font-medium mb-2">
              Looks like your team hasn't uploaded any files yet.
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Upload some files to start chatting with them!
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="w-12 py-3 px-4">
                  <Checkbox
                    checked={selectedFiles.length === files.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all files"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Size
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <button
                    onClick={handleSort}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Sort by upload date"
                  >
                    Upload Date
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => handleFileSelect(file.id)}
                      aria-label={`Select ${file.name}`}
                    />
                  </td>
                  <td className="py-3 px-4 text-sm">{file.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{file.size}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{file.uploadDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

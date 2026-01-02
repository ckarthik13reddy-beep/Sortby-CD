"use client"

import { useState, useCallback } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onUploadComplete: () => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(prev => [...prev, ...files])
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }, [])

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)

    for (const file of selectedFiles) {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        }
      } catch (error) {
        console.error("Error uploading file:", error)
      }
    }

    setUploading(false)
    setSelectedFiles([])
    setUploadProgress({})
    onUploadComplete()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">
          Drag and drop files here
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          or
        </p>
        <label htmlFor="file-input">
          <Button type="button" onClick={() => document.getElementById("file-input")?.click()}>
            Browse Files
          </Button>
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
          Supported formats: CSV, XLSX, JSON, PDF, TXT, and more
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {uploadProgress[file.name] && (
                  <div className="mx-4 flex-1 max-w-xs">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  </div>
                )}
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  )
}

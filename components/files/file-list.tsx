"use client"

import { useState } from "react"
import { FileText, Download, Trash2, MoreVertical, File, FileSpreadsheet, FileCode, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  path: string
}

interface FileListProps {
  files: FileItem[]
  selectedFiles: string[]
  onSelectFile: (fileId: string) => void
  onSelectAll: (checked: boolean) => void
  onDownload: (fileId: string) => void
  onDelete: (fileId: string) => void
  onRefresh: () => void
}

export function FileList({
  files,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onDownload,
  onDelete,
}: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  const getFileIcon = (type: string) => {
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv")) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />
    }
    if (type.includes("image")) {
      return <ImageIcon className="h-5 w-5 text-purple-600" />
    }
    if (type.includes("json") || type.includes("code")) {
      return <FileCode className="h-5 w-5 text-blue-600" />
    }
    if (type.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-600" />
    }
    return <File className="h-5 w-5 text-gray-600" />
  }

  const allSelected = files.length > 0 && selectedFiles.length === files.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedFiles.length > 0 
              ? `${selectedFiles.length} selected` 
              : `All files (${files.length})`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Name</span>
          <span className="text-xs text-gray-600 dark:text-gray-400 w-24 text-right">Size</span>
          <span className="text-xs text-gray-600 dark:text-gray-400 w-32 text-right">Updated</span>
          <div className="w-10" />
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                selectedFiles.includes(file.id)
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => onSelectFile(file.id)}
                />
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {file.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24 text-right">
                  {formatFileSize(file.size)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-32 text-right">
                  {formatDate(file.uploadedAt)}
                </span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDownload(file.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(file.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

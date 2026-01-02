"use client"

import { Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BulkActionsToolbarProps {
  selectedCount: number
  onExport: () => void
  onDelete: () => void
}

export function BulkActionsToolbar({
  selectedCount,
  onExport,
  onDelete,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4 border border-gray-700">
        <span className="font-medium">
          {selectedCount} file{selectedCount > 1 ? "s" : ""} selected
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="text-white hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-400 hover:bg-red-950 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

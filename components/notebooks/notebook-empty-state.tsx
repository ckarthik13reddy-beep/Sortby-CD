"use client"

import { Ban, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotebookEmptyStateProps {
  type: 'templates' | 'schedule' | 'shared' | 'runs'
  onCreateNew: () => void
}

const EMPTY_STATE_CONFIG = {
  templates: {
    icon: Ban,
    primaryText: "Looks like you haven't created any templates yet.",
    secondaryText: "Let's get started by creating a new one.",
    showButton: true,
  },
  schedule: {
    icon: Ban,
    primaryText: "No scheduled notebooks",
    secondaryText: "Schedule notebooks to run automatically at specific times.",
    showButton: false,
  },
  shared: {
    icon: Ban,
    primaryText: "No notebooks shared with you",
    secondaryText: "When team members share notebooks with you, they'll appear here.",
    showButton: false,
  },
  runs: {
    icon: Ban,
    primaryText: "No notebook runs yet",
    secondaryText: "Your notebook execution history will appear here.",
    showButton: false,
  },
}

export function NotebookEmptyState({ type, onCreateNew }: NotebookEmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type]
  const IconComponent = config.icon

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 border">
            <IconComponent className="h-12 w-12 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">
          {config.primaryText}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {config.secondaryText}
        </p>
        {config.showButton && (
          <Button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        )}
      </div>
    </div>
  )
}

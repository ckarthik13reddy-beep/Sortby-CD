"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { NotebookType } from "@/lib/types/notebook"

const TABS = [
  { id: 'templates' as NotebookType, label: 'Notebooks' },
  { id: 'schedule' as NotebookType, label: 'Scheduled' },
  { id: 'shared' as NotebookType, label: 'Shared with me' },
  { id: 'runs' as NotebookType, label: 'History' },
]

interface NotebookTabsProps {
  activeTab: NotebookType
}

export function NotebookTabs({ activeTab }: NotebookTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (tabId: NotebookType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', tabId)
    router.push(`/notebooks?${params.toString()}`)
  }

  return (
    <div className="border-b">
      <nav className="flex gap-8 px-6" aria-label="Tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

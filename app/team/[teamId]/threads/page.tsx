"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useState } from "react"

interface Thread {
  id: string
  owner: string
  lastUpdated: string
}

export default function TeamThreadsPage({ params }: { params: { teamId: string } }) {
  const [threads] = useState<Thread[]>([])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-5"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Unshare Threads
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-md"
          >
            + Create Team Thread
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {threads.length === 0 ? (
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No threads found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Owner
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {threads.map((thread) => (
                <tr key={thread.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="py-3 px-4 text-sm">{thread.owner}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{thread.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

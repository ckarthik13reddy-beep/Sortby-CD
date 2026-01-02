"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Info, Search, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface Notebook {
  id: string
  name: string
  sharedBy: string
  updated: string
  created: string
}

type TabType = "notebooks" | "scheduled" | "shared" | "history"

export default function TeamNotebooksPage({ params }: { params: { teamId: string } }) {
  const [notebooks] = useState<Notebook[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("notebooks")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"updated" | "created">("updated")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const tabs = [
    { id: "notebooks" as TabType, label: "Notebooks" },
    { id: "scheduled" as TabType, label: "Scheduled" },
    { id: "shared" as TabType, label: "Shared with me" },
    { id: "history" as TabType, label: "History" },
  ]

  const handleSort = (field: "updated" | "created") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Run repeatable analysis</span>
            <Info className="h-4 w-4 ml-1" />
          </div>
          <Link
            href="#"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Explore Templates
          </Link>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-md"
          >
            + New
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium relative transition-colors duration-150 ${
                activeTab === tab.id
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 h-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-2">
        {notebooks.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-gray-900 dark:text-white text-lg font-medium mb-2">
              Looks like you haven't created any templates yet.
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Let's get started by creating a new one.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-md"
            >
              + New
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shared by
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <button
                    onClick={() => handleSort("updated")}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Sort by updated date"
                  >
                    Updated
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {notebooks.map((notebook) => (
                <tr key={notebook.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="py-3 px-4 text-sm">{notebook.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{notebook.sharedBy}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{notebook.updated}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{notebook.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

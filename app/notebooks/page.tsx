"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { NotebookTabs } from "@/components/notebooks/notebook-tabs"
import { NotebookTable } from "@/components/notebooks/notebook-table"
import { NotebookEmptyState } from "@/components/notebooks/notebook-empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, HelpCircle, Search } from "lucide-react"
import { Notebook, NotebookType } from "@/lib/types/notebook"

// Mock data
const MOCK_NOTEBOOKS: Notebook[] = [
  {
    id: '1',
    name: 'Sales Analysis Q4 2025',
    description: 'Quarterly sales performance analysis',
    sharedBy: 'John Doe',
    updatedAt: '2 hours ago',
    createdAt: '3 days ago',
    isScheduled: true,
    userId: 'user-1',
  },
  {
    id: '2',
    name: 'Customer Segmentation Report',
    description: 'RFM analysis and customer clustering',
    sharedBy: 'Jane Smith',
    updatedAt: '1 day ago',
    createdAt: '1 week ago',
    userId: 'user-1',
  },
  {
    id: '3',
    name: 'Revenue Forecast Model',
    sharedBy: 'Mike Johnson',
    updatedAt: '3 days ago',
    createdAt: '2 weeks ago',
    isScheduled: true,
    userId: 'user-1',
  },
  {
    id: '4',
    name: 'Churn Prediction Analysis',
    description: 'ML model for customer churn prediction',
    updatedAt: '5 days ago',
    createdAt: '3 weeks ago',
    userId: 'user-1',
  },
]

export default function NotebooksPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const activeTab = (searchParams.get('type') as NotebookType) || 'templates'

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setNotebooks(MOCK_NOTEBOOKS)
      setLoading(false)
    }, 500)
  }, [activeTab])

  const filteredNotebooks = useMemo(() => {
    let filtered = notebooks

    // Filter by tab type
    switch (activeTab) {
      case 'schedule':
        filtered = filtered.filter((n) => n.isScheduled)
        break
      case 'shared':
        filtered = filtered.filter((n) => n.sharedBy)
        break
      case 'runs':
        filtered = []
        break
      case 'templates':
      default:
        break
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (n) =>
          n.name.toLowerCase().includes(query) ||
          n.description?.toLowerCase().includes(query) ||
          n.sharedBy?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [notebooks, activeTab, searchQuery])

  const handleCreateNew = () => {
    router.push('/notebooks/new')
  }

  const handleSchedule = (notebookId: string) => {
    console.log('Schedule notebook:', notebookId)
    // TODO: Implement schedule modal
  }

  const handleRun = (notebookId: string) => {
    console.log('Run notebook:', notebookId)
    // TODO: Implement run notebook
  }

  const handleDelete = async (notebookId: string) => {
    if (!confirm('Are you sure you want to delete this notebook?')) return
    
    setNotebooks((prev) => prev.filter((n) => n.id !== notebookId))
    // TODO: Call API to delete
  }

  const handleDuplicate = (notebookId: string) => {
    const notebook = notebooks.find((n) => n.id === notebookId)
    if (!notebook) return

    const newNotebook: Notebook = {
      ...notebook,
      id: `${Date.now()}`,
      name: `${notebook.name} (Copy)`,
      createdAt: 'Just now',
      updatedAt: 'Just now',
    }

    setNotebooks((prev) => [newNotebook, ...prev])
    // TODO: Call API to duplicate
  }

  const handleEdit = (notebookId: string) => {
    router.push(`/notebooks/${notebookId}`)
  }

  const handleExploreTemplates = () => {
    // TODO: Open templates gallery
    console.log('Explore templates')
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="px-6 py-6 border-b bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold">Team Notebooks</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Run repeatable analysis</p>
                  <button
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                    title="Learn more about notebooks"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleExploreTemplates}
              >
                Explore Templates
              </Button>
              <Button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <NotebookTabs activeTab={activeTab} />

        {/* Search Bar */}
        <div className="px-6 py-4 border-b bg-white dark:bg-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-6 bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-600 dark:text-gray-400">Loading notebooks...</div>
            </div>
          ) : filteredNotebooks.length === 0 ? (
            <NotebookEmptyState type={activeTab} onCreateNew={handleCreateNew} />
          ) : (
            <NotebookTable
              notebooks={filteredNotebooks}
              onSchedule={handleSchedule}
              onRun={handleRun}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}

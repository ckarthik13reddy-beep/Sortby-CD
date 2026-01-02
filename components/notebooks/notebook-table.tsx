"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Calendar, Play, MoreVertical, Trash2, Copy, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Notebook } from "@/lib/types/notebook"

interface NotebookTableProps {
  notebooks: Notebook[]
  onSchedule: (notebookId: string) => void
  onRun: (notebookId: string) => void
  onDelete: (notebookId: string) => void
  onDuplicate: (notebookId: string) => void
  onEdit: (notebookId: string) => void
}

type SortField = 'updatedAt' | 'createdAt' | null
type SortOrder = 'asc' | 'desc'

export function NotebookTable({
  notebooks,
  onSchedule,
  onRun,
  onDelete,
  onDuplicate,
  onEdit,
}: NotebookTableProps) {
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const sortedNotebooks = [...notebooks].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = new Date(a[sortField]).getTime()
    const bValue = new Date(b[sortField]).getTime()
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 inline ml-1" />
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Shared by
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900 dark:hover:text-gray-300"
              onClick={() => handleSort('updatedAt')}
            >
              Updated <SortIcon field="updatedAt" />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900 dark:hover:text-gray-300"
              onClick={() => handleSort('createdAt')}
            >
              Created <SortIcon field="createdAt" />
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sortedNotebooks.map((notebook) => (
            <tr
              key={notebook.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              onMouseEnter={() => setHoveredRow(notebook.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onEdit(notebook.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium">
                      {notebook.name}
                    </div>
                    {notebook.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {notebook.description}
                      </div>
                    )}
                    {notebook.isScheduled && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-blue-400" />
                        <span className="text-xs text-blue-400">Scheduled</span>
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {notebook.sharedBy || '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600 dark:text-gray-300">{notebook.updatedAt}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600 dark:text-gray-300">{notebook.createdAt}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div
                  className="flex items-center justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {hoveredRow === notebook.id && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSchedule(notebook.id)
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRun(notebook.id)
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(notebook.id)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDuplicate(notebook.id)
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onSchedule(notebook.id)
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(notebook.id)
                        }}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

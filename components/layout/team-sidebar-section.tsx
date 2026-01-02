"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, BookOpen, FolderOpen, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface TeamSidebarSectionProps {
  teamId: string
  collapsed?: boolean
}

const teamNavigation = [
  { name: "Chats", href: "/team/:teamId/threads", icon: MessageSquare },
  { name: "Notebooks", href: "/team/:teamId/notebooks", icon: BookOpen },
  { name: "Files", href: "/team/:teamId/files", icon: FolderOpen },
]

export function TeamSidebarSection({ teamId, collapsed = false }: TeamSidebarSectionProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)

  // Load expanded state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("team-sidebar-expanded")
    if (saved !== null) {
      setIsExpanded(saved === "true")
    }
  }, [])

  // Save expanded state to localStorage
  const toggleExpanded = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem("team-sidebar-expanded", String(newState))
  }

  if (collapsed) {
    return null
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      {/* Accordion Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 bg-gray-50 dark:bg-gray-900"
        aria-expanded={isExpanded}
        aria-label="Toggle team workspace navigation"
      >
        <span>new team</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Navigation Items */}
      {isExpanded && (
        <div className="space-y-1 pb-2 bg-gray-50 dark:bg-gray-900">
          {teamNavigation.map((item) => {
            const Icon = item.icon
            const href = item.href.replace(":teamId", teamId)
            const isActive = pathname === href

            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  "flex items-center py-2 text-sm transition-colors duration-150 relative",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                )}
                style={{ paddingLeft: "48px" }}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600 dark:bg-blue-400"
                    aria-hidden="true"
                  />
                )}
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-[14px]">{item.name}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

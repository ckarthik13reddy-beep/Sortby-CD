"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  MessageSquare, 
  BookOpen, 
  FileText, 
  Database, 
  Bot,
  Plus,
  ChevronLeft,
  Settings,
  User,
  LayoutDashboard,
  Moon,
  Sun,
  Search,
  Brain
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useTheme } from "@/lib/theme-provider"
import { TeamSidebarSection } from "./team-sidebar-section"

const navigation = [
  { name: "New Chat", href: "/chat", icon: Plus },
  { name: "Chats", href: "/chat", icon: MessageSquare },
  { name: "Dashboards", href: "/dashboard", icon: LayoutDashboard },
  { name: "Notebooks", href: "/notebooks", icon: BookOpen },
  { name: "Files", href: "/files", icon: FileText },
  { name: "Data Connectors", href: "/connectors", icon: Database },
  { name: "Custom Agents", href: "/agents", icon: Bot },
]

// Mock previous chats data
const MOCK_CHATS = [
  { id: 1, title: "Sales Dashboard Analysis", timestamp: "2h ago" },
  { id: 2, title: "Customer Segmentation", timestamp: "5h ago" },
  { id: 3, title: "Revenue Forecasting Model", timestamp: "1d ago" },
  { id: 4, title: "Product Performance Report", timestamp: "2d ago" },
  { id: 5, title: "Marketing Campaign ROI", timestamp: "3d ago" },
  { id: 6, title: "Supply Chain Optimization", timestamp: "4d ago" },
  { id: 7, title: "Employee Productivity Metrics", timestamp: "5d ago" },
  { id: 8, title: "Financial Statement Review", timestamp: "1w ago" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [showChats, setShowChats] = useState(false)

  // Filter chats based on search query (minimum 3 characters)
  const filteredChats = searchQuery.length >= 3
    ? MOCK_CHATS.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_CHATS.slice(0, 3) // Show only first 3 by default

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-gray-50 dark:bg-gray-900 border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SBy</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              SortBy AI
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  collapsed && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>

              {/* Previous Chats Section - show after "Chats" item */}
              {item.name === "Chats" && !collapsed && (
                <div className="mt-3 ml-2 space-y-2">
                  {/* Search Box */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowChats(true)}
                      onBlur={() => setTimeout(() => setShowChats(false), 200)}
                      className="pl-9 h-9 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* Previous Chats List - Scrollable - Only show when search is focused */}
                  {showChats && (
                    <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                      {filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                          <Link
                            key={chat.id}
                            href={`/chat/${chat.id}`}
                            className="block px-3 py-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                          >
                            <div className="truncate">{chat.title}</div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500">
                          No chats found
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hint text */}
                  {showChats && searchQuery.length > 0 && searchQuery.length < 3 && (
                    <div className="px-3 text-xs text-gray-400 dark:text-gray-500">
                      Type at least 3 characters to search
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Team Workspace Section */}
        <TeamSidebarSection teamId="default" collapsed={collapsed} />
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn(
            "w-full justify-start",
            collapsed && "justify-center px-0"
          )}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          {!collapsed && (
            <span className="ml-3 text-sm">
              {theme === "light" ? "Dark" : "Light"} Mode
            </span>
          )}
        </Button>

        {/* Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center px-0"
              )}
            >
              <User className="h-5 w-5" />
              {!collapsed && <span className="ml-3 text-sm">Account</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/settings/semantic-layer" className="flex items-center cursor-pointer">
                <Brain className="mr-2 h-4 w-4" />
                Semantic Layer
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

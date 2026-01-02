"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Database, Plus, Search, Plug, HardDrive, Cloud, TrendingUp, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ConnectorLogo } from "@/components/connectors/connector-logo"

interface Connector {
  id: string
  name: string
  type: "Database" | "Integration"
  description?: string
  isNew?: boolean
  category: "database" | "storage" | "advertising"
}

const CONNECTORS: Connector[] = [
  {
    id: "postgres",
    name: "Postgres",
    type: "Database",
    category: "database",
  },
  {
    id: "bigquery",
    name: "BigQuery",
    type: "Database",
    category: "database",
  },
  {
    id: "snowflake",
    name: "Snowflake",
    type: "Database",
    category: "database",
  },
  {
    id: "databricks",
    name: "Databricks",
    type: "Database",
    category: "database",
  },
  {
    id: "mcp",
    name: "MCP",
    type: "Integration",
    category: "database",
  },
  {
    id: "mysql",
    name: "MySQL",
    type: "Database",
    category: "database",
  },
  {
    id: "sqlserver",
    name: "SQL Server",
    type: "Database",
    category: "database",
  },
  {
    id: "supabase",
    name: "Supabase",
    type: "Database",
    category: "database",
  },
  {
    id: "vertica",
    name: "Vertica",
    type: "Database",
    category: "database",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    type: "Integration",
    description: "Analyze your Google Drive files and folders",
    category: "storage",
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    type: "Integration",
    description: "Analyze your Personal OneDrive files and folders",
    isNew: true,
    category: "storage",
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    type: "Integration",
    description: "Analyze your SharePoint or OneDrive for Business files",
    isNew: true,
    category: "storage",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    type: "Integration",
    description: "Analyze your data and manage your campaigns in Google Ads",
    isNew: true,
    category: "advertising",
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    type: "Integration",
    description: "Analyze your data and manage your campaigns in Meta Ads",
    isNew: true,
    category: "advertising",
  },
]
export default function ConnectorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredConnectors = CONNECTORS.filter((connector) => {
    const matchesSearch =
      connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connector.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory =
      selectedCategory === "all" || connector.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: "all", label: "All", icon: Plug },
    { id: "database", label: "Databases", icon: Database },
    { id: "storage", label: "Cloud Storage", icon: Cloud },
    { id: "advertising", label: "Advertising", icon: TrendingUp },
  ]

  const handleConnect = (connectorId: string) => {
    console.log("Connect to:", connectorId)
    // TODO: Implement connection flow
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b px-6 py-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Data Connectors</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Connect to databases, cloud storage, and third-party services
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="border-b px-6 py-4 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search connectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Connectors Grid */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            {filteredConnectors.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No connectors found matching your search
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredConnectors.map((connector) => (
                  <Card
                    key={connector.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <ConnectorLogo name={connector.id} className="w-12 h-12" />
                        {connector.isNew && (
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">
                        {connector.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {connector.type === "Database" ? (
                          <Database className="h-3 w-3 text-gray-500" />
                        ) : (
                          <Share2 className="h-3 w-3 text-gray-500" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {connector.type}
                        </span>
                      </div>

                      {connector.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                          {connector.description}
                        </p>
                      )}

                      <Button
                        onClick={() => handleConnect(connector.id)}
                        className="w-full mt-auto group-hover:bg-blue-600 group-hover:text-white transition-colors"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

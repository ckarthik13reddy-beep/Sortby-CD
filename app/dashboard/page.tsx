"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChartComponent } from "@/components/dashboard/chart-component"
import { DashboardChat } from "@/components/dashboard/dashboard-chat"
import { ScheduleDialog } from "@/components/dashboard/schedule-dialog"
import { useDashboardStore, Dashboard, ChartConfig } from "@/lib/stores/dashboard-store"
import {
  Plus,
  Calendar,
  Download,
  Settings,
  Trash2,
  Grid,
  MessageSquare,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function DashboardPage() {
  const {
    dashboards,
    currentDashboard,
    selectedChart,
    setCurrentDashboard,
    setSelectedChart,
    addDashboard,
    updateDashboard,
    deleteDashboard,
    addChartToDashboard,
    updateChartInDashboard,
    removeChartFromDashboard,
  } = useDashboardStore()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showChatPanel, setShowChatPanel] = useState(true)
  const [newDashboardName, setNewDashboardName] = useState("")
  const [newDashboardDescription, setNewDashboardDescription] = useState("")

  useEffect(() => {
    // Load sample dashboard for demo
    if (dashboards.length === 0) {
      const sampleDashboard: Dashboard = {
        id: "1",
        name: "Sample Dashboard",
        description: "Demo dashboard with sample charts",
        charts: [
          {
            id: "1",
            type: "bar",
            title: "Sales by Region",
            data: [
              { name: "North", value: 4000 },
              { name: "South", value: 3000 },
              { name: "East", value: 2000 },
              { name: "West", value: 2780 },
            ],
            xKey: "name",
            yKey: "value",
            position: { x: 0, y: 0, w: 6, h: 4 },
          },
          {
            id: "2",
            type: "line",
            title: "Monthly Revenue",
            data: [
              { name: "Jan", value: 4000 },
              { name: "Feb", value: 3000 },
              { name: "Mar", value: 5000 },
              { name: "Apr", value: 2780 },
              { name: "May", value: 5890 },
              { name: "Jun", value: 4390 },
            ],
            xKey: "name",
            yKey: "value",
            position: { x: 6, y: 0, w: 6, h: 4 },
          },
          {
            id: "3",
            type: "pie",
            title: "Market Share",
            data: [
              { name: "Product A", value: 400 },
              { name: "Product B", value: 300 },
              { name: "Product C", value: 300 },
              { name: "Product D", value: 200 },
            ],
            xKey: "name",
            yKey: "value",
            position: { x: 0, y: 4, w: 6, h: 4 },
          },
        ],
        isScheduled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addDashboard(sampleDashboard)
      setCurrentDashboard(sampleDashboard)
    }
  }, [])

  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) return

    const newDashboard: Dashboard = {
      id: Date.now().toString(),
      name: newDashboardName,
      description: newDashboardDescription,
      charts: [],
      isScheduled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addDashboard(newDashboard)
    setCurrentDashboard(newDashboard)
    setNewDashboardName("")
    setNewDashboardDescription("")
    setShowCreateDialog(false)
  }

  const handleSchedule = (config: any) => {
    if (!currentDashboard) return
    updateDashboard(currentDashboard.id, {
      isScheduled: true,
      scheduleConfig: config,
    })
  }

  const handleChartUpdate = (chartId: string, updates: Partial<ChartConfig>) => {
    if (!currentDashboard) return
    updateChartInDashboard(currentDashboard.id, chartId, updates)
  }

  const handleAddChart = (chart: ChartConfig) => {
    if (!currentDashboard) return
    const newChart = {
      ...chart,
      id: Date.now().toString(),
      position: { x: 0, y: 0, w: 6, h: 4 },
    }
    addChartToDashboard(currentDashboard.id, newChart)
  }

  const handleDeleteChart = (chartId: string) => {
    if (!currentDashboard) return
    removeChartFromDashboard(currentDashboard.id, chartId)
    if (selectedChart?.id === chartId) {
      setSelectedChart(null)
    }
  }

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Main Dashboard Area */}
        <div className={`flex-1 flex flex-col ${showChatPanel ? "w-2/3" : "w-full"}`}>
          {/* Header */}
          <div className="border-b px-6 py-4 bg-white dark:bg-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                className="text-xl font-semibold bg-transparent border-none focus:outline-none cursor-pointer"
                value={currentDashboard?.id || ""}
                onChange={(e) => {
                  const dashboard = dashboards.find((d) => d.id === e.target.value)
                  setCurrentDashboard(dashboard || null)
                }}
              >
                {dashboards.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {currentDashboard?.isScheduled && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Scheduled
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChatPanel(!showChatPanel)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showChatPanel ? "Hide" : "Show"} Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduleDialog(true)}
                disabled={!currentDashboard}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!currentDashboard}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
            {!currentDashboard ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Grid className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Dashboard Selected</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first dashboard to get started
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dashboard
                  </Button>
                </div>
              </div>
            ) : currentDashboard.charts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Grid className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Charts Yet</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Use the chat assistant to create your first chart
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentDashboard.charts.map((chart) => (
                  <ChartComponent
                    key={chart.id}
                    chart={chart}
                    onSelect={() => setSelectedChart(chart)}
                    onEdit={() => setSelectedChart(chart)}
                    onDelete={() => handleDeleteChart(chart.id)}
                    onMaximize={() => {
                      setSelectedChart(chart)
                      // TODO: Implement maximize view
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChatPanel && (
          <div className="w-1/3 min-w-[400px]">
            <DashboardChat
              selectedChart={selectedChart}
              onChartUpdate={handleChartUpdate}
              onAddChart={handleAddChart}
            />
          </div>
        )}
      </div>

      {/* Create Dashboard Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dashboard Name</Label>
              <Input
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                placeholder="e.g., Sales Overview"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={newDashboardDescription}
                onChange={(e) => setNewDashboardDescription(e.target.value)}
                placeholder="Describe what this dashboard will show..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDashboard}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSave={handleSchedule}
        initialConfig={currentDashboard?.scheduleConfig}
      />
    </AppLayout>
  )
}

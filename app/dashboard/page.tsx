"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getDashboards, createDashboard, deleteDashboard } from "@/lib/backend/api";
import type { Dashboard } from "@/lib/backend/api";
import {
  Plus,
  Calendar,
  Download,
  Settings,
  Trash2,
  Grid,
  MessageSquare,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState("");
  const [newDashboardDescription, setNewDashboardDescription] = useState("");

  const loadDashboards = useCallback(async () => {
    if (!session?.idToken) return;

    setIsLoading(true);
    try {
      const accessToken = session?.idToken;
      const data = await getDashboards(accessToken);
      console.log('Dashboards loaded:', data);
      setDashboards(data);
    } catch (error) {
      console.error("Error loading dashboards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.idToken]);

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  const handleCreateDashboard = async () => {
    if (!newDashboardName.trim()) return;
    
    setIsLoading(true);
    try {
      const accessToken = session?.idToken;
      await createDashboard({
        name: newDashboardName,
        description: newDashboardDescription
      }, accessToken);

      await loadDashboards();
      setNewDashboardName("");
      setNewDashboardDescription("");
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating dashboard:", error);
      alert(error instanceof Error ? error.message : "Failed to create dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (!confirm("Are you sure you want to delete this dashboard?")) return;
    
    setIsLoading(true);
    try {
      const accessToken = session?.idToken;
      await deleteDashboard(dashboardId, accessToken);
      setDashboards(dashboards.filter((d) => d.id !== dashboardId));
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      alert(error instanceof Error ? error.message : "Failed to delete dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDashboard = (dashboard: Dashboard) => {
    router.push(`/dashboard/${dashboard.id}`);
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const getDashboardName = (dashboard: Dashboard) => {
    return dashboard.dashboard_name || dashboard.name || 'Untitled Dashboard';
  };

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="border-b bg-white dark:bg-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboards</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create and manage your data visualizations
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && dashboards.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : dashboards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <LayoutDashboard className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No dashboards yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                Create your first dashboard to start visualizing your data with AI-powered insights
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Dashboard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <Card
                  key={dashboard.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer group bg-white dark:bg-gray-900"
                  onClick={() => handleViewDashboard(dashboard)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Grid className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                          {getDashboardName(dashboard)}
                        </h3>
                        {dashboard.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {dashboard.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <MessageSquare className="h-3 w-3" />
                      <span>0 charts</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDashboard(dashboard.id!);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Dashboard Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input
                id="name"
                placeholder="e.g., Sales Dashboard"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateDashboard();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What insights will this dashboard show?"
                value={newDashboardDescription}
                onChange={(e) => setNewDashboardDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateDashboard}
              disabled={!newDashboardName.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dashboard
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

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

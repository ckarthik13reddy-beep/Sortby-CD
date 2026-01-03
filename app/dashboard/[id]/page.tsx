"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getDashboard,
  getDashboardViews,
  addDashboardView,
  updateDashboardView,
  deleteDashboardView,
  type Dashboard,
  type DashboardView,
} from "@/lib/backend/api";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  MessageSquare,
  Loader2,
  GripVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DashboardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dashboardId = params.id as string;

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [views, setViews] = useState<DashboardView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [draggedChart, setDraggedChart] = useState<DashboardView | null>(null);
  const [chatMessage, setChatMessage] = useState("");

  // Load dashboard and views
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const accessToken = "test-token";
      const [dashboardData, viewsData] = await Promise.all([
        getDashboard(dashboardId, accessToken),
        getDashboardViews(dashboardId, accessToken),
      ]);
      setDashboard(dashboardData);
      setViews(viewsData.views || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Handle chart drag start
  const handleDragStart = (chart: DashboardView) => {
    setDraggedChart(chart);
  };

  // Handle drop on chat panel
  const handleDropOnChat = () => {
    if (draggedChart) {
      setChatMessage(`Analyze this chart: ${draggedChart.title || "Chart"}`);
      setShowChatPanel(true);
      setDraggedChart(null);
    }
  };

  // Handle chart deletion
  const handleDeleteChart = async (viewId: string) => {
    if (!confirm("Are you sure you want to delete this chart?")) return;

    try {
      const accessToken = "test-token";
      await deleteDashboardView(dashboardId, viewId, accessToken);
      setViews(views.filter((v) => v.view_id !== viewId));
    } catch (error) {
      console.error("Error deleting chart:", error);
      alert("Failed to delete chart");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!dashboard) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Dashboard not found</h2>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboards
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="border-b bg-white dark:bg-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {dashboard.dashboard_name || dashboard.name}
                </h1>
                {dashboard.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dashboard.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowChatPanel(!showChatPanel)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showChatPanel ? "Hide" : "Show"} Chat Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Charts Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {views.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <Plus className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No charts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                  Use the chat assistant to create visualizations for your dashboard
                </p>
                <Button
                  onClick={() => setShowChatPanel(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat Assistant
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {views.map((view) => (
                  <Card
                    key={view.view_id}
                    className="p-6 bg-white dark:bg-gray-900 cursor-move hover:shadow-lg transition-shadow"
                    draggable
                    onDragStart={() => handleDragStart(view)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-lg">
                            {view.title || "Untitled Chart"}
                          </h3>
                          {view.question && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {view.question}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChart(view.view_id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Chart Preview Placeholder */}
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">Chart Preview</p>
                    </div>

                    <div className="mt-4 text-xs text-gray-400">
                      💡 Drag this chart to the chat to ask questions about it
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          {showChatPanel && (
            <div
              className="w-96 border-l bg-white dark:bg-gray-900 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnChat}
            >
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Chat Assistant</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag charts here to analyze them
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {draggedChart && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm">
                      Drop the chart here to start analyzing!
                    </p>
                  </div>
                )}

                {chatMessage && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm">{chatMessage}</p>
                  </div>
                )}

                {!chatMessage && !draggedChart && (
                  <div className="text-center text-gray-400 mt-20">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Drag a chart here to start asking questions</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about your charts..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

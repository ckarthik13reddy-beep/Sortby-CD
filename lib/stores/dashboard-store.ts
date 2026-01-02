import { create } from 'zustand'

export interface ChartConfig {
  id: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  title: string
  data: any[]
  xKey?: string
  yKey?: string
  config?: any
  position: { x: number; y: number; w: number; h: number }
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  charts: ChartConfig[]
  dataConnectorId?: string
  isScheduled: boolean
  scheduleConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
  }
  createdAt: Date
  updatedAt: Date
}

interface DashboardStore {
  dashboards: Dashboard[]
  currentDashboard: Dashboard | null
  selectedChart: ChartConfig | null
  
  setDashboards: (dashboards: Dashboard[]) => void
  addDashboard: (dashboard: Dashboard) => void
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void
  deleteDashboard: (id: string) => void
  setCurrentDashboard: (dashboard: Dashboard | null) => void
  setSelectedChart: (chart: ChartConfig | null) => void
  
  addChartToDashboard: (dashboardId: string, chart: ChartConfig) => void
  updateChartInDashboard: (dashboardId: string, chartId: string, updates: Partial<ChartConfig>) => void
  removeChartFromDashboard: (dashboardId: string, chartId: string) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  dashboards: [],
  currentDashboard: null,
  selectedChart: null,

  setDashboards: (dashboards) => set({ dashboards }),
  
  addDashboard: (dashboard) =>
    set((state) => ({ dashboards: [...state.dashboards, dashboard] })),
  
  updateDashboard: (id, updates) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d
      ),
      currentDashboard:
        state.currentDashboard?.id === id
          ? { ...state.currentDashboard, ...updates, updatedAt: new Date() }
          : state.currentDashboard,
    })),
  
  deleteDashboard: (id) =>
    set((state) => ({
      dashboards: state.dashboards.filter((d) => d.id !== id),
      currentDashboard: state.currentDashboard?.id === id ? null : state.currentDashboard,
    })),
  
  setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),
  
  setSelectedChart: (chart) => set({ selectedChart: chart }),
  
  addChartToDashboard: (dashboardId, chart) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? { ...d, charts: [...d.charts, chart], updatedAt: new Date() }
          : d
      ),
      currentDashboard:
        state.currentDashboard?.id === dashboardId
          ? { ...state.currentDashboard, charts: [...state.currentDashboard.charts, chart], updatedAt: new Date() }
          : state.currentDashboard,
    })),
  
  updateChartInDashboard: (dashboardId, chartId, updates) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? {
              ...d,
              charts: d.charts.map((c) => (c.id === chartId ? { ...c, ...updates } : c)),
              updatedAt: new Date(),
            }
          : d
      ),
      currentDashboard:
        state.currentDashboard?.id === dashboardId
          ? {
              ...state.currentDashboard,
              charts: state.currentDashboard.charts.map((c) =>
                c.id === chartId ? { ...c, ...updates } : c
              ),
              updatedAt: new Date(),
            }
          : state.currentDashboard,
    })),
  
  removeChartFromDashboard: (dashboardId, chartId) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? {
              ...d,
              charts: d.charts.filter((c) => c.id !== chartId),
              updatedAt: new Date(),
            }
          : d
      ),
      currentDashboard:
        state.currentDashboard?.id === dashboardId
          ? {
              ...state.currentDashboard,
              charts: state.currentDashboard.charts.filter((c) => c.id !== chartId),
              updatedAt: new Date(),
            }
          : state.currentDashboard,
    })),
}))

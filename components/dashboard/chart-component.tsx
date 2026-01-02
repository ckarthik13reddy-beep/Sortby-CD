"use client"

import { ChartConfig } from "@/lib/stores/dashboard-store"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical, Maximize2, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChartComponentProps {
  chart: ChartConfig
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onMaximize: () => void
}

const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"]

export function ChartComponent({
  chart,
  onSelect,
  onEdit,
  onDelete,
  onMaximize,
}: ChartComponentProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("chart", JSON.stringify(chart))
    e.dataTransfer.effectAllowed = "copy"
  }

  const renderChart = () => {
    switch (chart.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chart.yKey || "value"} fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={chart.yKey || "value"} stroke={COLORS[0]} />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chart.data}
                dataKey={chart.yKey || "value"}
                nameKey={chart.xKey || "name"}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey={chart.yKey || "value"}
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey || "x"} />
              <YAxis dataKey={chart.yKey || "y"} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter name="Data" data={chart.data} fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        )
      
      default:
        return <div className="flex items-center justify-center h-full">Unknown chart type</div>
    }
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-400"
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {chart.title}
          <span className="text-xs text-gray-400">(Drag to chat)</span>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMaximize(); }}>
              <Maximize2 className="mr-2 h-4 w-4" />
              Maximize
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">{renderChart()}</div>
      </CardContent>
    </Card>
  )
}

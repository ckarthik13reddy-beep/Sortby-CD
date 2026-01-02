"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles } from "lucide-react"
import { ChartConfig } from "@/lib/stores/dashboard-store"

interface DashboardChatProps {
  selectedChart: ChartConfig | null
  onChartUpdate: (chartId: string, updates: Partial<ChartConfig>) => void
  onAddChart: (chart: ChartConfig) => void
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  attachedChart?: ChartConfig
}

export function DashboardChat({
  selectedChart,
  onChartUpdate,
  onAddChart,
}: DashboardChatProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [draggedChart, setDraggedChart] = useState<ChartConfig | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    try {
      const chartData = e.dataTransfer.getData("chart")
      if (chartData) {
        const chart: ChartConfig = JSON.parse(chartData)
        setDraggedChart(chart)
        
        // Automatically ask a question about the dropped chart
        const autoMessage = `I've attached the "${chart.title}" chart. What insights can you provide about this ${chart.type} chart?`
        handleSendWithChart(autoMessage, chart)
      }
    } catch (error) {
      console.error("Error handling dropped chart:", error)
    }
  }

  const handleSendWithChart = async (messageText: string, chart?: ChartConfig) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      attachedChart: chart || draggedChart || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setDraggedChart(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/dashboard/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          selectedChart,
          attachedChart: chart || draggedChart,
          messages,
        }),
      })

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // If the AI generated chart updates or new charts, apply them
      if (data.chartUpdate && selectedChart) {
        onChartUpdate(selectedChart.id, data.chartUpdate)
      }

      if (data.newChart) {
        onAddChart(data.newChart)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    handleSendWithChart(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div 
      className="flex flex-col h-full bg-white dark:bg-gray-800 border-l"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          {selectedChart ? `Edit: ${selectedChart.title}` : "Dashboard Assistant"}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {selectedChart
            ? "Ask me to modify this chart"
            : "Drag & drop charts here or ask me to create/modify charts"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="mb-4 p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="font-semibold mb-2">💡 Drag & Drop Charts Here</p>
              <p className="text-sm">Drop any chart to analyze it with AI</p>
            </div>
            <p className="mb-4">Or try asking:</p>
            <div className="space-y-2 text-sm">
              <p>"Create a bar chart showing sales by region"</p>
              <p>"What trends do you see in this data?"</p>
              <p>"Add a pie chart for market share"</p>
              <p>"Explain the insights from this chart"</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                {msg.attachedChart && (
                  <div className="mb-2 p-2 bg-white/10 rounded border border-white/20">
                    <p className="text-xs font-semibold">📊 {msg.attachedChart.title}</p>
                    <p className="text-xs opacity-75">
                      {msg.attachedChart.type} chart • {msg.attachedChart.data.length} data points
                    </p>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        {draggedChart && (
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              📊 Chart attached: {draggedChart.title}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              draggedChart
                ? "Ask a question about this chart..."
                : "Ask me to create or modify charts, or drag a chart here..."
            }
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

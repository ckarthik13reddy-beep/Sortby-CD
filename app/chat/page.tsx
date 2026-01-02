"use client"

import { useState, useRef, useEffect } from "react"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"
import { AppLayout } from "@/components/layout/app-layout"
import { Sparkles } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachedChart?: any
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [droppedChart, setDroppedChart] = useState<any>(null)
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
        const chart = JSON.parse(chartData)
        setDroppedChart(chart)
      }
    } catch (error) {
      console.error("Error handling dropped chart:", error)
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      attachedChart: droppedChart,
    }

    setMessages((prev) => [...prev, userMessage])
    setDroppedChart(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: content, 
          messages,
          attachedChart: userMessage.attachedChart 
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please make sure your OpenAI API key is configured in the .env.local file.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: number) => {
    console.log(`Feedback for message ${messageId}: ${feedback}`)
    // TODO: Implement feedback storage
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b px-6 py-4 bg-white dark:bg-gray-800">
          <h1 className="text-xl font-semibold">Chat</h1>
          <p className="text-xs text-gray-500 mt-1">Drag charts from Dashboard to analyze them here</p>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                What do you want to analyze today?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mb-8">
                I can help you analyze data, create visualizations, write code, and answer questions about your datasets.
              </p>
              <div className="mb-8 p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-center font-semibold text-blue-700 dark:text-blue-300">
                  💡 Drop charts from Dashboard here to analyze them
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
                {[
                  "Analyze trends in my sales data",
                  "Create a dashboard for customer metrics",
                  "Help me clean this dataset",
                  "Generate a report from my data",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {suggestion}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <div key={message.id}>
                  {message.attachedChart && (
                    <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        📊 Chart: {message.attachedChart.title} ({message.attachedChart.type})
                      </p>
                    </div>
                  )}
                  <ChatMessage
                    message={message}
                    onFeedback={handleFeedback}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-6 bg-white dark:bg-gray-800">
          {droppedChart && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                📊 Chart attached: {droppedChart.title}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {droppedChart.type} chart • {droppedChart.data.length} data points
              </p>
              <button
                onClick={() => setDroppedChart(null)}
                className="text-xs text-blue-600 dark:text-blue-400 underline mt-1"
              >
                Remove
              </button>
            </div>
          )}
          <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

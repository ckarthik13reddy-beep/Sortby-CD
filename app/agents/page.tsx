"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const agentCategories = [
  {
    name: "Marketing",
    agents: ["Customer Segmentation", "Budget Optimizer", "Google Ads Expert", "Campaign Performance"],
  },
  {
    name: "Finance",
    agents: ["Expense Analysis", "Financial Statement", "Cash Flow", "Budget vs Actual"],
  },
  {
    name: "Product",
    agents: ["Engagement", "Retention", "Churn", "Feature Adoption"],
  },
]

export default function AgentsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        <div className="border-b px-6 py-4 bg-white dark:bg-gray-800 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Custom Agents</h1>
          <Button>Create Agent</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {agentCategories.map((category) => (
              <div key={category.name}>
                <h2 className="text-lg font-semibold mb-4">{category.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.agents.map((agent) => (
                    <Card key={agent} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <Bot className="h-8 w-8 text-blue-600 mb-2" />
                        <CardTitle className="text-base">{agent}</CardTitle>
                        <CardDescription className="text-xs">
                          AI agent for {agent.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          Use Agent
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

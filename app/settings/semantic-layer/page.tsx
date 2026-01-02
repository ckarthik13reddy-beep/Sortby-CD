"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { useState } from "react"

interface SemanticRule {
  id: string
  name: string
  description: string
  context: string
  constraints: string
  examples: string
  priority: "high" | "medium" | "low"
  enabled: boolean
}

const MOCK_RULES: SemanticRule[] = [
  {
    id: "1",
    name: "Revenue Recognition Policy",
    description: "Define how revenue should be calculated and reported",
    context: "Our company recognizes revenue only when the service is delivered, not when the contract is signed. Subscription revenue is recognized monthly.",
    constraints: "Never calculate annual revenue by multiplying contract value. Always use actual delivered services. Exclude pending contracts from revenue reports.",
    examples: "Correct: 'Q1 revenue = sum of monthly delivered services'. Incorrect: 'Annual revenue = 12 × January revenue'",
    priority: "high",
    enabled: true,
  },
  {
    id: "2",
    name: "Customer Segmentation Rules",
    description: "How customers should be categorized",
    context: "Enterprise customers have >500 employees and >$1M annual contract. SMB customers are 50-500 employees. Startups are <50 employees.",
    constraints: "Do not classify based on industry alone. Employee count and contract value are mandatory criteria. A large contract from a small company is still a startup account.",
    examples: "A 30-person company with $2M contract is still 'Startup', not 'Enterprise'",
    priority: "high",
    enabled: true,
  },
]

export default function SemanticLayerPage() {
  const [rules, setRules] = useState<SemanticRule[]>(MOCK_RULES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [newRule, setNewRule] = useState<Partial<SemanticRule>>({
    name: "",
    description: "",
    context: "",
    constraints: "",
    examples: "",
    priority: "medium",
    enabled: true,
  })

  const handleAddRule = () => {
    if (!newRule.name || !newRule.context) {
      alert("Please fill in at least the name and context fields")
      return
    }

    const rule: SemanticRule = {
      id: Date.now().toString(),
      name: newRule.name!,
      description: newRule.description || "",
      context: newRule.context!,
      constraints: newRule.constraints || "",
      examples: newRule.examples || "",
      priority: newRule.priority as "high" | "medium" | "low",
      enabled: newRule.enabled!,
    }

    setRules([...rules, rule])
    setNewRule({
      name: "",
      description: "",
      context: "",
      constraints: "",
      examples: "",
      priority: "medium",
      enabled: true,
    })
  }

  const handleDeleteRule = (id: string) => {
    if (confirm("Are you sure you want to delete this semantic rule?")) {
      setRules(rules.filter((r) => r.id !== id))
    }
  }

  const handleToggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
      case "low":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Semantic Layer
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Define organization-specific context and constraints to reduce AI hallucinations and ensure accurate responses
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-md"
          >
            {saving ? (
              <>Saving...</>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
              How Semantic Layer Works
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Semantic rules are automatically injected into AI prompts to provide org-specific context. This helps prevent hallucinations by grounding responses in your business logic, terminology, and constraints. Higher priority rules are given more weight in AI decision-making.
            </p>
          </div>
        </div>
      </div>

      {/* Existing Rules */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Semantic Rules
        </h2>
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card
              key={rule.id}
              className={`p-4 border ${
                rule.enabled
                  ? "border-gray-200 dark:border-gray-800"
                  : "border-gray-200 dark:border-gray-800 opacity-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      {rule.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(
                        rule.priority
                      )}`}
                    >
                      {rule.priority}
                    </span>
                    <label className="flex items-center gap-2 ml-auto">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Enabled
                      </span>
                    </label>
                  </div>
                  
                  {rule.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rule.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Context:
                      </span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{rule.context}</p>
                    </div>

                    {rule.constraints && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Constraints:
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {rule.constraints}
                        </p>
                      </div>
                    )}

                    {rule.examples && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Examples:
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{rule.examples}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add New Rule Form */}
        <Card className="p-6 mt-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Semantic Rule
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Rule Name *
                </Label>
                <Input
                  id="name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Customer Lifetime Value Calculation"
                  className="mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div>
                <Label htmlFor="priority" className="text-gray-700 dark:text-gray-300">
                  Priority Level
                </Label>
                <select
                  id="priority"
                  value={newRule.priority}
                  onChange={(e) =>
                    setNewRule({ ...newRule, priority: e.target.value as any })
                  }
                  className="mt-1 w-full h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Input
                id="description"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                placeholder="Brief description of what this rule defines"
                className="mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
            </div>

            <div>
              <Label htmlFor="context" className="text-gray-700 dark:text-gray-300">
                Business Context *
              </Label>
              <Textarea
                id="context"
                value={newRule.context}
                onChange={(e) => setNewRule({ ...newRule, context: e.target.value })}
                placeholder="Describe your organization's specific definition, policy, or business logic in natural language..."
                rows={3}
                className="mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This provides the AI with your org-specific context and terminology
              </p>
            </div>

            <div>
              <Label htmlFor="constraints" className="text-gray-700 dark:text-gray-300">
                Constraints & Limitations
              </Label>
              <Textarea
                id="constraints"
                value={newRule.constraints}
                onChange={(e) => setNewRule({ ...newRule, constraints: e.target.value })}
                placeholder="What the AI should NOT do, avoid, or exclude when applying this rule..."
                rows={2}
                className="mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Helps prevent hallucinations by explicitly stating boundaries
              </p>
            </div>

            <div>
              <Label htmlFor="examples" className="text-gray-700 dark:text-gray-300">
                Examples (Correct vs Incorrect)
              </Label>
              <Textarea
                id="examples"
                value={newRule.examples}
                onChange={(e) => setNewRule({ ...newRule, examples: e.target.value })}
                placeholder="Show correct and incorrect applications of this rule..."
                rows={2}
                className="mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Examples help the AI understand proper application
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={newRule.enabled}
                onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="enabled" className="text-gray-700 dark:text-gray-300">
                Enable this rule immediately
              </Label>
            </div>

            <Button
              onClick={handleAddRule}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Semantic Rule
            </Button>
          </div>
        </Card>

        {/* Warning Section */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                Best Practices for Semantic Rules
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 mt-2 space-y-1 list-disc list-inside">
                <li>Be specific and unambiguous in your definitions</li>
                <li>Include concrete examples to prevent misinterpretation</li>
                <li>Set high priority for critical business logic that could have financial impact</li>
                <li>Regularly review and update rules as business policies change</li>
                <li>Test rules with sample queries to validate they work as intended</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

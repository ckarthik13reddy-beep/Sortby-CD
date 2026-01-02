import { NextRequest, NextResponse } from "next/server"
import { openai } from "@/lib/ai/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, selectedChart, attachedChart, messages } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key') {
      return NextResponse.json(
        { 
          response: "⚠️ OpenAI API key is not configured. Please add your API key to the .env.local file." 
        },
        { status: 200 }
      )
    }

    // Build context about the chart
    let chartContext = ""
    if (attachedChart) {
      chartContext = `\n\nUser has attached a chart:
- Title: ${attachedChart.title}
- Type: ${attachedChart.type}
- Data points: ${attachedChart.data.length}
- Data sample: ${JSON.stringify(attachedChart.data.slice(0, 3))}

Analyze this chart and provide insights about:
1. Key trends or patterns
2. Notable data points
3. Potential insights
4. Recommendations for improvement`
    } else if (selectedChart) {
      chartContext = `\n\nYou are editing a ${selectedChart.type} chart titled "${selectedChart.title}"`
    }

    // Create system prompt for dashboard operations
    const systemPrompt = `You are a data visualization assistant. You help users create and modify charts in their dashboards.

When a user asks to create a chart, respond with instructions and generate a JSON object for the chart.
When a user asks to modify an existing chart, provide the updates needed.
When a user asks about an attached chart, analyze the data and provide insights.

Chart types available: bar, line, pie, area, scatter

For creating charts, respond in this format:
1. Acknowledge the request
2. Provide a JSON object with this structure:
{
  "action": "create",
  "chart": {
    "type": "bar",
    "title": "Chart Title",
    "data": [{"name": "A", "value": 100}],
    "xKey": "name",
    "yKey": "value"
  }
}

For modifying charts, respond with:
{
  "action": "update",
  "updates": {
    "title": "New Title",
    "type": "line"
  }
}

For analyzing charts, provide detailed insights about:
- Data trends and patterns
- Key findings
- Outliers or anomalies
- Actionable recommendations

Current context:${chartContext}`

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user" as const, content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content || "I couldn't generate a response."

    // Try to parse JSON from response
    const result: any = { response }

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        
        if (parsed.action === "create" && parsed.chart) {
          result.newChart = parsed.chart
        } else if (parsed.action === "update" && parsed.updates) {
          result.chartUpdate = parsed.updates
        }
      }
    } catch (e) {
      // If no valid JSON, just return the text response
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Dashboard chat API error:", error)
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { response: "⚠️ Invalid OpenAI API key. Please check your .env.local file." },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { response: `Error: ${error.message || 'An unexpected error occurred'}` },
      { status: 200 }
    )
  }
}

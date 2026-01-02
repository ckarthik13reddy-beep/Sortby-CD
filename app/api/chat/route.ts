import { NextRequest, NextResponse } from "next/server"
import { openai } from "@/lib/ai/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, messages, attachedChart } = await request.json()

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
          response: "⚠️ OpenAI API key is not configured. Please add your API key to the .env.local file:\n\nOPENAI_API_KEY=sk-your-actual-key\n\nThen restart the development server." 
        },
        { status: 200 }
      )
    }

    // Build context about attached chart
    let chartContext = ""
    if (attachedChart) {
      chartContext = `\n\nThe user has attached a chart for analysis:
- Chart Title: ${attachedChart.title}
- Chart Type: ${attachedChart.type}
- Number of data points: ${attachedChart.data.length}
- Data sample: ${JSON.stringify(attachedChart.data.slice(0, 5), null, 2)}

Please analyze this chart data and provide insights including:
1. Key trends or patterns in the data
2. Notable observations or outliers
3. Statistical insights (if relevant)
4. Actionable recommendations
5. Potential areas for further investigation`
    }

    // Prepare messages for OpenAI
    const chatMessages = [
      {
        role: "system" as const,
        content: `You are DataAI, an expert AI assistant for data analysis. You help users analyze data, create visualizations, write code, and answer questions about their datasets. Be concise, helpful, and provide actionable insights.${chartContext}`
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: "user" as const,
        content: message
      }
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response."

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Chat API error:", error)
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { response: "⚠️ Invalid OpenAI API key. Please check your .env.local file and make sure you've added a valid API key." },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { response: `Error: ${error.message || 'An unexpected error occurred'}` },
      { status: 200 }
    )
  }
}

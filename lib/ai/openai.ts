import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: string = 'gpt-4'
) {
  const response = await openai.chat.completions.create({
    model,
    messages,
    stream: false,
  })

  return response.choices[0]?.message?.content || ''
}

export async function generateStreamingResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: string = 'gpt-4'
) {
  const stream = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
  })

  return stream
}

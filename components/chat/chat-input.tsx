"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

const placeholders = [
  "Analyze the trends in my sales data for Q4...",
  "Create a visualization showing customer demographics...",
  "What are the key insights from this dataset?",
  "Help me write a Python script to clean this data...",
  "Generate a summary report of the financial metrics...",
]

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [placeholder, setPlaceholder] = useState(placeholders[0])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => {
        const currentIndex = placeholders.indexOf(prev)
        return placeholders[(currentIndex + 1) % placeholders.length]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message)
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = "auto"
    target.style.height = target.scrollHeight + "px"
    setMessage(target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-end gap-2 p-4 border rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          rows={1}
        />
        <div className="flex items-center gap-2 pb-2">
          <Button type="button" size="icon" variant="ghost" disabled={disabled}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !message.trim()}
            className="rounded-xl"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-2">
        <Button type="button" variant="ghost" size="sm" className="text-xs">
          <ChevronDown className="h-3 w-3 mr-1" />
          Model: GPT-4
        </Button>
        <Button type="button" variant="ghost" size="sm" className="text-xs">
          Tools
        </Button>
      </div>
    </form>
  )
}

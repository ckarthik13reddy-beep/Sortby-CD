"use client"

import { cn } from "@/lib/utils"
import { User, Bot, ThumbsUp, ThumbsDown, Copy, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
  onFeedback?: (messageId: string, feedback: number) => void
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex gap-4 p-6",
        isUser ? "bg-transparent" : "bg-gray-50 dark:bg-gray-900/50"
      )}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isUser
              ? "bg-blue-600"
              : "bg-gradient-to-r from-purple-600 to-pink-600"
          )}
        >
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="text-gray-900 dark:text-gray-100">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "")
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback?.(message.id, 1)}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback?.(message.id, -1)}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

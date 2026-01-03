"use client";

import { ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { useSession } from "next-auth/react";
import { chatQueryStreamV2, type VannaV2Chunk } from "@/lib/backend/api";

/**
 * Create a ChatModelAdapter with SSE streaming support using Vanna V2 API
 */
const getString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const createVannaChatAdapter = (accessToken?: string): ChatModelAdapter => ({
  async *run(options) {
    const { messages, abortSignal } = options;
    try {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      const question = lastMessage.content
        .filter((part) => part.type === "text")
        .map((part) => {
          if (part.type === "text") {
            return part.text;
          }
          return "";
        })
        .join(" ");

      const textChunks: string[] = [];
      let hasError = false;
      let errorMessage = "";

      // Stream events from the Vanna V2 API
      await chatQueryStreamV2(
        {
          question,
        },
        (chunk: VannaV2Chunk) => {
          // Check for abort
          if (abortSignal?.aborted) {
            throw new Error("Request aborted");
          }

          // Process rich messages
          if (chunk.rich) {
            const { type, data } = chunk.rich;

            switch (type) {
              case "text": {
                // Collect text content (summaries, explanations, etc.)
                const content = getString(data.content);
                const fallbackText = getString(
                  (data as Record<string, unknown>).text,
                );
                if (content) {
                  textChunks.push(content);
                } else if (fallbackText) {
                  textChunks.push(fallbackText);
                }
                break;
              }

              case "chart":
                // Add a placeholder for the chart in the text
                {
                  const chartTitle = getString(
                    (data as Record<string, unknown>).title,
                  );
                  if (chartTitle) {
                    textChunks.push(`\n**Chart:** ${chartTitle}\n\n`);
                  }
                }
                // Note: The actual chart rendering is handled separately by the UI
                break;

              case "error":
                hasError = true;
                errorMessage =
                  getString((data as Record<string, unknown>).error) ||
                  getString((data as Record<string, unknown>).message) ||
                  "An error occurred";
                break;

              case "status_bar_update":
                // Status updates are handled by the UI separately
                break;

              case "task_tracker_update":
                // Task updates are handled by the UI separately
                break;

              case "chat_input_update":
                // Input updates are handled by the UI separately
                break;

              default:
                // Ignore other message types
                break;
            }
          }
        },
        accessToken
      );

      // Check if we got an error
      if (hasError) {
        throw new Error(errorMessage);
      }

      // Yield the complete response with all accumulated text
      yield {
        content: [
          {
            type: "text",
            text: textChunks.join("\n"),
          },
        ],
        status: {
          type: "complete",
          reason: "stop",
        },
      };

    } catch (error) {
      yield {
        content: [
          {
            type: "text",
            text: `**Error:** ${error instanceof Error ? error.message : "An unexpected error occurred"}`,
          },
        ],
        status: {
          type: "incomplete",
          reason: "error",
          error: error instanceof Error ? { message: error.message } : { message: "unknown" },
        },
      };
    }
  },
});

export function ChatRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { data: session } = useSession();

  // Use idToken for backend authentication (contains user identity)
  const accessToken = session?.idToken;

  const runtime = useLocalRuntime(createVannaChatAdapter(accessToken));

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

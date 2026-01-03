"use client";

import { memo } from "react";

/**
 * Simple markdown-like text renderer for chat messages
 * Supports: bold, code blocks, inline code, and basic formatting
 */
export const MarkdownText = memo(({ text }: { text: string }) => {
  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {parts.map((part, index) => {
        // Code block
        if (part.startsWith("```")) {
          const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
          if (match) {
            const [, language, code] = match;
            return (
              <pre key={index} className="bg-muted p-3 rounded-md overflow-x-auto my-2">
                <code className={`language-${language || "text"} text-sm`}>
                  {code.trim()}
                </code>
              </pre>
            );
          }
        }

        // Regular text with inline formatting
        return (
          <div key={index} className="whitespace-pre-wrap">
            {formatInlineText(part)}
          </div>
        );
      })}
    </div>
  );
});

MarkdownText.displayName = "MarkdownText";

/**
 * Format inline text with bold, italic, inline code
 */
function formatInlineText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\n)/g);

  return parts.map((part, index) => {
    // Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    // Inline code
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Newline
    if (part === "\n") {
      return <br key={index} />;
    }

    // Table row
    if (part.trim().startsWith("|") && part.trim().endsWith("|")) {
      return renderTableRow(part, index);
    }

    return part;
  });
}

/**
 * Render a markdown table row
 */
function renderTableRow(row: string, key: number) {
  const cells = row
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

  // Check if it's a separator row
  if (cells.every((cell) => /^-+$/.test(cell))) {
    return null;
  }

  return (
    <div key={key} className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 border-b py-1">
      {cells.map((cell, i) => (
        <div key={i} className="px-2">
          {cell}
        </div>
      ))}
    </div>
  );
}

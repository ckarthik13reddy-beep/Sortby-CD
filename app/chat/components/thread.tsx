"use client";

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import { type FC } from "react";
import {
  ArrowDownIcon,
  CopyIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownText } from "./markdown-text";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-4 py-6">
        <ThreadWelcome />

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />

        <div className="h-8" />
      </ThreadPrimitive.Viewport>

      <div className="border-t bg-background px-4 py-4">
        <ThreadScrollToBottom />
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-24 right-8 rounded-full shadow-md"
      >
        <ArrowDownIcon className="h-4 w-4" />
      </Button>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{process.env.NEXT_PUBLIC_APP_NAME || 'SortBy'}</h1>
          <p className="text-muted-foreground text-lg">
            Ask questions about your chargeback data in natural language
          </p>
        </div>
        <ThreadWelcomeSuggestions />
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadWelcomeSuggestions: FC = () => {
  const suggestions = [
    "What is the total chargeback amount by distributor?",
    "Show me chargeback trends by month",
    "Which products have the highest chargeback amounts?",
    "List top customers by chargeback volume",
  ];

  return (
    <div className="grid gap-2 w-full max-w-2xl">
      {suggestions.map((prompt, index) => (
        <ThreadPrimitive.Suggestion
          key={index}
          className="rounded-lg border bg-card p-4 text-left text-sm hover:bg-accent cursor-pointer transition-colors"
          prompt={prompt}
          method="replace"
          autoSend
        >
          {prompt}
        </ThreadPrimitive.Suggestion>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="relative flex w-full items-end gap-2 rounded-lg border bg-background p-2">
      <ComposerPrimitive.Input
        placeholder="Ask a question about your data..."
        className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground max-h-40"
        rows={1}
      />
      <ComposerPrimitive.Send asChild>
        <Button size="icon" className="h-10 w-10">
          <SendHorizontalIcon className="h-4 w-4" />
        </Button>
      </ComposerPrimitive.Send>
      <ComposerPrimitive.Cancel asChild>
        <Button size="icon" variant="outline" className="h-10 w-10">
          <XIcon className="h-4 w-4" />
        </Button>
      </ComposerPrimitive.Cancel>
    </ComposerPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-end">
      <div className="max-w-[80%] rounded-lg bg-primary px-4 py-3 text-primary-foreground">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-4">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
          S
        </div>
        <div className="flex-1 space-y-2">
          <MessagePrimitive.Content components={{ Text: MarkdownText }} />
          <AssistantActionBar />
          <BranchPicker />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex gap-1"
    >
      <ActionBarPrimitive.Copy asChild>
        <Button variant="ghost" size="sm">
          <CopyIcon className="mr-2 h-3 w-3" />
          Copy
        </Button>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <Button variant="ghost" size="sm">
          <RefreshCwIcon className="mr-2 h-3 w-3" />
          Regenerate
        </Button>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC = () => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className="inline-flex items-center gap-1 text-xs text-muted-foreground"
    >
      <BranchPickerPrimitive.Previous asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          ←
        </Button>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          →
        </Button>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

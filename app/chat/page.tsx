"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { ChatRuntimeProvider } from "./lib/runtime-provider";
import { Thread } from "./components/thread";

export default function ChatPage() {
  return (
    <AppLayout>
      <ChatRuntimeProvider>
        <div className="h-full w-full">
          <Thread />
        </div>
      </ChatRuntimeProvider>
    </AppLayout>
  );
}

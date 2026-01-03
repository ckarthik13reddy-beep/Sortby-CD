"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  Moon,
  Sun,
  Users,
  MessageSquare,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { appConfig } from "@/lib/config";
import { useState, useEffect } from "react";
import { TeamDialog } from "@/components/team-dialog";
import { ScheduledRunsDialog } from "@/components/scheduled-runs-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ChatHistory {
  id: string;
  question: string;
  timestamp: Date;
}

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [scheduledRunsDialogOpen, setScheduledRunsDialogOpen] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(appConfig.getStorageKey("chat_history"));
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed.map((item: { question: string; timestamp: string; id: string }) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
  }, []);

  const handleSignOut = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/login" });
  };

  const filteredChatHistory = chatHistory
    .filter((chat) => chat.question && chat.question.trim() !== "") // Only show chats with questions
    .filter((chat) => chat.question.toLowerCase().includes(searchQuery.toLowerCase()));

  const isActive = (path: string) => pathname === path;

  const handleNewChat = () => {
    // Generate a new chat ID and navigate (don't store in localStorage yet)
    const newChatId = Date.now().toString();
    router.push(`/?chat=${newChatId}`);
  };

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r border-border bg-card flex flex-col relative`}>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`absolute ${sidebarOpen ? 'top-4 right-4' : 'top-4 left-1/2 -translate-x-1/2'} z-50 p-2 rounded-lg bg-muted hover:bg-accent transition-all`}
      >
        {sidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
      </button>

      {/* Logo */}
      {sidebarOpen && (
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight uppercase">{appConfig.name}</h1>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-foreground rounded-full animate-pulse"></span>
            Welcome, {session?.user?.name}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Dashboards */}
        <Button
          variant={isActive("/dashboard") ? "default" : "outline"}
          className={`w-full ${sidebarOpen ? 'justify-start gap-2' : 'justify-center'} transition-all`}
          onClick={() => router.push("/dashboard")}
          title="Dashboards"
        >
          <LayoutDashboard className="h-4 w-4" />
          {sidebarOpen && "DASHBOARDS"}
        </Button>

        {/* New Chat */}
        <Button
          variant={isActive("/") ? "default" : "outline"}
          className={`w-full ${sidebarOpen ? 'justify-start gap-2' : 'justify-center'} transition-all`}
          onClick={handleNewChat}
          title="New Chat"
        >
          <Plus className="h-4 w-4" />
          {sidebarOpen && "NEW CHAT"}
        </Button>

        {/* Chats Accordion */}
        {sidebarOpen ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="chats" className="border-none">
              <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-accent rounded-md">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chats</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                {/* Search Chat */}
                <div className="relative mb-2">
                  <Input
                    placeholder="Search chat..."
                    className="pr-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                {/* Chat History */}
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {filteredChatHistory.length === 0 && chatHistory.length > 0 ? (
                    <p className="text-sm text-muted-foreground px-3 py-2">No chats found</p>
                  ) : filteredChatHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-3 py-2">No chats yet</p>
                  ) : (
                    filteredChatHistory.slice(0, 10).map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => router.push(`/?chat=${chat.id}`)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                      >
                        <div className="truncate">{chat.question}</div>
                      </button>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-center transition-all"
            title="Chats"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 transition-all"
          onClick={() => setScheduledRunsDialogOpen(true)}
        >
          <CalendarClock className="h-4 w-4" />
          {sidebarOpen && "Scheduled Runs"}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 transition-all"
          onClick={() => setTeamDialogOpen(true)}
        >
          <Users className="h-4 w-4" />
          {sidebarOpen && "Team"}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 transition-all"
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-4 w-4" />
          {sidebarOpen && "Settings"}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 transition-all"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {sidebarOpen && (theme === "dark" ? "Light Mode" : "Dark Mode")}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:bg-red-500/10 hover:text-red-400 transition-all"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {sidebarOpen && "Sign Out"}
        </Button>
      </div>

      {/* Team Dialog */}
      <TeamDialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen} />

      {/* Scheduled Runs Dialog */}
      <ScheduledRunsDialog open={scheduledRunsDialogOpen} onOpenChange={setScheduledRunsDialogOpen} />
    </div>
  );
}

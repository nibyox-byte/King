import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListConversations, useListMessages, useSendMessage, getListMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function CustomerMessagesPage() {
  const { user } = useAuth();
  const { data: conversations } = useListConversations();
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const messagesEnd = useRef<HTMLDivElement>(null);

  const convList = Array.isArray(conversations) ? conversations : [];
  const { data: messages } = useListMessages({ conversationId: selectedConv! }, { query: { enabled: !!selectedConv } });
  const sendMessage = useSendMessage();
  const msgList = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgList.length]);

  const handleSend = () => {
    if (!text.trim() || !selectedConv) return;
    sendMessage.mutate({ data: { conversationId: selectedConv!, content: text } }, {
      onSuccess: () => {
        setText("");
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey({ conversationId: selectedConv! }) });
      },
    });
  };

  const demoConvs = [
    { id: 1, otherUser: { name: "Celestine Mukamana", role: "artisan" }, lastMessage: "Thank you for your order! Your basket is ready.", unreadCount: 1, updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: 2, otherUser: { name: "Support Team", role: "staff" }, lastMessage: "Your order has been shipped.", unreadCount: 0, updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  ];
  const displayConvs = convList.length > 0 ? convList : demoConvs;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-hidden flex">
        {/* Conversation list */}
        <div className="w-72 border-r border-border overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h1 className="font-serif text-lg font-bold">Messages</h1>
          </div>
          {displayConvs.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={cn("w-full text-left px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors", selectedConv === conv.id && "bg-primary/5 border-r-2 border-r-primary")}
              data-testid={`button-conversation-${conv.id}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium text-sm">{conv.otherUser?.name}</span>
                {conv.unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs h-5 w-5 p-0 flex items-center justify-center">{conv.unreadCount}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
            </button>
          ))}
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedConv ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  msgList.map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")} data-testid={`message-${msg.id}`}>
                        <div className={cn("max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm", isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm")}>
                          {msg.content}
                          <div className={cn("text-xs mt-1 opacity-60", isMe ? "text-right" : "")}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEnd} />
              </div>
              <div className="border-t border-border p-4 flex gap-3">
                <Input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  data-testid="input-message"
                />
                <Button onClick={handleSend} disabled={sendMessage.isPending || !text.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="button-send-message">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

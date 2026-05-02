import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { X, Send, Bot, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/portfolio";

interface AdvisorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvisorPanel({ isOpen, onClose }: AdvisorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Portfolio Advisor. I can help you analyze your portfolio data, answer questions about fund performance, and provide insights about your investments. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: (message: string) => api.askAdvisor(message, messages.slice(-5)), // Send last 5 messages for context
    onSuccess: (response) => {
      if (response.error) {
        toast({
          title: "Chat error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        }
      ]);
    },
    onError: (error) => {
      toast({
        title: "Chat failed",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    chatMutation.mutate(inputMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div 
      className={cn(
        "advisor-panel w-80 h-full fixed right-0 top-0 z-50 bg-card border-l border-border shadow-lg transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      data-testid="advisor-panel"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Portfolio Advisor</h3>
                <p className="text-xs text-muted-foreground">Ask questions about your portfolio</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              data-testid="button-close-advisor"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4" data-testid="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-3 max-w-xs text-sm",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                )}
                data-testid={`message-${message.role}-${index}`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg p-3 max-w-xs text-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about your portfolio..."
              className="flex-1 text-sm"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button 
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Read-only access • Rate limited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

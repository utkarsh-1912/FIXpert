
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithFixExpert } from '@/ai/flows/chat-with-fix-expert';
import type { ChatMessage } from '@/ai/flows/chat-types';
import { Loader2, Send, BrainCircuit, User, Bot, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { MarkdownContent } from '@/components/markdown-content';


const ModelInfo = ({ modelName, provider, details }: { modelName: string, provider: string, details: string }) => (
    <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
        <p><span className="font-semibold text-foreground">{modelName}</span> by {provider}</p>
        <p className="mt-1">{details}</p>
    </div>
);

const initialMessage: ChatMessage = { role: 'model', content: "Hello! I'm FIXpert's AI assistant. Ask me anything about the FIX protocol." };

export default function ChatPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('fixpert-chat-history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setHistory(parsedHistory);
        }
      }
    } catch (error) {
        console.error("Failed to load chat history from localStorage", error);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('fixpert-chat-history', JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }
  }, [history]);


  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleChat = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newHistory = [...history, userMessage];
    
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithFixExpert(newHistory);
      setHistory([...newHistory, response]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      const errorResponse: ChatMessage = { role: 'model', content: `Sorry, something went wrong: ${errorMessage}` };
      setHistory([...newHistory, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleChat();
    }
  };

  const handleResetChat = () => {
    setHistory([initialMessage]);
  };
  
  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col h-[85vh]">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>AI FIXpert Chat</CardTitle>
                <CardDescription>Your personal assistant for all things related to the FIX protocol.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetChat}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Chat
              </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-6 pr-4">
                    {history.map((msg, index) => (
                        <div key={index} className={cn("flex items-start gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'model' && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-[75%] rounded-xl px-4 py-3 text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <MarkdownContent content={msg.content} />
                            </div>
                             {msg.role === 'user' && user && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>{user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>

                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4">
                             <Avatar className="h-8 w-8 border">
                                <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                            </Avatar>
                            <div className="max-w-[75%] rounded-xl px-4 py-3 text-sm bg-muted flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin"/>
                            </div>
                        </div>
                    )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-6">
            <div className="flex w-full items-start space-x-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a FIX tag, a message type, or a scenario... (Shift + Enter for new line)"
                  disabled={isLoading}
                  rows={1}
                  className="resize-none min-h-[40px] max-h-40 overflow-y-auto transition-height duration-200"
                />
                <Button onClick={handleChat} disabled={isLoading || !input.trim()} className="self-end">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </div>
            </CardFooter>
        </Card>
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <BrainCircuit className="h-6 w-6 text-primary"/>
                    <CardTitle>AI Model Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <ModelInfo 
                        modelName="Gemini 1.5 Flash"
                        provider="Google"
                        details="A powerful, multimodal model suitable for a wide range of tasks. Up to 1M token context window."
                   />
                   <ModelInfo 
                        modelName="Free-Tier Model"
                        provider="Community"
                        details="A capable reasoning model, ideal for general queries. Free tier offers up to 15,000 tokens per month."
                   />
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">Model usage is subject to provider terms and availability.</p>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}

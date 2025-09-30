
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithFixExpert } from '@/ai/flows/chat-with-fix-expert';
import type { ChatMessage } from '@/ai/flows/chat-types';
import { Loader2, Send, BrainCircuit, Bot, RefreshCw, ChevronsUpDown, Trash2, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { MarkdownContent } from '@/components/markdown-content';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const initialMessage: ChatMessage = { role: 'model', content: "Hello! I'm FIXpert's AI assistant. Ask me anything about the FIX protocol." };

type ChatSession = {
  id: string;
  title: string;
  history: ChatMessage[];
};

const MAX_HISTORY_COUNT = 5;

export default function ChatPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeHistory = activeSession?.history ?? [initialMessage];

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('fixpert-chat-sessions');
      const savedActiveId = localStorage.getItem('fixpert-active-session-id');
      
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
          setSessions(parsedSessions);
          if (savedActiveId && parsedSessions.some(s => s.id === savedActiveId)) {
            setActiveSessionId(savedActiveId);
          } else {
            setActiveSessionId(parsedSessions[0].id);
          }
          return;
        }
      }

      // If no saved sessions, start a new one
      const newSessionId = `session-${Date.now()}`;
      setSessions([{ id: newSessionId, title: 'New Chat', history: [initialMessage] }]);
      setActiveSessionId(newSessionId);

    } catch (error) {
        console.error("Failed to load chat history from localStorage", error);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem('fixpert-chat-sessions', JSON.stringify(sessions));
        if (activeSessionId) {
          localStorage.setItem('fixpert-active-session-id', activeSessionId);
        }
      } catch (error) {
          console.error("Failed to save chat history to localStorage", error);
      }
    }
  }, [sessions, activeSessionId]);


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
  }, [activeHistory]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);
  
  const updateSessionHistory = (sessionId: string, newHistory: ChatMessage[]) => {
      setSessions(prev => prev.map(s => s.id === sessionId ? {...s, history: newHistory} : s));
  };
  
  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? {...s, title} : s));
  }

  const handleChat = async () => {
    if (!input.trim() || !activeSessionId) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newHistory = [...activeHistory, userMessage];
    
    updateSessionHistory(activeSessionId, newHistory);

    // If it's the first user message, set the session title
    if (activeHistory.length === 1 && activeHistory[0].role === 'model') {
       const newTitle = input.substring(0, 30) + (input.length > 30 ? '...' : '');
       updateSessionTitle(activeSessionId, newTitle);
    }

    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithFixExpert(newHistory);
      updateSessionHistory(activeSessionId, [...newHistory, response]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      const errorResponse: ChatMessage = { role: 'model', content: `Sorry, something went wrong: ${errorMessage}` };
      updateSessionHistory(activeSessionId, [...newHistory, errorResponse]);
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

  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    let newSessions = [...sessions, { id: newSessionId, title: 'New Chat', history: [initialMessage] }];
    
    // Enforce history limit
    if (newSessions.length > MAX_HISTORY_COUNT) {
        newSessions = newSessions.slice(newSessions.length - MAX_HISTORY_COUNT);
    }
    
    setSessions(newSessions);
    setActiveSessionId(newSessionId);
  };

  const handleDeleteChat = (sessionId: string) => {
    let newSessions = sessions.filter(s => s.id !== sessionId);
    if (newSessions.length === 0) {
      const newSessionId = `session-${Date.now()}`;
      newSessions = [{ id: newSessionId, title: 'New Chat', history: [initialMessage] }];
      setActiveSessionId(newSessionId);
    } else if (activeSessionId === sessionId) {
      setActiveSessionId(newSessions[0].id);
    }
    setSessions(newSessions);
  };
  
  return (
    <div className="flex flex-col gap-6">
        <Card className="flex flex-col h-[calc(100vh-8rem)]">
            <CardHeader className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle>AI FIXpert Chat</CardTitle>
                  <CardDescription>Your personal assistant for all things related to the FIX protocol.</CardDescription>
                </div>
                 <div className="flex gap-2">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ChevronsUpDown className="h-4 w-4 mr-2" />
                          {activeSession?.title ?? 'Select Chat'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Recent Chats</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {sessions.map(session => (
                          <DropdownMenuItem key={session.id} onSelect={() => setActiveSessionId(session.id)} className="flex justify-between items-center">
                           <div className="flex items-center">
                              {activeSessionId === session.id && <Check className="h-4 w-4 mr-2" />}
                              <span className="truncate max-w-40">{session.title}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteChat(session.id);}}>
                              <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={handleNewChat}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        New Chat
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-6 pr-4">
                    {activeHistory.map((msg, index) => (
                        <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'model' && (
                                <Avatar className="h-8 w-8 border p-1 bg-primary text-primary-foreground">
                                    <Bot className="w-full h-full" />
                                </Avatar>
                            )}
                            <div className={cn(
                              "relative max-w-[75%] rounded-lg px-4 py-2 text-sm", 
                              msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-br-none' 
                                : 'bg-muted rounded-bl-none'
                            )}>
                                {msg.role === 'user' && <div className="absolute bottom-0 right-[-8px] w-0 h-0 border-b-[10px] border-b-primary border-l-[10px] border-l-transparent"></div>}
                                {msg.role === 'model' && <div className="absolute bottom-0 left-[-8px] w-0 h-0 border-b-[10px] border-b-muted border-r-[10px] border-r-transparent"></div>}
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
                        <div className="flex items-start gap-3">
                             <Avatar className="h-8 w-8 border p-1 bg-primary text-primary-foreground">
                                <Bot className="w-full h-full" />
                            </Avatar>
                            <div className="max-w-[75%] rounded-lg px-4 py-2 text-sm bg-muted flex items-center rounded-bl-none">
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
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex flex-row items-center gap-4">
                                <BrainCircuit className="h-6 w-6 text-primary"/>
                                <CardTitle>AI Model Details</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <CardContent className="space-y-4">
                               <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                                    <p><span className="font-semibold text-foreground">Gemini 1.5 Flash</span> by Google</p>
                                    <p className="mt-1">A powerful, multimodal model suitable for a wide range of tasks. Up to 1M token context window.</p>
                               </div>
                               <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                                    <p><span className="font-semibold text-foreground">Free-Tier Model</span> by Community</p>
                                    <p className="mt-1">A capable reasoning model, ideal for general queries. Free tier offers up to 15,000 tokens per month.</p>
                               </div>
                            </CardContent>
                             <CardFooter>
                                <p className="text-xs text-muted-foreground">Model usage is subject to provider terms and availability.</p>
                            </CardFooter>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
        </div>
    </div>
  );
}

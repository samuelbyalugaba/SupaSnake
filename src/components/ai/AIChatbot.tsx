"use client";

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, User } from 'lucide-react';
import { askSnakeChatbot } from '@/ai/flows/snake-chatbot-flow';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AIChatbot: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hi! I'm the Supa Snake chatbot. Ask me anything about the game!" }
  ]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      try {
        const result = await askSnakeChatbot({ question: input });
        const aiMessage: Message = { sender: 'ai', text: result.answer };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'AI Error',
          description: 'The chatbot is feeling a bit under the weather. Please try again later.',
        });
        setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't process that. Please try again." }]);
      }
    });
  };

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom of the viewport
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <Card className="w-full bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot className="text-primary"/>
            Supa Snake Chatbot
        </CardTitle>
        <CardDescription>
            Ask me anything about game rules or strategies!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ScrollArea className="h-48 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'ai' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-3 py-2 text-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p>{message.text}</p>
                </div>
                 {message.sender === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><User size={18}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isPending && (
                <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 text-sm bg-muted space-y-2">
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isPending}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            <Send />
          </Button>
        </form>

      </CardContent>
    </Card>
  );
};

export default AIChatbot;

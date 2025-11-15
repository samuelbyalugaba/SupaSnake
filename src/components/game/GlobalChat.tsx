
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Send, MessageSquare } from 'lucide-react';
import type { Message } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const GlobalChat: React.FC = () => {
  const { user } = useUser();
  const db = useFirestore();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messagesRef = useMemoFirebase(() => collection(db, 'messages'), [db]);
  const messagesQuery = useMemoFirebase(() => query(messagesRef, orderBy('timestamp', 'desc'), limit(50)), [messagesRef]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  
  const reversedMessages = useMemo(() => messages ? [...messages].reverse() : [], [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isSending) return;

    setIsSending(true);
    const messageText = input;
    setInput('');

    try {
      await addDoc(messagesRef, {
        text: messageText,
        userId: user.uid,
        username: user.displayName || user.email,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Send Error',
        description: 'Could not send message. Please try again.',
      });
      setInput(messageText); // Restore input on error
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [reversedMessages]);

  if (!user) {
    return null; // Don't render if user is not logged in
  }

  return (
    <Card className="w-full bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="text-primary" />
          Global Chat
        </CardTitle>
        <CardDescription>Chat with other players!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ScrollArea className="h-48 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                </div>
              ))
            ) : reversedMessages && reversedMessages.length > 0 ? (
              reversedMessages.map((message) => (
                <div key={message.id} className="flex flex-col text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold truncate text-primary/80" style={{ maxWidth: '100px' }}>{message.username}</span>
                     <span className="text-xs text-muted-foreground">
                       {message.timestamp?.toDate ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="break-words">{message.text}</p>
                </div>
              ))
            ) : (
                <div className="text-center text-muted-foreground text-sm">
                    No messages yet. Say hello!
                </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            disabled={isSending || isLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isSending || isLoading || !input.trim()}>
            <Send />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GlobalChat;

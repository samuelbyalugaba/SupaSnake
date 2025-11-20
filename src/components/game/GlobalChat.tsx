
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Send, MessageSquare, Users, Mail } from 'lucide-react';
import type { Message } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAchievements } from '@/context/AchievementContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStats } from '@/hooks/use-stats';


type ChatTab = 'global' | 'nest' | 'dms';

const ChatMessages = ({ messages, isLoading }: { messages: Message[] | null, isLoading: boolean }) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            // A slight delay to ensure messages are rendered before scrolling
            setTimeout(() => {
                viewport.scrollTop = viewport.scrollHeight;
            }, 50);
        }
    }, [messages]);

    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      );
    }
    
    if (!messages || messages.length === 0) {
        return (
            <div className="text-center text-muted-foreground text-sm flex items-center justify-center h-full">
                No messages yet. Say hello!
            </div>
        );
    }
    
    // The query is already ordered by timestamp desc, so we reverse it for display
    const orderedMessages = [...messages].reverse();

    return (
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {orderedMessages.map((message) => (
              <div key={message.id} className="flex flex-col text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold truncate text-primary/80" style={{ maxWidth: '100px' }}>{message.username}</span>
                   <span className="text-xs text-muted-foreground flex-shrink-0">
                     {message.timestamp?.toDate ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true }) : ''}
                  </span>
                </div>
                <p className="break-words">{message.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
    );
}

const GlobalChat = ({ defaultTab = 'global' }: { defaultTab?: ChatTab }) => {
  const { user } = useUser();
  const db = useFirestore();
  const { stats } = useStats();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { updateAchievementProgress } = useAchievements();
  const [activeTab, setActiveTab] = useState<ChatTab>(defaultTab);

  const nestId = stats?.nestId;
  
  useEffect(() => {
    // If the default tab is 'nest' but the user isn't in one, switch to global
    if (defaultTab === 'nest' && !nestId) {
        setActiveTab('global');
    } else {
        setActiveTab(defaultTab);
    }
  }, [defaultTab, nestId]);


  // Global Chat refs
  const globalMessagesRef = useMemoFirebase(() => collection(db, 'global-messages'), [db]);
  const globalMessagesQuery = useMemoFirebase(() => query(globalMessagesRef, orderBy('timestamp', 'desc'), limit(50)), [globalMessagesRef]);
  
  // Nest Chat refs
  const nestMessagesRef = useMemoFirebase(() => (nestId ? collection(db, `nests/${nestId}/messages`) : null), [db, nestId]);
  const nestMessagesQuery = useMemoFirebase(() => (nestMessagesRef ? query(nestMessagesRef, orderBy('timestamp', 'desc'), limit(50)) : null), [nestMessagesRef]);

  const { data: globalMessages, isLoading: isGlobalLoading } = useCollection<Message>(activeTab === 'global' ? globalMessagesQuery : null);
  const { data: nestMessages, isLoading: isNestLoading } = useCollection<Message>(activeTab === 'nest' ? nestMessagesQuery : null);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to send messages.' });
        return;
    }
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const messageText = input;
    setInput('');

    let targetRef;
    if (activeTab === 'global') {
        targetRef = globalMessagesRef;
    } else if (activeTab === 'nest' && nestMessagesRef) {
        targetRef = nestMessagesRef;
    }

    if (!targetRef) {
        toast({ variant: 'destructive', title: 'Error', description: 'Invalid chat channel.' });
        setIsSending(false);
        return;
    }

    try {
      await addDoc(targetRef, {
        text: messageText,
        userId: user.uid,
        username: user.displayName || user.email,
        timestamp: serverTimestamp(),
      });

      if (activeTab === 'global') {
          updateAchievementProgress('first-chat', 1);
          updateAchievementProgress('chat-contributor', 1);
      }
      
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

  if (!user) {
    return null; // Don't render if user is not logged in
  }

  const renderContent = () => {
    if (activeTab === 'global') {
        return <ChatMessages messages={globalMessages} isLoading={isGlobalLoading} />;
    }
    if (activeTab === 'nest') {
        return <ChatMessages messages={nestMessages} isLoading={isNestLoading} />;
    }
    if (activeTab === 'dms') {
        return <div className="h-full flex items-center justify-center text-muted-foreground">Private messages coming soon!</div>;
    }
    return null;
  }

  const isSendDisabled = isSending || !input.trim() || (activeTab === 'nest' && !nestId) || activeTab === 'dms';

  return (
    <div className="flex flex-col h-full bg-background/50 p-4 rounded-lg">
        {/* The Tabs component is now external, so we don't need it here. We just render the content based on activeTab */}
        <div className="flex-1 min-h-0">
            {renderContent()}
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTab === 'dms' ? 'DMs are not yet available' : activeTab === 'nest' && !nestId ? 'Join a Nest to chat here' : 'Say something...'}
                disabled={isSending || (activeTab === 'nest' && !nestId) || activeTab === 'dms'}
                autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isSendDisabled}>
                <Send />
            </Button>
        </form>
    </div>
  );
};

export default GlobalChat;


"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, limit, getDocs, Timestamp, writeBatch } from 'firebase/firestore';
import { Send, MessageSquare, Users, Mail, ArrowLeft, Search } from 'lucide-react';
import type { Message, leaguePlayer } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAchievements } from '@/context/AchievementContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStats } from '@/hooks/use-stats';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useNests } from '@/hooks/use-nests';
import Link from 'next/link';


type ChatTab = 'global' | 'nest' | 'dms';

const getDmChannelId = (uid1: string, uid2: string) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

const ChatMessages = ({ messages, isLoading, currentUserId }: { messages: Message[] | null, isLoading: boolean, currentUserId: string | undefined }) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            setTimeout(() => {
                viewport.scrollTop = viewport.scrollHeight;
            }, 50);
        }
    }, [messages]);

    if (isLoading) {
      return <div className="space-y-4 p-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex flex-col gap-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-48" /></div>)}</div>;
    }
    
    if (!messages || messages.length === 0) {
        return <div className="text-center text-muted-foreground text-sm flex items-center justify-center h-full">No messages yet. Say hello!</div>;
    }
    
    const orderedMessages = [...messages].reverse();

    return (
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {orderedMessages.map((message) => (
              <div key={message.id} className={`flex flex-col text-sm ${message.userId === currentUserId ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-baseline gap-2 ${message.userId === currentUserId ? 'flex-row-reverse' : ''}`}>
                  <span className="font-bold truncate text-primary/80" style={{ maxWidth: '100px' }}>{message.username}</span>
                   <span className="text-xs text-muted-foreground flex-shrink-0">
                     {message.timestamp?.toDate ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true }) : ''}
                  </span>
                </div>
                <p className={`p-2 rounded-lg max-w-[80%] break-words ${message.userId === currentUserId ? 'bg-primary/10' : 'bg-muted/50'}`}>{message.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
    );
}

const DMList = ({ onSelectUser, activeDmUser }: { onSelectUser: (user: leaguePlayer) => void; activeDmUser: leaguePlayer | null; }) => {
    const { user } = useUser();
    const db = useFirestore();

    const conversationsQuery = useMemoFirebase(() =>
        user ? query(collection(db, `users/${user.uid}/conversations`), orderBy('lastMessageAt', 'desc')) : null
    , [db, user]);

    const { data: conversationsData, isLoading } = useCollection<any>(conversationsQuery);
    
    const [conversations, setConversations] = useState<leaguePlayer[]>([]);
    
    useEffect(() => {
        if (!conversationsData) return;
    
        const fetchPlayerInfo = async () => {
            if (conversationsData.length === 0) {
                setConversations([]);
                return;
            }
            const userIds = conversationsData.map(c => c.userId);
            const playersRef = collection(db, 'league-players');
            const playersQuery = query(playersRef, where('userId', 'in', userIds));
            const playerSnapshots = await getDocs(playersQuery);
            const playersMap = new Map(playerSnapshots.docs.map(doc => [doc.id, doc.data() as leaguePlayer]));
            
            const fullConversations = conversationsData
                .map(conv => playersMap.get(conv.userId))
                .filter((p): p is leaguePlayer => p !== undefined);

            setConversations(fullConversations);
        };
        fetchPlayerInfo();
    }, [conversationsData, db]);


    if (isLoading) {
        return <div className="space-y-2">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full"/>)}</div>
    }
    
    if (conversations.length === 0) {
        return (
            <div className="text-center p-4 text-muted-foreground text-sm flex flex-col items-center justify-center gap-4 h-full">
                <p>No conversations yet. Find a player and send them a message!</p>
                <Link href="/friends" passHref>
                    <Button variant="outline"><Search className="mr-2"/> Find Players</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            {conversations.map(player => (
                <Button key={player.userId} variant={activeDmUser?.userId === player.userId ? 'secondary' : 'ghost'} className="justify-start gap-2" onClick={() => onSelectUser(player)}>
                    <Avatar className="w-8 h-8"><AvatarFallback>{player.username.charAt(0)}</AvatarFallback></Avatar>
                    <span>{player.username}</span>
                </Button>
            ))}
        </div>
    );
};

const GlobalChat = ({ defaultTab = 'global', defaultDmUser }: { defaultTab?: ChatTab, defaultDmUser?: leaguePlayer }) => {
  const { user } = useUser();
  const db = useFirestore();
  const { stats } = useStats();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { updateAchievementProgress } = useAchievements();
  const [activeTab, setActiveTab] = useState<ChatTab>(defaultTab);
  const [activeDmUser, setActiveDmUser] = useState<leaguePlayer | null>(defaultDmUser || null);

  const nestId = stats?.nestId;
  
  useEffect(() => {
    setActiveTab(defaultTab);
    setActiveDmUser(defaultDmUser || null);
  }, [defaultTab, defaultDmUser]);


  // Refs
  const globalMessagesRef = useMemoFirebase(() => collection(db, 'global-messages'), [db]);
  const globalMessagesQuery = useMemoFirebase(() => query(globalMessagesRef, orderBy('timestamp', 'desc'), limit(50)), [globalMessagesRef]);
  
  const nestMessagesRef = useMemoFirebase(() => (nestId ? collection(db, `nests/${nestId}/messages`) : null), [db, nestId]);
  const nestMessagesQuery = useMemoFirebase(() => (nestMessagesRef ? query(nestMessagesRef, orderBy('timestamp', 'desc'), limit(50)) : null), [nestMessagesRef]);

  const dmChannelId = useMemo(() => activeDmUser && user ? getDmChannelId(user.uid, activeDmUser.userId) : null, [user, activeDmUser]);
  const dmRef = useMemoFirebase(() => dmChannelId ? collection(db, `dms/${dmChannelId}/messages`) : null, [db, dmChannelId]);
  const dmsQuery = useMemoFirebase(() => dmRef ? query(dmRef, orderBy('timestamp', 'desc'), limit(50)) : null, [dmRef]);

  // Data
  const { data: globalMessages, isLoading: isGlobalLoading } = useCollection<Message>(activeTab === 'global' ? globalMessagesQuery : null);
  const { data: nestMessages, isLoading: isNestLoading } = useCollection<Message>(activeTab === 'nest' ? nestMessagesQuery : null);
  const { data: dmMessages, isLoading: isDmLoading } = useCollection<Message>(activeTab === 'dms' && activeDmUser ? dmsQuery : null);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim() || isSending) return;

    setIsSending(true);
    const messageText = input;
    setInput('');
    
    let targetCollection: any;
    let messagePayload: any = { text: messageText, userId: user.uid, username: user.displayName, timestamp: serverTimestamp() };

    const batch = writeBatch(db);

    if (activeTab === 'global') {
        targetCollection = globalMessagesRef;
    } else if (activeTab === 'nest' && nestMessagesRef) {
        targetCollection = nestMessagesRef;
    } else if (activeTab === 'dms' && dmRef && activeDmUser) {
        targetCollection = dmRef;
        const now = serverTimestamp();
        
        // Create conversation pointer for sender
        const senderConvRef = doc(db, `users/${user.uid}/conversations`, activeDmUser.userId);
        batch.set(senderConvRef, {
            userId: activeDmUser.userId,
            username: activeDmUser.username,
            lastMessageAt: now,
        }, { merge: true });

        // Create conversation pointer for receiver
        const receiverConvRef = doc(db, `users/${activeDmUser.userId}/conversations`, user.uid);
        batch.set(receiverConvRef, {
            userId: user.uid,
            username: user.displayName,
            lastMessageAt: now,
        }, { merge: true });

    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Invalid chat channel.' });
        setIsSending(false);
        return;
    }
    
    const messageRef = doc(collection(db, targetCollection.path));
    batch.set(messageRef, messagePayload);

    try {
      await batch.commit();
      if (activeTab === 'global') {
          updateAchievementProgress('first-chat', 1);
          updateAchievementProgress('chat-contributor', 1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ variant: 'destructive', title: 'Send Error', description: 'Could not send message. Please try again.' });
      setInput(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'global') {
        return <ChatMessages messages={globalMessages} isLoading={isGlobalLoading} currentUserId={user?.uid} />;
    }
    if (activeTab === 'nest') {
        return nestId ? <ChatMessages messages={nestMessages} isLoading={isNestLoading} currentUserId={user?.uid} /> : <div className="h-full flex items-center justify-center text-muted-foreground">Join a Nest to use Nest chat.</div>;
    }
    if (activeTab === 'dms') {
        if (!activeDmUser) {
            return <DMList onSelectUser={setActiveDmUser} activeDmUser={activeDmUser}/>;
        }
        return <ChatMessages messages={dmMessages} isLoading={isDmLoading} currentUserId={user?.uid} />;
    }
    return null;
  }

  const isSendDisabled = isSending || !input.trim() || (activeTab === 'nest' && !nestId) || (activeTab === 'dms' && !activeDmUser);

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-background/50 p-4 rounded-lg">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ChatTab); setActiveDmUser(null); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-2">
                <TabsTrigger value="global"><MessageSquare className="w-4 h-4 mr-2"/>Global</TabsTrigger>
                <TabsTrigger value="nest" disabled={!nestId}><Users className="w-4 h-4 mr-2"/>Nest</TabsTrigger>
                <TabsTrigger value="dms"><Mail className="w-4 h-4 mr-2"/>DMs</TabsTrigger>
            </TabsList>
        </Tabs>
        
        {activeTab === 'dms' && activeDmUser && (
            <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="icon" onClick={() => setActiveDmUser(null)}><ArrowLeft/></Button>
                <h3 className="font-semibold">Chat with {activeDmUser.username}</h3>
            </div>
        )}

        <div className="flex-1 min-h-0">
            {renderContent()}
        </div>

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isSendDisabled ? "Select a conversation to start" : "Say something..."}
                disabled={isSendDisabled || isSending}
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

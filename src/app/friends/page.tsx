"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useUser } from '@/firebase';
import type { leaguePlayer, FriendRequest } from '@/lib/types';
import { Loader2, Users, Search, Frown, Check, X, UserPlus, Send, Mail } from 'lucide-react';
import PlayerCard from '@/components/game/PlayerCard';
import { useFriends } from '@/context/FriendsContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const searchFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const SearchPlayers = () => {
    const { user } = useUser();
    const { searchPlayers, searchResults, isSearching, hasSearched } = useFriends();
    
    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: { username: "" },
    });

    const handleSearch = (data: SearchFormValues) => {
        if (!user) return;
        searchPlayers(data.username);
    };

    const filteredResults = searchResults.filter(p => p.userId !== user?.uid);

    return (
        <div className="space-y-6">
            <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Search className="text-primary" />
                        Find Players
                    </CardTitle>
                    <CardDescription>Search for other players to befriend and compete against.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSearch)} className="flex items-start gap-2">
                             <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="Enter a username..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSearching}>
                                {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                                <span className="hidden sm:inline ml-2">Search</span>
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

             <div>
                {isSearching ? (
                    <div className="text-center p-8 flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" /> Searching...
                    </div>
                ) : hasSearched && filteredResults.length === 0 ? (
                    <div className="text-center p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Frown size={48} />
                        <p className="font-semibold">No players found.</p>
                        <p>Try a different username or check for typos.</p>
                    </div>
                ) : filteredResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResults.map(player => (
                           <PlayerCard key={player.userId} player={player} />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    )
}

const FriendRequestList = () => {
    const { friendRequests, acceptFriendRequest, rejectFriendRequest, isResponding } = useFriends();

    if (friendRequests.length === 0) {
        return (
            <div className="text-center p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Mail size={48} />
                <p className="font-semibold">No new friend requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {friendRequests.map(req => (
                <Card key={req.requestingUserId} className="bg-card/50 border-primary/20 flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 border-2 border-primary/50">
                            <AvatarFallback>{req.requestingUsername.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{req.requestingUsername}</p>
                            <p className="text-sm text-muted-foreground">Wants to be your friend.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => acceptFriendRequest(req)} 
                            disabled={isResponding}
                        >
                            <Check className="text-green-500" />
                        </Button>
                         <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => rejectFriendRequest(req.requestingUserId)}
                            disabled={isResponding}
                        >
                            <X className="text-red-500" />
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    )
}

const FriendList = () => {
    const { friends, isFriendsLoading } = useFriends();

    if (isFriendsLoading) {
        return <div className="text-center p-8"><Loader2 className="animate-spin" /></div>
    }

    if (friends.length === 0) {
        return (
             <div className="text-center p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Frown size={48} />
                <p className="font-semibold">Your friend list is empty.</p>
                <p>Go find some players to add!</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {friends.map(friend => (
                <Card key={friend.userId} className="bg-card/50 border-primary/20">
                   <PlayerCard player={friend} />
                </Card>
            ))}
        </div>
    )
}


export default function FriendsPage() {
    const { user } = useUser();
    const { friendRequests } = useFriends();

    if (!user) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Card className="bg-card/50 border-primary/20 text-center p-8">
                    <CardTitle>Login to Add Friends</CardTitle>
                    <CardDescription className="mt-2">You need to be logged in to manage your friends.</CardDescription>
                </Card>
            </div>
        )
    }
    
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <h1 className="text-5xl font-black uppercase tracking-wider text-center" style={{ filter: `drop-shadow(0 0 10px hsl(var(--primary)))` }}>
                Social Hub
            </h1>
            <Tabs defaultValue="search">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="search"><Search className="w-4 h-4 mr-2"/>Find</TabsTrigger>
                    <TabsTrigger value="requests">
                        <UserPlus className="w-4 h-4 mr-2"/>Requests 
                        {friendRequests.length > 0 && <Badge className="ml-2">{friendRequests.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="friends"><Users className="w-4 h-4 mr-2"/>Friends</TabsTrigger>
                </TabsList>
                <TabsContent value="search" className="mt-6">
                    <SearchPlayers />
                </TabsContent>
                <TabsContent value="requests" className="mt-6">
                    <FriendRequestList />
                </TabsContent>
                <TabsContent value="friends" className="mt-6">
                    <FriendList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
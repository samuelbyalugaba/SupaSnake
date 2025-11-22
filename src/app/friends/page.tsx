
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, limit, startAt, endAt, orderBy } from 'firebase/firestore';
import type { leaguePlayer } from '@/lib/types';
import { Loader2, Users, Search, Frown } from 'lucide-react';
import PlayerCard from '@/components/game/PlayerCard';

const searchFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function FriendsPage() {
    const { user } = useUser();
    const db = useFirestore();
    const [searchResults, setSearchResults] = useState<leaguePlayer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: { username: "" },
    });

    const handleSearch = async (data: SearchFormValues) => {
        if (!user) return;
        setIsSearching(true);
        setHasSearched(true);
        
        const playersRef = collection(db, 'league-players');
        const q = query(
            playersRef,
            orderBy('username'),
            startAt(data.username),
            endAt(data.username + '\uf8ff'),
            limit(10)
        );

        try {
            const querySnapshot = await getDocs(q);
            const players = querySnapshot.docs
                .map(doc => doc.data() as leaguePlayer)
                .filter(p => p.userId !== user.uid); // Exclude self from results
            setSearchResults(players);
        } catch (error) {
            console.error("Error searching for players:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };
    
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-3xl">
                        <Users className="text-primary" />
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
                ) : hasSearched && searchResults.length === 0 ? (
                    <div className="text-center p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Frown size={48} />
                        <p className="font-semibold">No players found.</p>
                        <p>Try a different username or check for typos.</p>
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map(player => (
                           <PlayerCard key={player.userId} player={player} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center p-8 text-muted-foreground">
                        <p>Search for players to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

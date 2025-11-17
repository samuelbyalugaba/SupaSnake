
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users } from "lucide-react";
import { useNests } from '@/hooks/use-nests';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';

const NestLeaderboard = () => {
    const { allNests, isLoading } = useNests();

    const rankedNests = useMemo(() => {
        if (!allNests) return [];
        return [...allNests]
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((nest, index) => ({ ...nest, rank: index + 1 }));
    }, [allNests]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        );
    }
    
    if (rankedNests.length === 0) {
      return (
         <div className="text-center p-8">
             <h3 className="text-lg font-semibold">No Nests Founded Yet</h3>
             <p className="text-sm text-muted-foreground mt-2">
                Be the first to create a Nest and claim the top spot!
             </p>
          </div>
      )
    }

    return (
        <Card className="bg-transparent border-0 shadow-none">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Rank</TableHead>
                            <TableHead>Nest</TableHead>
                            <TableHead className="hidden md:table-cell">Motto</TableHead>
                            <TableHead className="text-right">Members</TableHead>
                            <TableHead className="text-right">Total Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rankedNests.map(nest => (
                            <TableRow key={nest.id}>
                                <TableCell className="font-bold text-lg">{nest.rank}</TableCell>
                                <TableCell className="font-semibold">{nest.name}</TableCell>
                                <TableCell className="text-muted-foreground italic hidden md:table-cell">"{nest.motto}"</TableCell>
                                <TableCell className="text-right">{nest.memberCount}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{nest.totalScore.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default function LeaderboardsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  if (!user) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="bg-card/50 border-primary/20 text-center p-8">
                <CardTitle>Login to View Leaderboards</CardTitle>
                <CardDescription className="mt-2">You need to be logged in to see the rankings.</CardDescription>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Trophy className="text-primary" />
            Leaderboards
          </CardTitle>
          <CardDescription>See who is the best in the grid.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="nests">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="players">Player Scores</TabsTrigger>
                    <TabsTrigger value="nests">Nests</TabsTrigger>
                </TabsList>
                <TabsContent value="players" className="pt-4">
                     <div className="text-center p-8">
                         <h3 className="text-lg font-semibold">Player Leaderboards Coming Soon!</h3>
                         <p className="text-sm text-muted-foreground mt-2">
                            Individual rankings are on the way. Keep honing your skills!
                         </p>
                    </div>
                </TabsContent>
                <TabsContent value="nests" className="pt-4">
                    <NestLeaderboard />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

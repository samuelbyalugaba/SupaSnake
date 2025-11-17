
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Diamond, Gem, Shield, Star, Swords, Trophy, User as UserIcon, Calendar, Clock, Globe, Users, Award, Eye, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useStats } from '@/hooks/use-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { ALL_COSMETICS } from '@/lib/cosmetics';
import type { Cosmetic } from '@/lib/types';
import { useAchievements } from '@/context/AchievementContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const rankTiers = [
  { name: 'Serpent King', icon: Crown, color: 'text-yellow-400', points: '10000+', minPoints: 10000 },
  { name: 'Master', icon: Swords, color: 'text-red-500', points: '8000+', minPoints: 8000 },
  { name: 'Diamond', icon: Diamond, color: 'text-cyan-400', points: '5000+', minPoints: 5000 },
  { name: 'Platinum', icon: Gem, color: 'text-teal-400', points: '3000+', minPoints: 3000 },
  { name: 'Gold', icon: Trophy, color: 'text-amber-500', points: '1500+', minPoints: 1500 },
  { name: 'Silver', icon: Star, color: 'text-slate-400', points: '500+', minPoints: 500 },
  { name: 'Bronze', icon: Shield, color: 'text-amber-800', points: '0+', minPoints: 0 },
];

// Map notable achievements to badges
const notableBadges = [
  { id: 'hard-god', icon: Skull, color: 'text-red-500', title: 'Hard Mode God' },
  { id: 'completionist', icon: Crown, color: 'text-yellow-400', title: 'Completionist' },
  { id: 'ultra-snake', icon: Gem, color: 'text-purple-400', title: 'Ouroboros' },
  { id: 'marathon-runner', icon: Clock, color: 'text-blue-400', title: 'Marathon Runner' },
  { id: 'score-1000', icon: Award, color: 'text-green-400', title: 'Perfectionist' },
];


const getRankForPoints = (points: number) => {
    return rankTiers.find(tier => points >= tier.minPoints) || rankTiers[rankTiers.length - 1];
}

const YourLeagueProfile = ({ user, stats, isLoading }: { user: any; stats: any; isLoading: boolean }) => {
    const { achievements, isLoading: isAchievementsLoading } = useAchievements();
    
    const earnedBadges = React.useMemo(() => {
        if (isAchievementsLoading || !achievements) return [];
        return notableBadges.filter(badge => 
            achievements.some(ach => ach.id === badge.id && ach.isUnlocked)
        );
    }, [achievements, isAchievementsLoading]);


    if (isLoading) {
        return <Skeleton className="h-96" />
    }
    
    if (!user) {
        return (
             <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                    <CardTitle>Join the League!</CardTitle>
                    <CardDescription>Log in to start competing and climb the ranks.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Link href="/play">
                        <Button className="w-full">Login to Compete</Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    const leaguePoints = stats?.leaguePoints ?? 0;
    const currentRank = getRankForPoints(leaguePoints);
    const nextRankIndex = rankTiers.findIndex(t => t === currentRank) - 1;
    const nextRank = nextRankIndex >= 0 ? rankTiers[nextRankIndex] : null;
    
    const progressPercentage = nextRank ? ((leaguePoints - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100 : 100;
    const pointsToNextRank = nextRank ? nextRank.minPoints - leaguePoints : 0;


    return (
        <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle>Your League Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                 <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarFallback className="text-3xl bg-muted">{user?.displayName?.charAt(0) ?? 'Y'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={cn("text-2xl font-bold", currentRank.color)}>{currentRank.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{leaguePoints.toLocaleString()} League Points</p>
                </div>
              </div>
              {nextRank && (
                <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Promotion Progress</span>
                    <span>{pointsToNextRank.toLocaleString()} LP to {nextRank.name}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 animate-pulse"/>
                </div>
              )}
               <div className="grid grid-cols-2 gap-4 text-center">
                 <div className="bg-muted/30 p-2 rounded-md">
                   <p className="text-xs text-muted-foreground">Season High Score</p>
                   <p className="text-lg font-bold text-primary">{stats?.highScore?.toLocaleString() ?? 0}</p>
                 </div>
                  <div className="bg-muted/30 p-2 rounded-md">
                   <p className="text-xs text-muted-foreground">Games Played</p>
                   <p className="text-lg font-bold text-primary">{stats?.gamesPlayed?.toLocaleString() ?? 0}</p>
                 </div>
               </div>
               <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center mb-2">Badges Earned</p>
                    {isAchievementsLoading ? (
                        <Skeleton className="h-6 w-full" />
                    ) : earnedBadges.length > 0 ? (
                        <TooltipProvider>
                            <div className="flex justify-center gap-3">
                                {earnedBadges.map(({ id, icon: Icon, color, title }) => (
                                    <Tooltip key={id}>
                                        <TooltipTrigger>
                                            <Icon className={cn("w-6 h-6", color)} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    ) : (
                        <p className="text-xs text-center text-muted-foreground">No badges yet. Keep playing!</p>
                    )}
              </div>
              <Link href="/profile">
                <Button variant="outline" className="w-full">View Detailed Stats</Button>
              </Link>
            </CardContent>
          </Card>
    )
}

export default function LeaguesPage() {
  const { user, isUserLoading } = useUser();
  const { stats, isLoading: isStatsLoading } = useStats();
  const isLoading = isUserLoading || isStatsLoading;

  const leaguePoints = stats?.leaguePoints ?? 0;
  const currentRank = getRankForPoints(leaguePoints);
  const nextRankIndex = rankTiers.findIndex(t => t.name === currentRank.name) - 1;
  const nextRank = nextRankIndex >= 0 ? rankTiers[nextRankIndex] : null;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* 1. League Overview / Hero Section */}
      <Card className="bg-card/50 border-primary/20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pan-down -z-10"></div>
        <CardHeader>
          <h1 
            className="text-5xl md:text-6xl font-black uppercase tracking-wider"
            style={{ filter: `drop-shadow(0 0 10px hsl(var(--primary))) drop-shadow(0 0 20px hsl(var(--primary)/0.5))` }}
          >
            Supa Snake League
          </h1>
          <CardDescription className="text-xl text-primary/80">
            Compete. Climb. Dominate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg font-bold">Season 1: Rise of the Serpent</p>
            <p className="text-sm text-muted-foreground">12 days left</p>
          </div>
          <Link href="/play">
            <Button size="lg" className="animate-pulse">Start Competing</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          {/* 2. Your League Profile */}
          <YourLeagueProfile user={user} stats={stats} isLoading={isLoading}/>
          
           {/* 3. Divisions / Ranks */}
          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle>League Divisions</CardTitle>
              <CardDescription>Climb the ladder to Serpent King!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rankTiers.map(({name, icon: Icon, color, points}) => (
                <div key={name} className="flex items-center justify-between p-2 bg-muted/20 rounded-md transition-transform hover:scale-105 group">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-125 group-hover:animate-pulse", color)} style={{filter: `drop-shadow(0 0 5px currentColor)`}} />
                    <span className="font-semibold">{name}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{points} LP</span>
                </div>
              ))}
            </CardContent>
             {nextRank && (
              <CardFooter className="flex-col items-start gap-2 border-t pt-4">
                  <p className="font-bold">Your Next Goal: Reach {nextRank.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <nextRank.icon className={cn("w-5 h-5", nextRank.color)} />
                      <span>Unlock exclusive <span className={cn("font-semibold", nextRank.color)}>{nextRank.name}</span> banner.</span>
                  </div>
              </CardFooter>
             )}
          </Card>
        </div>

        {/* 4. Live Leaderboard */}
        <div className="lg:col-span-2">
            <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                    <CardTitle>Live Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="global">
                        <TabsList className="grid w-full grid-cols-4 mb-4">
                            <TabsTrigger value="global"><Globe className="mr-2"/>Global</TabsTrigger>
                            <TabsTrigger value="country"><Calendar className="mr-2"/>Country</TabsTrigger>
                            <TabsTrigger value="friends"><Users className="mr-2"/>Friends</TabsTrigger>
                            <TabsTrigger value="today"><Clock className="mr-2"/>Today</TabsTrigger>
                        </TabsList>
                        <TabsContent value="global"><p className="text-center p-8 text-muted-foreground">Global leaderboards coming soon!</p></TabsContent>
                         <TabsContent value="country"><p className="text-center p-8 text-muted-foreground">Country leaderboards coming soon!</p></TabsContent>
                        <TabsContent value="friends"><p className="text-center p-8 text-muted-foreground">Connect with friends to see their ranks!</p></TabsContent>
                        <TabsContent value="today"><p className="text-center p-8 text-muted-foreground">Today's top players will be shown here!</p></TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
      </div>

       {/* Placeholder for future sections */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/30 border-dashed">
                <CardHeader><CardTitle>League Challenges</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground text-center p-4">Coming Soon: Complete challenges for bonus League Points!</p></CardContent>
            </Card>
            <Card className="bg-card/30 border-dashed">
                <CardHeader><CardTitle>Season Rewards</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground text-center p-4">Coming Soon: Unlock exclusive rewards as you climb the ranks!</p></CardContent>
            </Card>
       </div>
    </div>
  );
}

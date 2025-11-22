
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Star, Trophy, Sparkles, LogIn, Cloud, BarChart, Gem, User as UserIcon, MessageSquare, Bot, Sigma } from 'lucide-react';
import { useUser } from '@/firebase';
import AuthButton from '@/components/auth/AuthButton';
import GlobalChat from '@/components/game/GlobalChat';
import { useStats } from '@/hooks/use-stats';
import { useAchievements } from '@/context/AchievementContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useCosmetics } from '@/context/CosmeticsContext';
import { ALL_COSMETICS } from '@/lib/cosmetics';
import type { Cosmetic } from '@/lib/types';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const HeroSection = () => (
  <div className="relative text-center py-16 md:py-24 overflow-hidden">
    <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pan-down -z-10"></div>
    <h1 
      className="text-5xl md:text-7xl font-black uppercase tracking-wider"
      style={{ filter: `drop-shadow(0 0 10px hsl(var(--primary))) drop-shadow(0 0 20px hsl(var(--primary)/0.5))` }}
    >
      Supa Snake
    </h1>
    <p className="mt-4 text-lg md:text-xl text-primary/80">A modern take on a classic arcade game.</p>
    <div className="mt-8">
      <Link href="/play" passHref>
        <Button 
          size="lg" 
          className="text-2xl font-bold h-16 px-12 animate-pulse"
          style={{ 
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            boxShadow: '0 0 15px hsl(var(--primary)/0.5), 0 0 30px hsl(var(--primary)/0.3)' 
          }}
        >
          <Gamepad2 className="mr-4 h-8 w-8" />
          Play Now
        </Button>
      </Link>
    </div>
  </div>
);

const SnakePreview = ({ cosmetic, segments = 3 }: { cosmetic: Cosmetic, segments?: number }) => {
    const segmentArr = Array.from({ length: segments });
    const cellSize = 12;
    return (
        <div className="flex p-2 rounded-md bg-black/30">
            {segmentArr.map((_, i) => (
                 <div
                    key={i}
                    style={{
                        width: `${cellSize * 2}px`,
                        height: `${cellSize * 2}px`,
                        borderRadius: '50%',
                        background: i === 0 
                            ? `radial-gradient(circle, ${cosmetic.style.headGradient.from}, ${cosmetic.style.headGradient.to})`
                            : `radial-gradient(circle, ${cosmetic.style.bodyGradient.from}, ${cosmetic.style.bodyGradient.to})`,
                        boxShadow: `0 0 8px ${cosmetic.style.shadow}`,
                        transform: `translateX(-${i * (cellSize / 2)}px)`
                    }}
                 />
            ))}
        </div>
    );
};


const PlayerHub = () => {
    const { user, isUserLoading } = useUser();
    const { stats, isLoading: isStatsLoading } = useStats();
    const { achievements, isLoading: isAchievementsLoading } = useAchievements();
    const { equippedCosmetic, isCosmeticsLoading } = useCosmetics();

    const { unlockedCount, totalCount, progressPercentage } = useMemo(() => {
        const unlocked = achievements.filter(a => a.isUnlocked).length;
        const total = achievements.length;
        const progress = total > 0 ? (unlocked / total) * 100 : 0;
        return { unlockedCount: unlocked, totalCount: total, progressPercentage: progress };
    }, [achievements]);

    const currentCosmetic = useMemo(() => {
        return ALL_COSMETICS.find(c => c.id === equippedCosmetic) || ALL_COSMETICS[0];
    }, [equippedCosmetic]);

    const isLoading = isUserLoading || isStatsLoading || isAchievementsLoading || isCosmeticsLoading;
    
    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }

    if (!user) {
        return <LoggedOutPrompt />;
    }

    return (
        <Card className="w-full bg-card/50 border-primary/20 p-4 space-y-4">
            {/* Player Info */}
            <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarFallback className="text-3xl bg-muted">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon />}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold">{user.displayName}</h2>
                    <p className="text-sm text-muted-foreground">Welcome to the grid!</p>
                </div>
            </div>

            {/* Achievement Progress */}
            <div>
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-semibold">Overall Progress</h3>
                    <span className="text-xs text-primary">{unlockedCount} / {totalCount}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Star className="w-3 h-3" /> High Score</p>
                    <p className="text-2xl font-bold text-primary">{stats?.highScore ?? 0}</p>
                </div>
                 <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Gamepad2 className="w-3 h-3" /> Games</p>
                    <p className="text-2xl font-bold text-primary">{stats?.gamesPlayed ?? 0}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Sigma className="w-3 h-3" /> Total Score</p>
                    <p className="text-2xl font-bold text-primary">{stats?.totalScore ?? 0}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Gem className="w-3 h-3" /> Neon Bits</p>
                    <p className="text-2xl font-bold text-primary">{stats?.neonBits ?? 0}</p>
                </div>
            </div>
            
            {/* Equipped Cosmetic */}
             <Link href="/cosmetics" className="group block">
                <div className="p-3 bg-muted/30 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <div className="flex justify-between items-center">
                        <div>
                             <h3 className="text-sm font-semibold">Equipped Skin</h3>
                             <p className="text-lg font-bold">{currentCosmetic.name}</p>
                        </div>
                        <SnakePreview cosmetic={currentCosmetic} />
                    </div>
                </div>
             </Link>
        </Card>
    );
};


const LoggedOutPrompt = () => (
    <Card className="col-span-full bg-card/30 border border-dashed border-primary/20 p-6 md:p-8 text-center flex flex-col items-center">
        <h2 className="text-2xl font-bold">Join the Grid to Unlock Your Potential!</h2>
        <p className="text-muted-foreground mt-2 mb-6 max-w-2xl">Create a free account to access exclusive features and become part of the Supa Snake community.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 w-full max-w-3xl">
            <div className="flex flex-col items-center gap-2 p-4 bg-muted/20 rounded-lg">
                <Cloud className="w-8 h-8 text-primary/70" />
                <h3 className="font-semibold">Cloud Saves</h3>
                <p className="text-xs text-center text-muted-foreground">Save your high scores and progress automatically.</p>
            </div>
             <div className="flex flex-col items-center gap-2 p-4 bg-muted/20 rounded-lg">
                <BarChart className="w-8 h-8 text-primary/70" />
                <h3 className="font-semibold">Leaderboards</h3>
                <p className="text-xs text-center text-muted-foreground">Compete for the top spot against other players.</p>
            </div>
             <div className="flex flex-col items-center gap-2 p-4 bg-muted/20 rounded-lg">
                <Trophy className="w-8 h-8 text-primary/70" />
                <h3 className="font-semibold">Achievements</h3>
                <p className="text-xs text-center text-muted-foreground">Unlock dozens of challenges and earn rewards.</p>
            </div>
        </div>

        <AuthButton />
    </Card>
);

const ChatToggle = () => (
    <div className="fixed bottom-4 right-4 z-50">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="rounded-full h-12 w-12 p-0 flex items-center justify-center">
                    <MessageSquare />
                    <span className="sr-only">Open Global Chat</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chat</SheetTitle>
                    <SheetDescription className="sr-only">
                        Engage with the community in the global chat.
                    </SheetDescription>
                </SheetHeader>
                <GlobalChat />
            </SheetContent>
        </Sheet>
    </div>
);

const HomePage = () => {
  const { user } = useUser();

  return (
    <main>
      <HeroSection />
      
      <div className="container mx-auto p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
            {user ? <PlayerHub /> : <LoggedOutPrompt />}
        </div>
      </div>

      {user && <ChatToggle />}
    </main>
  );
};

export default HomePage;

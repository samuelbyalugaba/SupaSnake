
"use client";

import { useUser } from "@/firebase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User as UserIcon, Star, Gamepad2, Settings, Gem } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useAchievements } from "@/context/AchievementContext";
import { useMemo } from "react";
import { useStats } from "@/hooks/use-stats";
import { Skeleton } from "@/components/ui/skeleton";
import AchievementCard from "@/components/game/AchievementCard";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { achievements, isLoading: isAchievementsLoading } = useAchievements();
  const { stats, isLoading: isStatsLoading } = useStats();

  // Calculate achievement progress
  const { unlockedCount, totalCount, achievementProgress, recentAchievements } = useMemo(() => {
    const unlocked = achievements.filter(a => a.isUnlocked);
    const total = achievements.length;
    const progress = total > 0 ? (unlocked.length / total) * 100 : 0;
    
    // Sort unlocked achievements by date and get the 3 most recent
    const recent = unlocked
      .filter(a => a.unlockedAt)
      .sort((a, b) => b.unlockedAt!.toMillis() - a.unlockedAt!.toMillis())
      .slice(0, 3);
      
    return { 
      unlockedCount: unlocked.length, 
      totalCount: total, 
      achievementProgress: progress,
      recentAchievements: recent
    };
  }, [achievements]);


  if (isUserLoading) {
    return <div className="container mx-auto p-8 text-center">Loading profile...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-8 text-center">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* User Info Header */}
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <div className="flex flex-wrap items-start sm:items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="text-3xl bg-muted">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl md:text-3xl truncate">{user.displayName || "Anonymous Player"}</CardTitle>
              <CardDescription className="truncate">{user.email}</CardDescription>
            </div>
             <Link href="/settings" passHref className="ml-auto sm:ml-0">
              <Button variant="outline" size="icon">
                <Settings />
                <span className="sr-only">Go to Settings</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Statistics */}
        <Card className="lg:col-span-1 bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle>Game Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Star className="w-8 h-8 text-primary"/>
                <div>
                    <p className="text-muted-foreground">Best Score</p>
                    {isStatsLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold">{stats?.highScore ?? 0}</p>}
                </div>
            </div>
             <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Gamepad2 className="w-8 h-8 text-primary"/>
                <div>
                    <p className="text-muted-foreground">Total Games Played</p>
                    {isStatsLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold">{stats?.gamesPlayed ?? 0}</p>}
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Gem className="w-8 h-8 text-primary"/>
                <div>
                    <p className="text-muted-foreground">Neon Bits</p>
                    {isStatsLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold">{stats?.neonBits ?? 0}</p>}
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="lg:col-span-2 bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              {isAchievementsLoading ? 'Loading...' : `${unlockedCount} of ${totalCount} unlocked`}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Progress value={achievementProgress} className="mb-4 h-2" />
              <div>
                <h4 className="font-semibold mb-3">Recent Unlocks</h4>
                 {isAchievementsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-24"/>
                        <Skeleton className="h-24"/>
                        <Skeleton className="h-24"/>
                    </div>
                ) : recentAchievements.length > 0 ? (
                    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                        {recentAchievements.map(ach => <AchievementCard key={ach.id} achievement={ach}/>)}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">
                        Play some more to unlock your first achievements!
                    </p>
                )}
              </div>
             <Link href="/achievements" passHref>
                <Button variant="outline" className="w-full mt-4">
                    View All Achievements
                </Button>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

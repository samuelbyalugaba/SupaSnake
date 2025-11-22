
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User as UserIcon, Star, Gamepad2, Settings, Gem, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useMemo, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AchievementCard from "@/components/game/AchievementCard";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import type { UserStats, AchievementWithProgress, UserAchievement, leaguePlayer } from "@/lib/types";
import { ALL_ACHIEVEMENTS } from "@/lib/achievements";
import { ALL_COSMETICS } from "@/lib/cosmetics";
import SnakePreview from "@/components/game/SnakePreview";
import { useNests } from "@/hooks/use-nests";
import { NestBanner } from "@/components/game/NestBanner";

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const db = useFirestore();
  const [profileUser, setProfileUser] = useState<leaguePlayer | null>(null);
  const [profileStats, setProfileStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { allNests, isLoading: isNestsLoading } = useNests();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!params.username) return;
      setIsLoading(true);

      try {
        // 1. Find user by username
        const playersRef = collection(db, 'league-players');
        const q = query(playersRef, where('username', '==', params.username), limit(1));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
          throw new Error("User not found");
        }

        const foundUser = userSnapshot.docs[0].data() as leaguePlayer;
        setProfileUser(foundUser);
        const userId = foundUser.userId;

        // 2. Fetch stats
        const statsRef = doc(db, `users/${userId}/stats/summary`);
        const statsSnap = await getDoc(statsRef);
        const statsData = statsSnap.exists() ? statsSnap.data() as UserStats : null;
        setProfileStats(statsData);

      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [params.username, db]);


  const cosmetic = useMemo(() => {
    if (!profileStats) return ALL_COSMETICS[0];
    return ALL_COSMETICS.find(c => c.id === profileStats.equippedCosmetic) || ALL_COSMETICS[0];
  }, [profileStats]);

  const nest = useMemo(() => {
    if (!profileStats?.nestId || isNestsLoading || !allNests) return null;
    return allNests.find(n => n.id === profileStats.nestId);
  }, [profileStats?.nestId, allNests, isNestsLoading]);


  if (isLoading) {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-1 h-80" />
                <Skeleton className="lg:col-span-2 h-80" />
            </div>
        </div>
    )
  }

  if (!profileUser) {
    return <div className="container mx-auto p-8 text-center">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* User Info Header */}
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="text-3xl bg-muted">
                {profileUser.username ? profileUser.username.charAt(0).toUpperCase() : <UserIcon />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl md:text-3xl truncate">{profileUser.username || "Anonymous Player"}</CardTitle>
              <CardDescription>
                <span className="font-bold text-primary">{profileUser.leaguePoints.toLocaleString()}</span> League Points
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            {/* Game Statistics */}
            <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                    <CardTitle>Game Statistics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <Star className="w-6 h-6 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Best Score</p>
                            {isLoading ? <Skeleton className="h-7 w-24" /> : <p className="text-xl font-bold">{profileStats?.highScore ?? 0}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <Gamepad2 className="w-6 h-6 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Games Played</p>
                            {isLoading ? <Skeleton className="h-7 w-24" /> : <p className="text-xl font-bold">{profileStats?.gamesPlayed ?? 0}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Equipped Cosmetic */}
             <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                    <CardTitle>Equipped Skin</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-bold">{cosmetic.name}</p>
                            <SnakePreview cosmetic={cosmetic} />
                        </div>
                    </div>
                </CardContent>
             </Card>
        </div>

        {/* Nest */}
        <Card className="bg-card/50 border-primary/20">
        <CardHeader>
            <CardTitle>Nest</CardTitle>
        </CardHeader>
        <CardContent>
            {isNestsLoading ? (
                <Skeleton className="w-full h-24" />
            ) : nest ? (
                <NestBanner nest={nest} />
            ) : (
                <p className="text-sm text-muted-foreground text-center p-4">Not a member of any Nest.</p>
            )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

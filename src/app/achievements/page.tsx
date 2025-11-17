
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useAchievements } from "@/context/AchievementContext";
import AchievementCard from "@/components/game/AchievementCard";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AchievementWithProgress, AchievementCategory } from '@/lib/types';

type FilterStatus = 'all' | 'unlocked' | 'locked';
const CATEGORY_ORDER: AchievementCategory[] = ['Core', 'Score', 'Length', 'Skill', 'Difficulty', 'Endurance', 'Grind', 'Meta', 'Ultimate'];

export default function AchievementsPage() {
  const { achievements, isLoading } = useAchievements();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const unlockedCount = useMemo(() => achievements.filter(a => a.isUnlocked).length, [achievements]);
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const filteredAchievements = useMemo(() => {
    if (filter === 'unlocked') {
      return achievements.filter(a => a.isUnlocked);
    }
    if (filter === 'locked') {
      return achievements.filter(a => !a.isUnlocked);
    }
    return achievements;
  }, [achievements, filter]);
  
  const groupedAchievements = useMemo(() => {
    const groups: Partial<Record<AchievementCategory, AchievementWithProgress[]>> = {};
    for (const achievement of filteredAchievements) {
        if (!groups[achievement.category]) {
            groups[achievement.category] = [];
        }
        groups[achievement.category]!.push(achievement);
    }
    return groups;
  }, [filteredAchievements]);


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="bg-card/50 border-primary/20 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-primary" />
            Achievements
          </CardTitle>
          <CardDescription>
            You've unlocked {unlockedCount} of {totalCount} achievements. Keep going!
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-2 mb-8">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
        <Button variant={filter === 'unlocked' ? 'default' : 'outline'} onClick={() => setFilter('unlocked')}>Unlocked</Button>
        <Button variant={filter === 'locked' ? 'default' : 'outline'} onClick={() => setFilter('locked')}>Locked</Button>
      </div>

      {isLoading ? (
         <div className="space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-40" />)}
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="space-y-8">
            {CATEGORY_ORDER.map(category => {
                const group = groupedAchievements[category];
                if (!group || group.length === 0) return null;
                return (
                    <div key={category}>
                        <h2 className="text-2xl font-bold text-primary mb-4" style={{ filter: `drop-shadow(0 0 5px hsl(var(--primary)))` }}>
                            {category}
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                            {group.map((achievement) => (
                                <AchievementCard key={achievement.id} achievement={achievement} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
}

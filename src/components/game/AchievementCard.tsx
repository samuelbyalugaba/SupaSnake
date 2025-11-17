
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AchievementWithProgress } from '@/lib/types';
import * as LucideIcons from 'lucide-react';
import { Progress } from '../ui/progress';

interface AchievementCardProps {
  achievement: AchievementWithProgress;
}

const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const { name, description, icon, isUnlocked, isSecret, progress, target } = achievement;
  
  const isLockedSecret = isSecret && !isUnlocked;

  const IconComponent = isLockedSecret 
    ? LucideIcons.HelpCircle
    : (LucideIcons as any)[icon] || LucideIcons.ShieldQuestion;

  const progressPercentage = target > 0 ? (progress / target) * 100 : 0;
  const showProgressBar = !isUnlocked && progress > 0 && target > 1;

  return (
    <Card className={cn(
      "transition-all duration-300 flex flex-row items-center gap-4 p-4 transform hover:scale-105",
      isUnlocked 
        ? "bg-card/70 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]" 
        : "bg-card/30 border-muted/20 filter grayscale opacity-70 hover:opacity-100 hover:filter-none"
    )}>
        <div className={cn(
          "w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 border-2",
           isUnlocked ? "bg-primary/10 border-primary" : "bg-muted/20 border-muted/40"
        )}>
          <IconComponent className={cn(
            "w-6 h-6 md:w-8 md:h-8",
            isUnlocked ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
      
      <div className="flex-1 text-left">
        <CardTitle className={cn("text-lg md:text-xl leading-tight", !isUnlocked && "text-muted-foreground")}>
            {isLockedSecret ? '???' : name}
        </CardTitle>
        
        <CardDescription className={cn("mt-1 text-xs md:text-sm", !isUnlocked ? 'text-muted-foreground/80' : '')}>
            {isLockedSecret ? 'Unlock this secret achievement to reveal its details.' : description}
        </CardDescription>

        {showProgressBar && (
            <div className="mt-2 space-y-1">
                <Progress value={progressPercentage} className="h-2"/>
                <p className="text-xs text-muted-foreground">{progress} / {target}</p>
            </div>
        )}
      </div>
    </Card>
  );
};

export default AchievementCard;

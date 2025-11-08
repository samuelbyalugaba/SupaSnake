"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Bot, GraduationCap } from 'lucide-react';
import { getPlayerCoachAdvice } from '@/ai/flows/player-coach-flow';
import type { GameState } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface AIPlayerCoachProps {
  gameState: GameState;
}

const AIPlayerCoach: React.FC<AIPlayerCoachProps> = ({ gameState }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [advice, setAdvice] = useState<{ title: string, message: string } | null>(null);

  const handleGetAdvice = () => {
    startTransition(async () => {
      setAdvice(null);
      try {
        const adviceInput = {
          gameState: JSON.stringify({
            score: gameState.score,
            level: gameState.level,
            snakeLength: gameState.snake.length,
            status: gameState.status,
            foodEatenThisLevel: gameState.foodEatenThisLevel,
          }),
        };
        const result = await getPlayerCoachAdvice(adviceInput);
        setAdvice({ title: result.title, message: result.message });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'AI Error',
          description: 'Could not get coaching advice.',
        });
      }
    });
  };

  useEffect(() => {
    // Automatically get advice when game state indicates a significant event
    if (gameState.status === 'GAME_OVER' || (gameState.score > 0 && gameState.score % 50 === 0)) {
        handleGetAdvice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status, gameState.score]);


  return (
    <Card className="w-full bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <GraduationCap className="text-primary"/>
            AI Player Coach
        </CardTitle>
        <CardDescription>
            Get real-time tips and encouragement from our AI coach.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={handleGetAdvice} disabled={isPending}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isPending ? 'Thinking...' : 'Get Coaching'}
        </Button>
        {isPending && (
            <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-4/5" />
            </div>
        )}
        {advice && (
            <div className="text-sm p-3 bg-muted/50 rounded-lg">
                <p className="font-bold text-primary">{advice.title}</p>
                <p className="mt-1 text-muted-foreground">{advice.message}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIPlayerCoach;

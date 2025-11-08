"use client";

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Bot } from 'lucide-react';
import { getSoundEffectAdvice } from '@/ai/flows/sound-effect-adviser';
import type { GameState } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface SoundEffectAdvisorProps {
  gameState: GameState;
}

const SoundEffectAdvisor: React.FC<SoundEffectAdvisorProps> = ({ gameState }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [advice, setAdvice] = useState<{ effect: string | null, reason: string } | null>(null);

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
                }),
            };
            const result = await getSoundEffectAdvice(adviceInput);
            
            setAdvice({ effect: result.suggestedSoundEffect, reason: result.reason });

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: 'Could not get sound effect advice.',
            });
        }
    });
  };

  return (
    <Card className="w-full bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot className="text-primary"/>
            AI Sound Advisor
        </CardTitle>
        <CardDescription>
            Get AI-powered suggestions for sound effects based on the current game state.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={handleGetAdvice} disabled={isPending}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isPending ? 'Analyzing...' : 'Get Sound Advice'}
        </Button>
        {isPending && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
            </div>
        )}
        {advice && (
            <div className="text-sm p-3 bg-muted/50 rounded-lg">
                <p>
                    <span className="font-bold text-primary">Suggestion: </span> 
                    {advice.effect ? <code className="font-bold">{advice.effect}</code> : 'No sound needed.'}
                </p>
                <p className="mt-1 text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Reason: </span> 
                    {advice.reason}
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SoundEffectAdvisor;


"use client";

import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { ShieldQuestion, Star, Skull, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SnakeGame from '../game/SnakeGame';
import type { Difficulty } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useRouter } from 'next/navigation';

type Screen = 'DIFFICULTY' | 'GAME';

const DifficultyCard = ({ icon, title, description, onClick }: { icon: React.ElementType, title: string, description: string, onClick: () => void }) => (
  <Card 
    className="w-full max-w-sm bg-card/50 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all cursor-pointer"
    onClick={onClick}
  >
    <CardHeader className="flex flex-row items-center gap-4 pb-2">
      {React.createElement(icon, { className: "w-8 h-8 text-primary" })}
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

export default function MainMenu() {
  const [screen, setScreen] = useState<Screen>('DIFFICULTY');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [audioStarted, setAudioStarted] = useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const router = useRouter();

  const toggleFullScreen = () => setIsFullScreen(prev => !prev);
  
  const handleInteraction = useCallback(() => {
    if (!audioStarted) {
      Tone.start();
      setAudioStarted(true);
    }
  }, [audioStarted]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
       if (e.key === 'Escape' && isFullScreen) {
        e.preventDefault();
        toggleFullScreen();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullScreen]);
  
  useEffect(() => {
    // Add event listener for the first user interaction to start audio context
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    }
  }, [handleInteraction]);

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setScreen('GAME');
  };

  const handleExitGame = () => {
    setScreen('DIFFICULTY');
    if (isFullScreen) {
      toggleFullScreen();
    }
  };

  if (screen === 'GAME') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-4 w-full flex-1",
        isFullScreen ? 'fixed inset-0 bg-background z-[100]' : 'relative'
      )}>
        <SnakeGame 
            toggleFullScreen={toggleFullScreen} 
            isFullScreen={isFullScreen} 
            difficulty={difficulty}
            onExit={handleExitGame}
        />
        <Button variant="outline" onClick={handleExitGame} className={cn(isFullScreen && "hidden")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Change Difficulty
        </Button>
      </div>
    );
  }

  return (
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
          <h1 className="text-5xl font-black uppercase tracking-wider mb-8" style={{ filter: `drop-shadow(0 0 10px hsl(var(--primary)))` }}>Choose Difficulty</h1>
          <DifficultyCard 
              icon={ShieldQuestion} 
              title="Easy" 
              description="Food is stationary. A chill mode to learn the ropes." 
              onClick={() => handleDifficultySelect('easy')} 
          />
          <DifficultyCard 
              icon={Star} 
              title="Medium" 
              description="Food moves around. The standard snake experience."
              onClick={() => handleDifficultySelect('medium')} 
          />
          <DifficultyCard 
              icon={Skull} 
              title="Hard" 
              description="Food moves and obstacles appear. Good luck!"
              onClick={() => handleDifficultySelect('hard')} 
          />
          <Button variant="ghost" onClick={() => router.push('/')} className="mt-8">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to HQ
          </Button>
      </div>
  );
}

    
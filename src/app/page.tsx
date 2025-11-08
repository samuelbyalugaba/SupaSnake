"use client";

import React from 'react';
import SnakeGame from '@/components/game/SnakeGame';
import Leaderboard from '@/components/game/Leaderboard';
import SoundEffectAdvisor from '@/components/ai/SoundEffectAdvisor';
import type { GameState } from '@/lib/types';
import { Gamepad2 } from 'lucide-react';

export default function Home() {
  const [gameState, setGameState] = React.useState<GameState | null>(null);

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-4 font-headline">
      <div className="absolute top-4 left-4 text-2xl font-bold flex items-center gap-2">
        <Gamepad2 className="text-primary" size={28} />
        <h1>Neon Snake</h1>
      </div>
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-16 lg:mt-0">
        <div className="lg:col-span-2 w-full">
          <SnakeGame onStateChange={setGameState} />
        </div>

        <div className="w-full flex flex-col gap-8">
          <Leaderboard />
          {gameState && <SoundEffectAdvisor gameState={gameState} />}
        </div>
      </div>
      
      <footer className="w-full text-center text-muted-foreground text-sm p-4 mt-8">
        Built with Next.js, Firebase, and Genkit.
      </footer>
    </div>
  );
}

"use client";

import React from 'react';
import SnakeGame from '@/components/game/SnakeGame';
import Leaderboard from '@/components/game/Leaderboard';
import AIPlayerCoach from '@/components/ai/AIPlayerCoach';
import type { GameState } from '@/lib/types';
import { Gamepad2 } from 'lucide-react';
import AuthButton from '@/components/auth/AuthButton';

export default function Home() {
  const [gameState, setGameState] = React.useState<GameState | null>(null);

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-4 font-headline">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="text-primary" size={28} />
          <h1>Neon Snake</h1>
        </div>
        <AuthButton />
      </header>
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-24 lg:mt-16">
        <div className="lg:col-span-2 w-full">
          <SnakeGame onStateChange={setGameState} />
        </div>

        <div className="w-full flex flex-col gap-8">
          <Leaderboard />
          {gameState && <AIPlayerCoach gameState={gameState} />}
        </div>
      </div>
      
      <footer className="w-full text-center text-muted-foreground text-sm p-4 mt-8">
        Built with Love @ TSJ Diversified Group
      </footer>
    </div>
  );
}

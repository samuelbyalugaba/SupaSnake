
"use client";

import React from 'react';
import SnakeGame from '@/components/game/SnakeGame';
import Leaderboard from '@/components/game/Leaderboard';
import AIChatbot from '@/components/ai/AIChatbot';
import type { GameState } from '@/lib/types';
import { Gamepad2 } from 'lucide-react';
import AuthButton from '@/components/auth/AuthButton';
import GlobalChat from '@/components/game/GlobalChat';
import { useUser } from '@/firebase';

export default function Home() {
  const [gameState, setGameState] = React.useState<GameState | null>(null);
  const { user } = useUser();

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-4 font-headline overflow-hidden">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="text-primary" size={28} />
          <h1>Supa Snake</h1>
        </div>
        <AuthButton />
      </header>
      
      <main className="w-full max-w-screen-xl mx-auto flex-1 flex items-center justify-center px-4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12 items-start mt-20 lg:mt-0">
          <div className="lg:col-span-3 w-full flex justify-center">
            <SnakeGame onStateChange={setGameState} />
          </div>

          <div className="lg:col-span-2 w-full flex flex-col gap-8">
            <Leaderboard />
            { user && <GlobalChat /> }
            <AIChatbot />
          </div>
        </div>
      </main>
      
      <footer className="w-full text-center text-muted-foreground text-sm p-4">
        Built with Love @ TSJ Diversified Group
      </footer>
    </div>
  );
}

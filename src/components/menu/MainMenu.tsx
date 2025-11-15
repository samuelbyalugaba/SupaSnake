
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Gamepad2, Brush, Settings, ShieldQuestion, Star, Skull, ArrowLeft } from 'lucide-react';
import AuthButton from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SnakeGame from '../game/SnakeGame';
import type { Difficulty } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type Screen = 'SPLASH' | 'MENU' | 'GAME' | 'COSMETICS' | 'SETTINGS' | 'DIFFICULTY';

const MenuButton = ({ icon, label, onClick, disabled = false }: { icon: React.ElementType, label: string, onClick: () => void, disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-full max-w-sm text-2xl font-bold uppercase tracking-widest p-4 border-2 border-primary/50 rounded-lg flex items-center justify-center gap-4 transition-all duration-300",
      "hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_20px_theme(colors.primary)]",
      "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/50 disabled:hover:shadow-none"
    )}
  >
    {React.createElement(icon, { className: "w-6 h-6" })}
    <span>{label}</span>
  </button>
);

const DifficultyCard = ({ icon, title, description, onClick }: { icon: React.ElementType, title: string, description: string, onClick: () => void }) => (
  <Card 
    className="w-full max-w-sm bg-card/50 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all cursor-pointer hover:shadow-[0_0_20px_theme(colors.primary)]"
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
  const [screen, setScreen] = useState<Screen>('SPLASH');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [audioStarted, setAudioStarted] = useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const toggleFullScreen = () => setIsFullScreen(prev => !prev);
  
  const handleInteraction = useCallback(() => {
    if (!audioStarted) {
      Tone.start();
      setAudioStarted(true);
    }
    if (screen === 'SPLASH') {
      setScreen('MENU');
    }
  }, [audioStarted, screen]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && screen === 'SPLASH') {
        handleInteraction();
      }
       if (e.key === 'Escape' && isFullScreen) {
        e.preventDefault();
        toggleFullScreen();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleInteraction, isFullScreen, screen]);

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setScreen('GAME');
  };

  const renderMenuContent = () => {
    switch (screen) {
      case 'SPLASH':
        return (
          <div className="text-center flex flex-col items-center justify-center h-full animate-in fade-in duration-1000" onClick={handleInteraction}>
             <h1
                className="text-6xl md:text-8xl font-black uppercase tracking-wider"
                style={{ filter: `drop-shadow(0 0 10px hsl(var(--primary))) drop-shadow(0 0 30px hsl(var(--primary)))` }}
              >
                Supa Snake
              </h1>
            <p className="mt-8 text-xl text-primary/80 animate-flash">Press Enter / Tap to Start</p>
          </div>
        );
      case 'MENU':
        return (
          <div className="w-full flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
            <h1 className="text-5xl font-black uppercase tracking-wider mb-8" style={{ filter: `drop-shadow(0 0 10px hsl(var(--primary)))` }}>Main Menu</h1>
            <MenuButton icon={Gamepad2} label="Play" onClick={() => setScreen('DIFFICULTY')} />
            <MenuButton icon={Brush} label="Cosmetics" onClick={() => setScreen('COSMETICS')} disabled={true} />
            <MenuButton icon={Settings} label="Settings" onClick={() => setScreen('SETTINGS')} disabled={true} />
            <div className="mt-8">
              <AuthButton />
            </div>
          </div>
        );
      case 'DIFFICULTY':
          return (
              <div className="w-full max-w-2xl flex flex-col items-center gap-6 animate-in fade-in duration-500">
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
                  <Button variant="ghost" onClick={() => setScreen('MENU')} className="mt-8">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
                  </Button>
              </div>
          );
      default:
        return (
           <div className="flex flex-col items-center gap-4">
              <p>This feature is coming soon!</p>
              <Button onClick={() => setScreen('MENU')}>Back to Menu</Button>
           </div>
        )
    }
  };

  if (screen === 'GAME') {
    return (
      <main className="relative min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 font-headline overflow-hidden">
        <div className={cn('w-full h-full flex items-center justify-center z-10', isFullScreen ? 'contents' : 'relative')}>
          <div className={cn(
            "w-full flex flex-col items-center justify-center",
            !isFullScreen && "mt-20 lg:mt-0"
          )}>
             <div className={cn("flex-shrink-0 w-full lg:w-auto", isFullScreen && "fixed inset-0 z-50 flex items-center justify-center")}>
                <SnakeGame 
                    toggleFullScreen={toggleFullScreen} 
                    isFullScreen={isFullScreen} 
                    difficulty={difficulty}
                    onExit={() => setScreen('DIFFICULTY')}
                />
            </div>
            
            <div className={cn("w-full max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-4 flex items-center justify-between", isFullScreen && "hidden")}>
                <Button variant="outline" onClick={() => setScreen('DIFFICULTY')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <AuthButton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col items-center justify-center p-4 font-headline overflow-hidden" onClick={handleInteraction}>
      <div className="animated-grid"></div>
      <div className="crt-scanlines"></div>
      <div className="w-full h-full flex items-center justify-center z-10">
        {renderMenuContent()}
      </div>
    </main>
  );
}

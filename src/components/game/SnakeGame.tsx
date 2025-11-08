
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useSounds } from '@/hooks/use-sounds';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthDialog from '@/components/auth/AuthDialog';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { GRID_SIZE, CANVAS_SIZE_DESKTOP, INITIAL_SNAKE_POSITION, INITIAL_DIRECTION, GAME_SPEED_START, GAME_SPEED_INCREMENT, MAX_LEVEL, FOOD_PER_LEVEL, SCORE_INCREMENT } from '@/lib/constants';
import type { Direction, Point, GameState } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface SnakeGameProps {
  onStateChange: (state: GameState) => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { isMuted, toggleMute, playSound } = useSounds();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE_POSITION,
    food: { x: 15, y: 15 },
    direction: INITIAL_DIRECTION,
    speed: GAME_SPEED_START,
    score: 0,
    level: 1,
    foodEatenThisLevel: 0,
    status: 'IDLE',
  });

  const lastUpdateTimeRef = useRef(0);
  const gameLoopRef = useRef<number>();
  const touchStartRef = useRef<Point | null>(null);

  useEffect(() => {
    setHighScore(Number(localStorage.getItem('highScore') || '0'));
  }, []);
  
  useEffect(() => {
    onStateChange(gameState);
  }, [gameState, onStateChange]);

  const generateFood = useCallback((snake: Point[]): Point => {
    let foodPosition: Point;
    do {
      foodPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
    return foodPosition;
  }, []);

  const resetGame = useCallback(() => {
    const newFoodPosition = generateFood(INITIAL_SNAKE_POSITION);
    setGameState({
      snake: INITIAL_SNAKE_POSITION,
      food: newFoodPosition,
      direction: INITIAL_DIRECTION,
      speed: GAME_SPEED_START,
      score: 0,
      level: 1,
      foodEatenThisLevel: 0,
      status: 'IDLE',
    });
  }, [generateFood]);

  const startGame = useCallback(() => {
    if (gameState.status === 'IDLE' || gameState.status === 'GAME_OVER') {
      resetGame();
      setGameState(prev => ({ ...prev, status: 'RUNNING' }));
    } else if (gameState.status === 'PAUSED') {
      setGameState(prev => ({ ...prev, status: 'RUNNING' }));
    }
  }, [gameState.status, resetGame]);

  const pauseGame = useCallback(() => {
    if (gameState.status === 'RUNNING') {
      setGameState(prev => ({ ...prev, status: 'PAUSED' }));
    }
  }, [gameState.status]);

  const gameOver = useCallback(async () => {
    setGameState(prev => ({ ...prev, status: 'GAME_OVER' }));
    playSound('gameOver');
    if (gameState.score > highScore) {
      setHighScore(gameState.score);
      localStorage.setItem('highScore', String(gameState.score));
      if (user && db && gameState.score > 0) {
        const scoreRef = doc(db, 'highscores', user.uid);
        const scoreData = {
          userId: user.uid,
          username: user.displayName || user.email,
          score: gameState.score,
          timestamp: serverTimestamp(),
        };
        setDocumentNonBlocking(scoreRef, scoreData, { merge: true });
        toast({ title: "New High Score!", description: "Your score has been saved to the leaderboard." });
      }
    }
  }, [gameState.score, highScore, playSound, user, toast, db]);


  const updateGame = useCallback(() => {
    if (gameState.status !== 'RUNNING') return;

    setGameState(prev => {
      const newSnake = [...prev.snake];
      const head = { ...newSnake[0] };

      switch (prev.direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return prev;
      }

      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          gameOver();
          return prev;
        }
      }
      
      newSnake.unshift(head);

      let newScore = prev.score;
      let newLevel = prev.level;
      let newSpeed = prev.speed;
      let newFoodEatenThisLevel = prev.foodEatenThisLevel;
      let newFood = prev.food;

      if (head.x === prev.food.x && head.y === prev.food.y) {
        playSound('eat');
        newScore += SCORE_INCREMENT;
        newFoodEatenThisLevel++;
        
        if (newLevel < MAX_LEVEL && newFoodEatenThisLevel >= FOOD_PER_LEVEL) {
          newLevel++;
          newSpeed *= GAME_SPEED_INCREMENT;
          newFoodEatenThisLevel = 0;
        }
        
        newFood = generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        score: newScore,
        level: newLevel,
        speed: newSpeed,
        foodEatenThisLevel: newFoodEatenThisLevel,
      };
    });
  }, [gameState.status, gameOver, playSound, generateFood]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const cellSize = CANVAS_SIZE_DESKTOP / GRID_SIZE;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE_DESKTOP, CANVAS_SIZE_DESKTOP);

    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.fillRect(gameState.food.x * cellSize, gameState.food.y * cellSize, cellSize, cellSize);
    ctx.shadowBlur = 0;

    gameState.snake.forEach((segment, index) => {
      const gradient = ctx.createLinearGradient(
        segment.x * cellSize,
        segment.y * cellSize,
        (segment.x + 1) * cellSize,
        (segment.y + 1) * cellSize
      );
      gradient.addColorStop(0, '#39FF14');
      gradient.addColorStop(1, '#00C700');
      
      ctx.fillStyle = gradient;

      ctx.shadowColor = 'rgba(57, 255, 20, 0.7)';
      ctx.shadowBlur = index === 0 ? 20 : 10;
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });
    ctx.shadowBlur = 0;

  }, [gameState.snake, gameState.food]);

  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (gameState.status !== 'RUNNING') {
        lastUpdateTimeRef.current = currentTime;
      } else {
        const deltaTime = currentTime - lastUpdateTimeRef.current;
        if (deltaTime > gameState.speed) {
          lastUpdateTimeRef.current = currentTime;
          updateGame();
        }
      }
      
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (context) {
        draw(context);
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [draw, updateGame, gameState.speed, gameState.status]);

  const handleDirectionChange = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      const { direction, status } = prev;
      if (status !== 'RUNNING') return prev;
      if (
        (direction === 'UP' && newDirection === 'DOWN') ||
        (direction === 'DOWN' && newDirection === 'UP') ||
        (direction === 'LEFT' && newDirection === 'RIGHT') ||
        (direction === 'RIGHT' && newDirection === 'LEFT')
      ) {
        return prev;
      }
      return { ...prev, direction: newDirection };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(isAuthDialogOpen) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (gameState.status === 'RUNNING') pauseGame();
        else if (gameState.status === 'PAUSED') startGame();
      } else if (e.key === 'Enter' && (gameState.status === 'IDLE' || gameState.status === 'GAME_OVER')) {
        e.preventDefault();
        startGame();
      } else {
        let newDirection: Direction | null = null;
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') newDirection = 'UP';
        else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') newDirection = 'DOWN';
        else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') newDirection = 'LEFT';
        else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') newDirection = 'RIGHT';

        if (newDirection) {
           e.preventDefault();
           handleDirectionChange(newDirection);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, pauseGame, startGame, handleDirectionChange, isAuthDialogOpen]);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        handleDirectionChange(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        handleDirectionChange(dy > 0 ? 'DOWN' : 'UP');
      }
      touchStartRef.current = null;
    }
  };

  return (
    <Card className="w-full max-w-[640px] mx-auto bg-card/50 border-primary/20 p-2">
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-2 text-lg">
          <div>Score: <span className="text-primary font-bold">{gameState.score}</span></div>
          <div>Level: <span className="text-primary font-bold">{gameState.level}</span></div>
          <div>High Score: <span className="text-primary font-bold">{highScore}</span></div>
          <Button onClick={toggleMute} variant="ghost" size="icon">
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
        <div className="relative aspect-square w-full">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE_DESKTOP}
            height={CANVAS_SIZE_DESKTOP}
            className="w-full h-full object-contain rounded-md"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => touchStartRef.current = null}
          />
          {(gameState.status !== 'RUNNING') && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center rounded-md p-4">
                {gameState.status === 'IDLE' && (
                    <>
                        <h2 className="text-4xl font-bold text-primary">Neon Snake</h2>
                        <p className="mt-4 text-xl animate-flash">Press Enter to Start</p>
                        <div className="mt-8 text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="text-left">
                                <p className='font-bold text-primary'>Controls:</p>
                                <p>W/A/S/D or Arrow Keys</p>
                                <p>Spacebar to Pause</p>
                            </div>
                             <div className="text-left">
                                <p className='font-bold text-primary'>Mobile:</p>
                                <p>Swipe to Move</p>
                            </div>
                        </div>
                    </>
                )}
                {gameState.status === 'PAUSED' && (
                    <>
                        <h2 className="text-4xl font-bold">Paused</h2>
                        <Button onClick={startGame} className="mt-4">Resume</Button>
                    </>
                )}
                {gameState.status === 'GAME_OVER' && (
                    <>
                        <h2 className="text-4xl font-bold text-destructive">Game Over</h2>
                        <p className="mt-2 text-2xl">Final Score: {gameState.score}</p>
                        <div className="flex gap-4 mt-6">
                            <Button onClick={startGame}>Restart</Button>
                            {!user && gameState.score > 0 && (
                                <Button variant="secondary" onClick={() => setIsAuthDialogOpen(true)}>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Save Score
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
          )}
        </div>
        <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      </CardContent>
    </Card>
  );
};

export default SnakeGame;

    
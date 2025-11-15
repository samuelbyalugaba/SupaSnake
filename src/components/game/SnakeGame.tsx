
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Maximize, Minimize, Pause, Play, ArrowLeft } from 'lucide-react';
import { GRID_SIZE, CANVAS_SIZE_DESKTOP, INITIAL_SNAKE_POSITION, INITIAL_DIRECTION, SCORE_INCREMENT } from '@/lib/constants';
import type { Direction, Point, GameState, Difficulty, GameStatus } from '@/lib/types';
import { useSounds } from '@/hooks/use-sounds';
import { cn } from '@/lib/utils';

const DIFFICULTY_SETTINGS = {
  easy: { speed: 150, foodMoves: false, hasObstacles: false, speedIncrement: 0.95, foodPerLevel: 5, maxLevel: 5 },
  medium: { speed: 100, foodMoves: true, hasObstacles: false, speedIncrement: 0.9, foodPerLevel: 5, maxLevel: 10 },
  hard: { speed: 85, foodMoves: true, hasObstacles: true, speedIncrement: 0.9, foodPerLevel: 5, maxLevel: 15 },
};
const OBSTACLE_COUNT = 5;

interface SnakeGameProps {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  difficulty: Difficulty;
  onExit: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ isFullScreen, toggleFullScreen, difficulty, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const touchStartRef = useRef<Point | null>(null);

  const { playSound } = useSounds();

  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE_POSITION,
    food: { x: -1, y: -1 }, // Initial food position, will be generated
    foodDirection: 'RIGHT',
    direction: INITIAL_DIRECTION,
    speed: DIFFICULTY_SETTINGS[difficulty].speed,
    score: 0,
    level: 1,
    foodEatenThisLevel: 0,
    status: 'IDLE'
  });
  
  const settings = DIFFICULTY_SETTINGS[difficulty];
  
  const obstacles = useMemo(() => {
    if (!settings.hasObstacles) return [];
    const newObstacles: Point[] = [];
    while (newObstacles.length < OBSTACLE_COUNT) {
      const obstacle = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isNearCenter = Math.abs(obstacle.x - GRID_SIZE / 2) < 3 && Math.abs(obstacle.y - GRID_SIZE / 2) < 3;
      if (!newObstacles.some(o => o.x === obstacle.x && o.y === obstacle.y) && !isNearCenter) {
        newObstacles.push(obstacle);
      }
    }
    return newObstacles;
  }, [settings.hasObstacles]);

  const generateFood = useCallback((snake: Point[]): Point => {
    let foodPosition: Point;
    do {
      foodPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y) ||
      obstacles.some(o => o.x === foodPosition.x && o.y === foodPosition.y)
    );
    return foodPosition;
  }, [obstacles]);

  const resetGame = useCallback(() => {
    const initialSnake = INITIAL_SNAKE_POSITION;
    setGameState({
      snake: initialSnake,
      food: generateFood(initialSnake),
      foodDirection: 'RIGHT',
      direction: INITIAL_DIRECTION,
      speed: settings.speed,
      foodEatenThisLevel: 0,
      score: 0,
      level: 1,
      status: 'IDLE'
    });
  }, [generateFood, settings.speed]);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);
  
  const startGame = useCallback(() => {
    if (gameState.status === 'RUNNING') return;
    
    setGameState(prev => {
        if (prev.status !== 'PAUSED') {
            const initialSnake = INITIAL_SNAKE_POSITION;
            return {
                ...prev,
                snake: initialSnake,
                food: generateFood(initialSnake),
                direction: INITIAL_DIRECTION,
                speed: settings.speed,
                score: 0,
                level: 1,
                foodEatenThisLevel: 0,
                status: 'RUNNING'
            };
        }
        return { ...prev, status: 'RUNNING' };
    });
  }, [gameState.status, generateFood, settings.speed]);
  
  const pauseGame = useCallback(() => {
    if (gameState.status === 'RUNNING') {
        setGameState(prev => ({ ...prev, status: 'PAUSED' }));
    }
  }, [gameState.status]);

  const togglePause = useCallback(() => {
    if (gameState.status === 'RUNNING') pauseGame();
    else if (gameState.status === 'PAUSED') startGame();
  }, [gameState.status, pauseGame, startGame]);

  const gameOver = useCallback(() => {
    playSound('gameOver');
    setGameState(prev => ({...prev, status: 'GAME_OVER'}));
  }, [playSound]);

  const getValidFoodMoves = useCallback((food: Point, snake: Point[]): Direction[] => {
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    return directions.filter(dir => {
        let { x, y } = food;
        if (dir === 'UP') y--;
        else if (dir === 'DOWN') y++;
        else if (dir === 'LEFT') x--;
        else if (dir === 'RIGHT') x++;

        const willHitWall = x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE;
        const willHitSnake = snake.some(seg => seg.x === x && seg.y === y);
        const willHitObstacle = obstacles.some(o => o.x === x && o.y === y);

        return !willHitWall && !willHitSnake && !willHitObstacle;
    });
  }, [obstacles]);
  
  const getCanvasSize = useCallback(() => {
    if (typeof window === 'undefined') return CANVAS_SIZE_DESKTOP;
    if (isFullScreen) {
        return Math.min(window.innerWidth, window.innerHeight) * 0.9;
    }
    return CANVAS_SIZE_DESKTOP;
  }, [isFullScreen]);
  
  const handleDirectionChange = useCallback((newDirection: Direction) => {
    setGameState(prev => {
        if (prev.status !== 'RUNNING') return prev;
        const { direction } = prev;
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
       if (document.activeElement && (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase()))) {
        return;
      }
      e.preventDefault();
      if (e.key === ' ' || e.code === 'Space') togglePause();
      else if (e.key === 'Enter' && (gameState.status === 'IDLE' || gameState.status === 'GAME_OVER')) startGame();
      else if (e.key === 'f' || e.key === 'F') toggleFullScreen();
      else {
        let newDirection: Direction | null = null;
        if (e.key === 'ArrowUp') newDirection = 'UP';
        else if (e.key === 'ArrowDown') newDirection = 'DOWN';
        else if (e.key === 'ArrowLeft') newDirection = 'LEFT';
        else if (e.key === 'ArrowRight') newDirection = 'RIGHT';
        if (newDirection) handleDirectionChange(newDirection);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause, startGame, handleDirectionChange, toggleFullScreen, gameState.status]);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const swipeThreshold = 20;

    if (Math.abs(dx) > swipeThreshold || Math.abs(dy) > swipeThreshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        handleDirectionChange(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        handleDirectionChange(dy > 0 ? 'DOWN' : 'UP');
      }
      touchStartRef.current = null;
    }
  };

  const handleOverlayClick = () => {
    if (gameState.status === 'IDLE' || gameState.status === 'GAME_OVER' || gameState.status === 'PAUSED') {
      startGame();
    }
  };
  
  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'RUNNING') return prev;
      
      let { snake, direction, food, foodDirection, score, level, foodEatenThisLevel, speed } = { ...prev };
      let newStatus = prev.status;

      const newSnake = [...snake];
      const head = { ...newSnake[0] };
  
      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
  
      const headCollidesWithWall = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
      const headCollidesWithObstacle = obstacles.some(o => o.x === head.x && o.y === head.y);
      const headCollidesWithSelf = newSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  
      if (headCollidesWithWall || headCollidesWithObstacle || headCollidesWithSelf) {
        newStatus = 'GAME_OVER';
        playSound('gameOver');
      } else {
        newSnake.unshift(head);
  
        if (head.x === food.x && head.y === food.y) {
          playSound('eat');
          score += SCORE_INCREMENT;
          foodEatenThisLevel++;
          
          if (level < settings.maxLevel && foodEatenThisLevel >= settings.foodPerLevel) {
            level++;
            speed *= settings.speedIncrement;
            foodEatenThisLevel = 0;
          }
          food = generateFood(newSnake);
        } else {
          newSnake.pop();
        }
        
        if (settings.foodMoves) {
            const validMoves = getValidFoodMoves(food, newSnake);
            if (validMoves.length > 0) {
              const snakeHead = newSnake[0];
              const dx = food.x - snakeHead.x;
              const dy = food.y - snakeHead.y;
      
              let bestMove = foodDirection;
              if (Math.abs(dx) > Math.abs(dy)) {
                bestMove = dx > 0 ? 'RIGHT' : 'LEFT';
              } else {
                bestMove = dy > 0 ? 'DOWN' : 'UP';
              }
              
              if (validMoves.includes(bestMove)) {
                foodDirection = bestMove;
              } else if (!validMoves.includes(foodDirection)) {
                foodDirection = validMoves[Math.floor(Math.random() * validMoves.length)];
              }
      
              const newFood = { ...food };
              switch (foodDirection) {
                case 'UP': newFood.y = Math.max(0, newFood.y - 1); break;
                case 'DOWN': newFood.y = Math.min(GRID_SIZE - 1, newFood.y + 1); break;
                case 'LEFT': newFood.x = Math.max(0, newFood.x - 1); break;
                case 'RIGHT': newFood.x = Math.min(GRID_SIZE - 1, newFood.x + 1); break;
              }
              food = newFood;
            }
        }
        snake = newSnake;
      }
      return { ...prev, snake, food, foodDirection, score, level, speed, foodEatenThisLevel, status: newStatus };
    });
  }, [obstacles, playSound, settings, generateFood, getValidFoodMoves]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    let lastUpdateRef = 0;

    const draw = (state: GameState) => {
      const canvasSize = context.canvas.width;
      const cellSize = canvasSize / GRID_SIZE;
      
      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvasSize, canvasSize);
  
      if (settings.hasObstacles) {
        context.fillStyle = '#444';
        context.shadowColor = '#222';
        context.shadowBlur = 10;
        obstacles.forEach(o => context.fillRect(o.x * cellSize, o.y * cellSize, cellSize, cellSize));
        context.shadowBlur = 0;
      }
      
      const food = state.food;
      const centerX = food.x * cellSize + cellSize / 2;
      const centerY = food.y * cellSize + cellSize / 2;
      const bodyRadius = cellSize * 0.35;
      context.beginPath();
      context.moveTo(centerX + bodyRadius * 0.8, centerY + bodyRadius * 0.5);
      context.quadraticCurveTo(centerX + bodyRadius * 2, centerY, centerX + bodyRadius * 1.5, centerY - bodyRadius * 1.5);
      context.strokeStyle = '#E3A3B4';
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = '#94a3b8';
      context.beginPath();
      context.arc(centerX, centerY, bodyRadius, 0, 2 * Math.PI);
      context.fill();
      const earRadius = bodyRadius * 0.4;
      context.fillStyle = '#E3A3B4';
      context.beginPath(); context.arc(centerX - bodyRadius * 0.7, centerY - bodyRadius * 0.7, earRadius, 0, 2 * Math.PI); context.fill();
      context.beginPath(); context.arc(centerX + bodyRadius * 0.1, centerY - bodyRadius * 0.9, earRadius, 0, 2 * Math.PI); context.fill();
      context.fillStyle = '#000';
      context.beginPath(); context.arc(centerX - bodyRadius * 0.2, centerY - bodyRadius * 0.3, 1.5, 0, 2 * Math.PI); context.fill();
  
      const snake = state.snake;
      const direction = state.direction;
      for (let i = 1; i < snake.length; i++) {
          const segment = snake[i];
          const segCenterX = segment.x * cellSize + cellSize / 2;
          const segCenterY = segment.y * cellSize + cellSize / 2;
          const radius = cellSize / 2.2;
          const gradient = context.createRadialGradient(segCenterX, segCenterY, 1, segCenterX, segCenterY, radius);
          gradient.addColorStop(0, '#39FF14');
          gradient.addColorStop(1, '#00C700');
          context.fillStyle = gradient;
          context.shadowColor = 'rgba(57, 255, 20, 0.5)';
          context.shadowBlur = 8;
          context.beginPath(); context.arc(segCenterX, segCenterY, radius, 0, 2 * Math.PI); context.fill();
      }
      const head = snake[0];
      const headCenterX = head.x * cellSize + cellSize / 2;
      const headCenterY = head.y * cellSize + cellSize / 2;
      const headRadius = cellSize / 2;
      const headGradient = context.createRadialGradient(headCenterX, headCenterY, 2, headCenterX, headCenterY, headRadius);
      headGradient.addColorStop(0, '#5CFF4D');
      headGradient.addColorStop(1, '#00C700');
      context.fillStyle = headGradient;
      context.shadowColor = 'rgba(57, 255, 20, 0.7)';
      context.shadowBlur = 15;
      context.beginPath(); context.arc(headCenterX, headCenterY, headRadius, 0, 2 * Math.PI); context.fill();
      context.shadowBlur = 0;
      context.fillStyle = 'white';
      const eyeRadius = cellSize * 0.1;
      let eye1X, eye1Y, eye2X, eye2Y;
      const eyeOffset = cellSize * 0.2;
      switch (direction) {
          case 'UP': eye1X = headCenterX - eyeOffset; eye1Y = headCenterY - eyeOffset; eye2X = headCenterX + eyeOffset; eye2Y = headCenterY - eyeOffset; break;
          case 'DOWN': eye1X = headCenterX - eyeOffset; eye1Y = headCenterY + eyeOffset; eye2X = headCenterX + eyeOffset; eye2Y = headCenterY + eyeOffset; break;
          case 'LEFT': eye1X = headCenterX - eyeOffset; eye1Y = headCenterY - eyeOffset; eye2X = headCenterX - eyeOffset; eye2Y = headCenterY + eyeOffset; break;
          case 'RIGHT': eye1X = headCenterX + eyeOffset; eye1Y = headCenterY - eyeOffset; eye2X = headCenterX + eyeOffset; eye2Y = headCenterY + eyeOffset; break;
      }
      context.beginPath(); context.arc(eye1X, eye1Y, eyeRadius, 0, 2 * Math.PI); context.fill();
      context.beginPath(); context.arc(eye2X, eye2Y, eyeRadius, 0, 2 * Math.PI); context.fill();
      context.fillStyle = 'black';
      const pupilRadius = eyeRadius * 0.5;
      context.beginPath(); context.arc(eye1X, eye1Y, pupilRadius, 0, 2 * Math.PI); context.fill();
      context.beginPath(); context.arc(eye2X, eye2Y, pupilRadius, 0, 2 * Math.PI); context.fill();
    };

    const resizeCanvas = () => {
      const size = getCanvasSize();
      canvas.width = size;
      canvas.height = size;
      draw(gameState);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const gameLoop = (time: number) => {
        if (gameState.status === 'RUNNING') {
          const timeSinceLastUpdate = time - lastUpdateRef;
          if (timeSinceLastUpdate > gameState.speed) {
            lastUpdateRef = time;
            updateGame();
          }
        }
        draw(gameState);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState.status === 'RUNNING') {
        lastUpdateRef = performance.now();
        if (!gameLoopRef.current) {
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
    }
    
    // Always draw the current state, even when paused or game over
    draw(gameState);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, getCanvasSize, gameOver, updateGame, obstacles, settings.hasObstacles]);

  return (
    <Card className={cn(
        "w-full max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-card/50 border-primary/20 p-2",
        isFullScreen && "w-auto h-auto bg-transparent border-none"
    )}>
      <CardContent className="p-0">
        <div className={cn("flex justify-between items-center p-2 text-lg", isFullScreen && "hidden")}>
          <div>Score: <span className="text-primary font-bold">{gameState.score}</span></div>
          <div>Level: <span className="text-primary font-bold">{gameState.level}</span></div>
        </div>
        <div className="relative aspect-square w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain rounded-md touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => touchStartRef.current = null}
          />
          {(gameState.status !== 'RUNNING') && (
            <div 
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center rounded-md p-4 cursor-pointer"
              onClick={handleOverlayClick}
            >
                {gameState.status === 'IDLE' && (
                    <>
                        <h2 className="text-4xl font-bold text-primary capitalize">{difficulty} Mode</h2>
                        <p className="mt-4 text-xl animate-flash">Tap or Press Enter to Start</p>
                        <div className="mt-8 text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div>
                                <p className='font-bold text-primary'>Controls:</p>
                                <p>Arrow Keys to Move</p>
                                <p>Spacebar to Pause</p>
                                <p>'F' for Fullscreen</p>
                            </div>
                             <div>
                                <p className='font-bold text-primary'>Mobile:</p>
                                <p>Swipe to Move</p>
                                <p>Use Pause Button</p>
                            </div>
                        </div>
                    </>
                )}
                {gameState.status === 'PAUSED' && ( <> <h2 className="text-4xl font-bold">Paused</h2> <p className="mt-4 text-xl animate-flash">Tap to Resume</p> </> )}
                {gameState.status === 'GAME_OVER' && (
                    <>
                        <h2 className="text-4xl font-bold text-destructive">Game Over</h2>
                        <p className="mt-2 text-2xl">Final Score: {gameState.score}</p>
                        <div className="flex gap-4 mt-6">
                            <Button onClick={startGame}>Restart</Button>
                            <Button variant="outline" onClick={onExit}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                        </div>
                    </>
                )}
            </div>
          )}
          <div className='absolute top-1 right-1 z-20'>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}>
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          </div>

          { (gameState.status === 'RUNNING' || gameState.status === 'PAUSED') &&
            <div className='absolute bottom-1 right-1 z-20 lg:hidden'>
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={(e) => { e.stopPropagation(); togglePause(); }}>
                  {gameState.status === 'PAUSED' ? <Play size={20} /> : <Pause size={20} />}
              </Button>
            </div>
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default SnakeGame;

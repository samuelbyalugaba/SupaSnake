
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Maximize, Minimize, Pause, Play, ArrowLeft, Award, Gem, Gauge, ChevronUp } from 'lucide-react';
import { GRID_SIZE, SCORE_INCREMENT } from '@/lib/constants';
import type { Point, Difficulty, GameStatus } from '@/lib/types';
import { useSounds } from '@/hooks/use-sounds';
import { cn } from '@/lib/utils';
import { INITIAL_SNAKE_POSITION, INITIAL_DIRECTION } from '@/lib/constants';
import { useAchievements } from '@/context/AchievementContext';
import { useStats } from '@/hooks/use-stats';
import { useUser } from '@/firebase';
import { useCosmetics } from '@/context/CosmeticsContext';
import { ALL_COSMETICS } from '@/lib/cosmetics';

const DIFFICULTY_SETTINGS = {
  easy: { speed: 200, foodMoves: false, hasObstacles: false, speedIncrement: 0.95, foodPerLevel: 5, maxLevel: 5 },
  medium: { speed: 150, foodMoves: true, hasObstacles: false, speedIncrement: 0.9, foodPerLevel: 4, maxLevel: 10 },
  hard: { speed: 100, foodMoves: true, hasObstacles: true, speedIncrement: 0.9, foodPerLevel: 3, maxLevel: 15 },
};

const OBSTACLE_WALL_COUNT = 4;
const MIN_WALL_LENGTH = 4;
const MAX_WALL_LENGTH = 7;
const FOOD_MOVE_INTERVAL = 250; // Rat moves at a fixed interval

interface SnakeGameProps {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  difficulty: Difficulty;
  onExit: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ isFullScreen, toggleFullScreen, difficulty, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartRef = useRef<Point | null>(null);
  const animationFrameId = useRef<number>(0);
  const lastUpdateTime = useRef(0);
  const lastFoodMoveTime = useRef(0);
  
  const { user } = useUser();
  const { updateStatsAndAchievements } = useStats();
  const { updateAchievementProgress, getAchievementsToSync, achievements, clearAchievementsToSync } = useAchievements();
  const { equippedCosmetic, unlockCosmetic } = useCosmetics();
  const { playSound } = useSounds();
  const settings = DIFFICULTY_SETTINGS[difficulty];
  
  const cosmeticStyle = useMemo(() => {
    return ALL_COSMETICS.find(c => c.id === equippedCosmetic)!.style;
  }, [equippedCosmetic]);


  // Refs for achievement tracking
  const gameStartTimeRef = useRef<number | null>(null);
  const foodEatenThisGameRef = useRef<number>(0);
  const lastFoodTimeRef = useRef<number | null>(null);
  const fastFoodCounterRef = useRef<number>(0);
  const noWallHitTimeRef = useRef<number | null>(null);
  const foodSpawnTimeRef = useRef<number | null>(null);
  const stationaryFoodTimeRef = useRef<number | null>(null);
  const noLeftTurnRef = useRef<boolean>(true);
  const noRightTurnRef = useRef<boolean>(true);
  const noUpTurnRef = useRef<boolean>(true);
  const noDownTurnRef = useRef<boolean>(true);


  const obstacles = useMemo(() => {
    if (!settings.hasObstacles) return [];
    
    const newObstacles: Point[] = [];
    let attempts = 0;

    while (newObstacles.length < OBSTACLE_WALL_COUNT * MIN_WALL_LENGTH && attempts < 100) {
      attempts++;
      const wallLength = Math.floor(Math.random() * (MAX_WALL_LENGTH - MIN_WALL_LENGTH + 1)) + MIN_WALL_LENGTH;
      const isHorizontal = Math.random() > 0.5;
      
      const startX = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? wallLength : 1)));
      const startY = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? 1 : wallLength)));
      
      const wallSegment: Point[] = [];
      let possible = true;

      for (let i = 0; i < wallLength; i++) {
        const point = isHorizontal ? { x: startX + i, y: startY } : { x: startX, y: startY + i };
        
        const isNearCenter = Math.abs(point.x - GRID_SIZE / 2) < 5 && Math.abs(point.y - GRID_SIZE / 2) < 5;
        if (isNearCenter || newObstacles.some(o => o.x === point.x && o.y === point.y)) {
          possible = false;
          break;
        }
        wallSegment.push(point);
      }
      
      if (possible) {
        newObstacles.push(...wallSegment);
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
    foodSpawnTimeRef.current = Date.now();
    stationaryFoodTimeRef.current = Date.now();
    return foodPosition;
  }, [obstacles]);
  
  const createInitialState = useCallback(() => {
    const initialSnake = [...INITIAL_SNAKE_POSITION];
    return {
      snake: initialSnake,
      food: generateFood(initialSnake),
      direction: INITIAL_DIRECTION,
      foodDirection: 'RIGHT' as const,
      speed: settings.speed,
      nextDirection: INITIAL_DIRECTION,
    };
  }, [generateFood, settings.speed]);

  const gameLogicState = useRef(createInitialState());
  const [displayState, setDisplayState] = useState({
    score: 0,
    level: 1,
    status: 'IDLE' as GameStatus,
    neonBitsEarned: 0,
    speedMultiplier: 1.0
  });

  const gameOverTriggered = useRef(false);
  
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.error("Haptic feedback failed:", error);
      }
    }
  };

  const handleGameOver = useCallback(async (deathReason: 'wall' | 'self' | 'obstacle') => {
    if (gameOverTriggered.current) return;
    gameOverTriggered.current = true;
    
    // Give auth state a moment to settle before writing.
    await new Promise(resolve => setTimeout(resolve, 50));

    vibrate(200);
    playSound('gameOver');
    
    setDisplayState(prev => ({ ...prev, status: 'GAME_OVER' }));
    
    // Pass single-run stats to be processed
    const survivalTime = (Date.now() - (gameStartTimeRef.current ?? Date.now())) / 1000;
    updateAchievementProgress('snake-architect', survivalTime);
    updateAchievementProgress('marathon-runner', survivalTime);
    
    if (deathReason === 'wall') updateAchievementProgress('first-death-by-wall', 1, true);
    if (deathReason === 'self') updateAchievementProgress('first-death-by-self', 1, true);
    if (deathReason === 'obstacle') updateAchievementProgress('first-death-by-obstacle', 1, true);

    // Update stats and sync all pending achievements
    if (user) {
        const achievementsToSync = getAchievementsToSync();
        await updateStatsAndAchievements({ 
            score: displayState.score, 
            foodEaten: foodEatenThisGameRef.current,
            achievementsToSync
        });
    }

    // Check for achievement-based cosmetic unlocks after stats have been synced
    const unlockedAchievements = achievements.filter(ach => ach.isUnlocked);
    for (const cosmetic of ALL_COSMETICS) {
        if (cosmetic.achievementId && unlockedAchievements.some(ach => ach.id === cosmetic.achievementId)) {
            await unlockCosmetic(cosmetic.id);
        }
    }

  }, [playSound, updateAchievementProgress, user, updateStatsAndAchievements, getAchievementsToSync, displayState.score, achievements, unlockCosmetic]);


  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const state = gameLogicState.current;
    const canvasSize = context.canvas.width;
    const cellSize = canvasSize / GRID_SIZE;

    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvasSize, canvasSize);

    if (settings.hasObstacles) {
      context.fillStyle = '#444';
      context.shadowColor = '#222';
      context.shadowBlur = 10;
      obstacles.forEach(o => context.fillRect(o.x * cellSize, o.y * cellSize, cellSize, cellSize));
      context.shadowColor = 'transparent';
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
    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        const segCenterX = segment.x * cellSize + cellSize / 2;
        const segCenterY = segment.y * cellSize + cellSize / 2;
        const radius = cellSize / 2.2;
        const gradient = context.createRadialGradient(segCenterX, segCenterY, 1, segCenterX, segCenterY, radius);
        gradient.addColorStop(0, cosmeticStyle.bodyGradient.from);
        gradient.addColorStop(1, cosmeticStyle.bodyGradient.to);
        context.fillStyle = gradient;
        context.shadowColor = cosmeticStyle.shadow;
        context.shadowBlur = 8;
        context.beginPath(); context.arc(segCenterX, segCenterY, radius, 0, 2 * Math.PI); context.fill();
    }
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;

    const head = snake[0];
    const headCenterX = head.x * cellSize + cellSize / 2;
    const headCenterY = head.y * cellSize + cellSize / 2;
    const headRadius = cellSize / 2;
    const headGradient = context.createRadialGradient(headCenterX, headCenterY, 2, headCenterX, headCenterY, headRadius);
    headGradient.addColorStop(0, cosmeticStyle.headGradient.from);
    headGradient.addColorStop(1, cosmeticStyle.headGradient.to);
    context.fillStyle = headGradient;
    context.shadowColor = cosmeticStyle.shadow;
    context.shadowBlur = 15;
    context.beginPath(); context.arc(headCenterX, headCenterY, headRadius, 0, 2 * Math.PI); context.fill();
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    
    // Draw eyes based on current direction
    const direction = state.direction;
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

  }, [settings.hasObstacles, obstacles, cosmeticStyle]);

  const moveFood = useCallback(() => {
    if (displayState.status !== 'RUNNING' || !settings.foodMoves) return;
    const state = gameLogicState.current;

    const validMoves: ( 'UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(dir => {
        let { x, y } = state.food;
        if (dir === 'UP') y--; else if (dir === 'DOWN') y++;
        else if (dir === 'LEFT') x--; else if (dir === 'RIGHT') x++;
        return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && !obstacles.some(o => o.x === x && o.y === y);
    }) as any;
    
    if (validMoves.length > 0) {
        if (!validMoves.includes(state.foodDirection)) {
            state.foodDirection = validMoves[Math.floor(Math.random() * validMoves.length)];
        }
        const newFood = { ...state.food };
        switch (state.foodDirection) {
            case 'UP': newFood.y = Math.max(0, newFood.y - 1); break;
            case 'DOWN': newFood.y = Math.min(GRID_SIZE - 1, newFood.y + 1); break;
            case 'LEFT': newFood.x = Math.max(0, newFood.x - 1); break;
            case 'RIGHT': newFood.x = Math.min(GRID_SIZE - 1, newFood.x + 1); break;
        }
        if (!state.snake.some(s => s.x === newFood.x && s.y === newFood.y)) {
           state.food = newFood;
           stationaryFoodTimeRef.current = Date.now();
        }
    }
  }, [displayState.status, settings.foodMoves, obstacles]);

  const updateGame = useCallback(() => {
    if (gameOverTriggered.current) return;
    const state = gameLogicState.current;
    
    state.direction = state.nextDirection;
    let head = { ...state.snake[0] };

    // Achievement checks that run every tick
    const noWallHitTime = noWallHitTimeRef.current ? (Date.now() - noWallHitTimeRef.current) / 1000 : 0;
    updateAchievementProgress('no-bumps-allowed', noWallHitTime);

    if (stationaryFoodTimeRef.current) {
        const timeSinceFoodStationary = (Date.now() - stationaryFoodTimeRef.current) / 1000;
        updateAchievementProgress('ghost-mode', timeSinceFoodStationary);
        if (difficulty === 'easy') {
            updateAchievementProgress('pacifist-30s', timeSinceFoodStationary);
        }
    }


    switch (state.direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y -= -1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x -= -1; break;
    }

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      noWallHitTimeRef.current = null; // Reset on wall hit
      handleGameOver('wall');
      return;
    }
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) {
      handleGameOver('obstacle');
      return;
    }
    for (let i = 1; i < state.snake.length; i++) {
        if (state.snake[i].x === head.x && state.snake[i].y === head.y) {
            handleGameOver('self');
            return;
        }
    }

    state.snake.unshift(head);
    let ateFood = false;

    if (head.x === state.food.x && head.y === state.food.y) {
      vibrate(50);
      playSound('eat');
      ateFood = true;

      // Handle timing-based achievements
      if (foodSpawnTimeRef.current) {
        const timeToEat = (Date.now() - foodSpawnTimeRef.current) / 1000;
        if (timeToEat <= 2 && (difficulty === 'medium' || difficulty === 'hard')) {
            updateAchievementProgress('clean-sweep', 1, true);
        }
      }
      
      const now = Date.now();
      if (lastFoodTimeRef.current && now - lastFoodTimeRef.current < 3000) { // rat-trick is 3 in 3 sec
        fastFoodCounterRef.current += 1;
      } else {
        fastFoodCounterRef.current = 1;
      }
      lastFoodTimeRef.current = now;
      updateAchievementProgress('rat-trick', fastFoodCounterRef.current);

      state.food = generateFood(state.snake);
    } else {
      state.snake.pop();
    }
    
    // Update achievements that are checked on every game tick
    const snakeLength = state.snake.length;
    updateAchievementProgress('double-digits', snakeLength);
    updateAchievementProgress('long-snake', snakeLength);
    updateAchievementProgress('very-long-snake', snakeLength);
    updateAchievementProgress('mega-snake', snakeLength);
    updateAchievementProgress('ultra-snake', snakeLength);
    
    const currentScore = displayState.score;
    if (noRightTurnRef.current) updateAchievementProgress('ultra-instinct', currentScore);
    if (noLeftTurnRef.current) updateAchievementProgress('no-left-turn', currentScore);
    if (noDownTurnRef.current) updateAchievementProgress('no-down-turn', currentScore);

    // Check for "Serpent Surgeon"
    const isOneTileGap = (p1: Point, p2: Point) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) === 2;
    for(let i = 2; i < state.snake.length; i++) {
        if(isOneTileGap(head, state.snake[i])) {
            updateAchievementProgress('serpent-surgeon', 1, true);
            break;
        }
    }
    
    if (ateFood) {
        foodEatenThisGameRef.current += 1;
        updateAchievementProgress('first-bite', 1, true);
        updateAchievementProgress('eat-50', 1, true);
        updateAchievementProgress('eat-250', 1, true);
        updateAchievementProgress('eat-1000', 1, true);

        setDisplayState(prev => {
            const oldScore = prev.score;
            const newScore = oldScore + SCORE_INCREMENT;
            const newLevel = Math.floor(newScore / 50) + 1;
            const neonBitsEarned = Math.floor(newScore / 5);

            const oldSpeedMilestone = Math.floor(oldScore / 25);
            const newSpeedMilestone = Math.floor(newScore / 25);
            let speedMultiplier = prev.speedMultiplier;

            if (newSpeedMilestone > oldSpeedMilestone) {
                gameLogicState.current.speed *= settings.speedIncrement;
                updateAchievementProgress('sweaty-gamer-mode', newSpeedMilestone);
                updateAchievementProgress('speed-tier-3', newSpeedMilestone);
                updateAchievementProgress('speed-tier-4', newSpeedMilestone);
                speedMultiplier = parseFloat((prev.speedMultiplier + 0.1).toFixed(1));
            }
            
            // Update score-based achievements
            updateAchievementProgress('score-100', newScore);
            updateAchievementProgress('score-200', newScore);
            updateAchievementProgress('score-300', newScore);
            updateAchievementProgress('score-400', newScore);
            updateAchievementProgress('score-500', newScore);
            updateAchievementProgress('score-750', newScore);
            updateAchievementProgress('score-1000', newScore);

            if (difficulty === 'easy') {
                updateAchievementProgress('easy-victory', newScore);
                updateAchievementProgress('easy-mastery', newScore);
            }
            if (difficulty === 'medium') {
                updateAchievementProgress('medium-master', newScore);
                updateAchievementProgress('medium-legend', newScore);
            }
            if (difficulty === 'hard') {
                updateAchievementProgress('hard-legend', newScore);
                updateAchievementProgress('hard-god', newScore);
                updateAchievementProgress('obstacle-pro', newScore);
                updateAchievementProgress('perfect-game-hard', newScore);
            }
            
            return { ...prev, score: newScore, level: newLevel, neonBitsEarned, speedMultiplier };
        });
    }
  }, [playSound, generateFood, settings, obstacles, handleGameOver, updateAchievementProgress, difficulty, displayState.score]);
  
  useEffect(() => {
    draw();
  }, [draw, displayState.score, obstacles, cosmeticStyle]);

  // Main game loop using requestAnimationFrame
  useEffect(() => {
    
    const gameLoop = (timestamp: number) => {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        
        if (displayState.status !== 'RUNNING') {
            return;
        }

        if (timestamp - lastUpdateTime.current > gameLogicState.current.speed) {
            lastUpdateTime.current = timestamp;
            updateGame();
            draw();
        }

        if (settings.foodMoves && timestamp - lastFoodMoveTime.current > FOOD_MOVE_INTERVAL) {
            lastFoodMoveTime.current = timestamp;
            moveFood();
        }
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
        cancelAnimationFrame(animationFrameId.current);
    };
}, [displayState.status, draw, updateGame, moveFood, settings.foodMoves]);


  const startGame = useCallback(() => {
    clearAchievementsToSync();
    // Reset achievement states for a new game
    gameStartTimeRef.current = Date.now();
    noWallHitTimeRef.current = Date.now();
    foodEatenThisGameRef.current = 0;
    lastFoodTimeRef.current = null;
    fastFoodCounterRef.current = 0;
    noLeftTurnRef.current = true;
    noRightTurnRef.current = true;
    noUpTurnRef.current = true;
    noDownTurnRef.current = true;

    gameOverTriggered.current = false;
    lastUpdateTime.current = performance.now();
    lastFoodMoveTime.current = performance.now();

    setDisplayState(prev => ({ ...prev, status: 'RUNNING' }));
    
    // These are cumulative, so we add 1 each time. The context will handle summing them.
    updateAchievementProgress('first-game', 1, true);
    updateAchievementProgress('play-10', 1, true);
    updateAchievementProgress('play-50', 1, true);
    updateAchievementProgress('play-100', 1, true);
    updateAchievementProgress('play-250', 1, true);
    updateAchievementProgress('play-500', 1, true);

    const now = new Date();
    if (now.getHours() >= 0 && now.getHours() < 3) {
      updateAchievementProgress('play-at-midnight', 1, true);
    }
    if (now.getDay() === 0 || now.getDay() === 6) {
      updateAchievementProgress('play-on-weekend', 1, true);
    }
  }, [updateAchievementProgress, clearAchievementsToSync]);

  const togglePause = useCallback(() => {
    setDisplayState(prev => {
      const newStatus = prev.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
      if (newStatus === 'RUNNING') {
        // Correct the timer when resuming
        lastUpdateTime.current = performance.now();
        lastFoodMoveTime.current = performance.now();
      }
      return { ...prev, status: newStatus };
    });
  }, []);

  const restartGame = useCallback(() => {
    gameOverTriggered.current = false;
    gameLogicState.current = createInitialState();
    setDisplayState({
      score: 0,
      level: 1,
      status: 'IDLE', // Go to IDLE state to show the start screen again
      neonBitsEarned: 0,
      speedMultiplier: 1.0,
    });
    // We call startGame from the overlay click, which will track played games
  }, [createInitialState]);


  const handleDirectionChange = useCallback((newDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const state = gameLogicState.current;
    if (displayState.status !== 'RUNNING') return;

    if (newDirection === 'LEFT') noLeftTurnRef.current = false;
    if (newDirection === 'RIGHT') noRightTurnRef.current = false;
    if (newDirection === 'UP') noUpTurnRef.current = false;
    if (newDirection === 'DOWN') noDownTurnRef.current = false;

    const { direction } = state;
    if (
        (direction === 'UP' && newDirection === 'DOWN') ||
        (direction === 'DOWN' && newDirection === 'UP') ||
        (direction === 'LEFT' && newDirection === 'RIGHT') ||
        (direction === 'RIGHT' && newDirection === 'LEFT')
    ) {
        return;
    }
    vibrate(20);
    state.nextDirection = newDirection;
  }, [displayState.status]);

  const getCanvasSize = useCallback(() => {
    if (typeof window === 'undefined') return 600;
    if (isFullScreen) {
      return Math.min(window.innerWidth, window.innerHeight) * 0.9;
    }
    return 600;
  }, [isFullScreen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const size = getCanvasSize();
      canvas.width = size;
      canvas.height = size;
      draw(); 
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [getCanvasSize, draw]);
  
  const handleToggleFullScreen = () => {
    toggleFullScreen();
    if (!isFullScreen) {
        updateAchievementProgress('full-screen', 1, true);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && ['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

      const currentStatus = displayState.status;
      if (e.code === 'Space') {
          e.preventDefault();
          if (currentStatus === 'RUNNING' || currentStatus === 'PAUSED') {
            togglePause();
          }
      } else if (e.key === 'Enter') {
          e.preventDefault();
          if (currentStatus === 'IDLE') startGame();
          else if (currentStatus === 'GAME_OVER') restartGame();
          else if (currentStatus === 'PAUSED') togglePause();
      } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          handleToggleFullScreen();
      } else {
        let newDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
        if (e.key === 'ArrowUp' || e.key === 'w') newDirection = 'UP';
        else if (e.key === 'ArrowDown' || e.key === 's') newDirection = 'DOWN';
        else if (e.key === 'ArrowLeft' || e.key === 'a') newDirection = 'LEFT';
        else if (e.key === 'ArrowRight' || e.key === 'd') newDirection = 'RIGHT';

        if (newDirection) {
            e.preventDefault();
            if (displayState.status === 'IDLE') startGame();
            handleDirectionChange(newDirection);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayState.status, togglePause, startGame, restartGame, handleDirectionChange, handleToggleFullScreen]);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (displayState.status === 'IDLE') {
        startGame();
        return;
    }
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
    if (displayState.status === 'IDLE') startGame();
    else if (displayState.status === 'PAUSED') togglePause();
    else if (displayState.status === 'GAME_OVER') restartGame();
  };

  return (
    <Card className="w-full max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-card/50 border-primary/20 p-2">
      <CardContent className="p-0">
        <div className="flex justify-around items-center p-2 text-sm sm:text-base">
          <div className="flex items-center gap-1.5" title="Score">
              <Award className="w-4 h-4 text-primary" />
              <span className="font-bold">{displayState.score}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Neon Bits Earned">
              <Gem className="w-4 h-4 text-primary" />
              <span className="font-bold">{displayState.neonBitsEarned}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Speed Multiplier">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="font-bold">{displayState.speedMultiplier.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-1.5" title="Level">
              <ChevronUp className="w-4 h-4 text-primary" />
              <span className="font-bold">{displayState.level}</span>
          </div>
        </div>
        <div className="relative aspect-square w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain rounded-md touch-none border-2 border-primary/30"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => touchStartRef.current = null}
          />
          {(displayState.status !== 'RUNNING') && (
            <div
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center rounded-md p-4 cursor-pointer"
              onClick={handleOverlayClick}
            >
                {displayState.status === 'IDLE' && (
                    <>
                        <h2 className="text-4xl font-bold text-primary capitalize">{difficulty} Mode</h2>
                        <p className="mt-4 text-xl animate-flash">Tap or Press Enter to Start</p>
                        <div className="mt-8 text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div>
                                <p className='font-bold text-primary'>Controls:</p>
                                <p>Arrow Keys / WASD</p>
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
                {displayState.status === 'PAUSED' && ( <> <h2 className="text-4xl font-bold">Paused</h2> <p className="mt-4 text-xl animate-flash">Tap to Resume</p> </> )}
                {displayState.status === 'GAME_OVER' && (
                    <>
                        <h2 className="text-4xl font-bold text-destructive">Game Over</h2>
                        <p className="mt-2 text-2xl">Final Score: {displayState.score}</p>
                        <div className="flex gap-4 mt-6">
                            <Button onClick={(e) => { e.stopPropagation(); restartGame(); }}>Restart</Button>
                            <Button variant="outline" onClick={(e) => { e.stopPropagation(); onExit(); }}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                        </div>
                    </>
                )}
            </div>
          )}
          <div className='absolute top-1 right-1 z-20'>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={handleToggleFullScreen}>
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          </div>

          { (displayState.status === 'RUNNING' || displayState.status === 'PAUSED') &&
            <div className='absolute bottom-1 right-1 z-20 lg:hidden'>
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={togglePause}>
                  {displayState.status === 'PAUSED' ? <Play size={20} /> : <Pause size={20} />}
              </Button>
            </div>
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default SnakeGame;

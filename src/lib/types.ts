
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Point = { x: number; y: number };
export type GameStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'GAME_OVER';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameState = {
  snake: Point[];
  food: Point;
  foodDirection: Direction;
  direction: Direction;
  speed: number;
  score: number;
  level: number;
  foodEatenThisLevel: number;
  status: GameStatus;
};

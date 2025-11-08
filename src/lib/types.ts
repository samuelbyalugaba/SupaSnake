export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Point = { x: number; y: number };
export type GameStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'GAME_OVER';

export type HighScore = {
  id?: string;
  userId: string;
  username: string;
  score: number;
  timestamp: any; // Firestore Timestamp
};

export type GameState = {
  snake: Point[];
  food: Point;
  direction: Direction;
  speed: number;
  score: number;
  level: number;
  foodEatenThisLevel: number;
  status: GameStatus;
};

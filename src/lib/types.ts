
import { Timestamp } from "firebase/firestore";
import type { LucideIcon } from 'lucide-react';

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
  status: GameStatus;
};

export type Message = {
    id?: string;
    text: string;
    userId: string;
    username: string;
    timestamp: Timestamp;
}

export type AchievementCategory = 'Core' | 'Grind' | 'Score' | 'Length' | 'Difficulty' | 'Skill' | 'Endurance' | 'Meta' | 'Ultimate';
export type AchievementType = 'max' | 'cumulative';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof import('lucide-react');
  category: AchievementCategory;
  isSecret?: boolean;
  target: number; // The value needed to unlock the achievement
  type: AchievementType; // How progress is tracked
};

export type UserAchievement = {
  id: string; // Corresponds to Achievement id
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: Timestamp;
};

// This is the combined type we'll use in the UI
export type AchievementWithProgress = Achievement & UserAchievement;

export type UserStats = {
    highScore: number;
    gamesPlayed: number;
    totalScore: number;
    neonBits: number;
    equippedCosmetic: string;
    nestId: string | null;
    leaguePoints: number;
    lastSeasonClaimed?: string; // e.g., "2024-10"
};

export type leaguePlayer = {
    userId: string;
    username: string;
    leaguePoints: number;
    equippedCosmetic: string;
    nestId?: string | null;
};

export type CosmeticRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Seasonal';

export type Cosmetic = {
    id: string;
    name: string;
    description: string;
    rarity: CosmeticRarity;
    cost: number; // 0 for achievement-based unlocks
    achievementId?: string; // ID of the achievement that unlocks this cosmetic
    style: {
        headGradient: { from: string; to: string; };
        bodyGradient: { from: string; to: string; };
        shadow: string;
    };
};

export type UserCosmetic = {
    id: string;
    unlockedAt: Timestamp;
};

export type Nest = {
    id: string;
    name: string;
    motto: string;
    emblemId: string;
    isPublic: boolean;
    ownerId: string;
    memberCount: number;
    totalScore: number;
};

export type NestMemberRole = 'admin' | 'moderator' | 'member';

export type NestMember = {
    id: string; // The doc ID is the userId
    userId: string;
    username: string;
    role: NestMemberRole;
    joinedAt: Timestamp;
    leaguePoints: number;
};

export type CreateNestRequest = {
    name: string;
    motto: string;
    isPublic: boolean;
    emblemId: string;
};

export type UpdateNestRequest = {
    motto: string;
    isPublic: boolean;
    emblemId: string;
};

export type NestJoinRequest = {
    id?: string;
    nestId: string;
    userId: string;
    username: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Timestamp;
};

export type Conversation = {
    id: string; // docId is the other user's UID
    userId: string;
    username: string;
    lastMessageAt: Timestamp;
};

export type FriendRequest = {
    id: string; // The doc ID is the requesting user's UID
    requestingUserId: string;
    requestingUsername: string;
    status: 'pending';
    createdAt: Timestamp;
};

export type Friend = {
    id: string; // The doc ID is the friend's UID
    userId: string;
    username: string;
    since: Timestamp;
};


'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, getDocs, Timestamp, increment } from 'firebase/firestore';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import type { UserAchievement, AchievementWithProgress } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Trophy } from 'lucide-react';

interface AchievementContextType {
  achievements: AchievementWithProgress[];
  updateAchievementProgress: (id: string, value: number, additive?: boolean) => void;
  getAchievementsToSync: () => Map<string, { value: number; type: 'max' | 'cumulative' }>;
  clearAchievementsToSync: () => void;
  syncAchievements: (batch: ReturnType<typeof writeBatch>, achievementsToSync: Map<string, { value: number; type: 'max' | 'cumulative' }>) => Promise<void>;
  resetAchievements: () => Promise<void>;
  isLoading: boolean;
  refetchAchievements: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const userAchievementsRef = useMemo(
    () => (user ? collection(db, `users/${user.uid}/achievements`) : null),
    [user, db]
  );
  
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const achievementsToSync = useRef<Map<string, { value: number; type: 'max' | 'cumulative' }>>(new Map());

  const refetchAchievements = useCallback(() => {
    if (!userAchievementsRef) return;
    getDocs(userAchievementsRef).then(snapshot => {
      const data = snapshot.docs.map(doc => ({...doc.data(), id: doc.id} as UserAchievement));
      setUserAchievements(data);
    });
  }, [userAchievementsRef]);

  // Fetch initial data
  useEffect(() => {
    if (!userAchievementsRef) {
      setIsLoading(false);
      setUserAchievements([]);
      return;
    }
    setIsLoading(true);
    getDocs(userAchievementsRef).then(snapshot => {
      const data = snapshot.docs.map(doc => ({...doc.data(), id: doc.id} as UserAchievement));
      setUserAchievements(data);
    }).finally(() => setIsLoading(false));
  }, [userAchievementsRef]);

  const combinedAchievements = useMemo(() => {
    return ALL_ACHIEVEMENTS.map(staticAch => {
      const userProgress = userAchievements.find(ua => ua.id === staticAch.id);
      return {
        ...staticAch,
        isUnlocked: userProgress?.isUnlocked || false,
        progress: userProgress?.progress || 0,
        unlockedAt: userProgress?.unlockedAt,
      };
    });
  }, [userAchievements]);


  const updateAchievementProgress = useCallback((id: string, value: number, additive = false) => {
    const achievement = combinedAchievements.find(a => a.id === id);
    if (!achievement || achievement.isUnlocked) {
      return;
    }

    const existingProgress = achievementsToSync.current.get(id);
    let newProgressValue;

    if (additive || achievement.type === 'cumulative') {
        newProgressValue = (existingProgress?.value || 0) + value;
    } else { // 'max'
        newProgressValue = Math.max(existingProgress?.value || 0, value);
    }
    
    // Only update if there's a change to sync
    if (newProgressValue !== existingProgress?.value) {
       achievementsToSync.current.set(id, { value: newProgressValue, type: achievement.type });
    }
  }, [combinedAchievements]);

  const getAchievementsToSync = useCallback(() => {
    return new Map(achievementsToSync.current);
  }, []);

  const clearAchievementsToSync = useCallback(() => {
    achievementsToSync.current.clear();
  }, []);

  const syncAchievements = useCallback(async (batch: ReturnType<typeof writeBatch>, achievementsToSyncMap: Map<string, { value: number; type: 'max' | 'cumulative' }>) => {
    if (!user || !db || achievementsToSyncMap.size === 0) return;

    const achievementsToUnlock: AchievementWithProgress[] = [];
    
    for (const [id, syncData] of achievementsToSyncMap.entries()) {
      const achievement = combinedAchievements.find(a => a.id === id);
      if (!achievement || achievement.isUnlocked) continue;

      const docRef = doc(db, `users/${user.uid}/achievements`, id);
      const currentProgress = achievement.progress || 0;
      let finalProgress;
      let updatePayload: any;

      if (syncData.type === 'cumulative') {
        finalProgress = currentProgress + syncData.value;
        updatePayload = { id, progress: increment(syncData.value) };
      } else { // 'max'
        finalProgress = Math.max(currentProgress, syncData.value);
        if (finalProgress > currentProgress) {
            updatePayload = { id, progress: finalProgress };
        }
      }
      
      if (!updatePayload) continue;

      if (finalProgress >= achievement.target) {
        updatePayload.isUnlocked = true;
        updatePayload.unlockedAt = serverTimestamp();
        achievementsToUnlock.push({ ...achievement, progress: finalProgress, isUnlocked: true });
      } else {
        updatePayload.isUnlocked = false;
      }
      
      batch.set(docRef, updatePayload, { merge: true });
    }

    setTimeout(() => {
        achievementsToUnlock.forEach(achievement => {
            toast({
                title: (
                    <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-400" />
                        <span className="font-bold">Achievement Unlocked!</span>
                    </div>
                ),
                description: achievement.name,
            });
        });
    }, 500); // Delay to allow firestore propagation

  }, [user, db, toast, combinedAchievements]);


  const resetAchievements = useCallback(async () => {
    if (!user || !db) return;
    
    const batch = writeBatch(db);
    const achievementsCollectionRef = collection(db, `users/${user.uid}/achievements`);
    
    ALL_ACHIEVEMENTS.forEach(ach => {
        const docRef = doc(achievementsCollectionRef, ach.id);
        batch.set(docRef, { id: ach.id, isUnlocked: false, progress: 0 });
    });
    
    await batch.commit();
    
    setUserAchievements([]);
    clearAchievementsToSync();

    toast({
      title: "Progress Reset",
      description: "Your achievement progress has been reset.",
    });

  }, [user, db, toast, clearAchievementsToSync]);


  return (
    <AchievementContext.Provider value={{ achievements: combinedAchievements, updateAchievementProgress, syncAchievements, resetAchievements, isLoading, getAchievementsToSync, clearAchievementsToSync, refetchAchievements }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};

    
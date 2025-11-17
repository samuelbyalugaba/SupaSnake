
'use client';

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, writeBatch, increment, setDoc } from 'firebase/firestore';
import type { UserStats } from '@/lib/types';
import { useAchievements } from '@/context/AchievementContext';

export const useStats = () => {
    const { user } = useUser();
    const db = useFirestore();
    const { syncAchievements, clearAchievementsToSync, refetchAchievements, achievements } = useAchievements();

    const statsRef = useMemo(
        () => (user ? doc(db, `users/${user.uid}/stats/summary`) : null),
        [user, db]
    );

    const { data: stats, isLoading } = useDoc<UserStats>(statsRef);
    
    const updateStatsAndAchievements = useCallback(async ({ score, foodEaten, achievementsToSync }: { score: number; foodEaten: number; achievementsToSync: Map<string, { value: number; type: 'max' | 'cumulative' }>}) => {
        if (!user) {
            console.error("Attempted to update stats for a null user.");
            clearAchievementsToSync();
            return;
        };

        if (!statsRef) return;
        
        try {
            const batch = writeBatch(db);
            const bitsEarned = Math.floor(score / 5);
            const leaguePointsGained = Math.floor(score / 10);
            
            const userStats = stats || { highScore: 0, gamesPlayed: 0, totalScore: 0, neonBits: 0, leaguePoints: 0, equippedCosmetic: 'default' };

            // Use set with merge:true to create the document if it doesn't exist, or update it if it does.
            batch.set(statsRef, {
                highScore: Math.max(score, userStats.highScore),
                gamesPlayed: increment(1),
                totalScore: increment(score),
                neonBits: increment(bitsEarned),
                leaguePoints: increment(leaguePointsGained),
            }, { merge: true });
            
            // Also update the public league-players document
            const leaguePlayerRef = doc(db, `league-players/${user.uid}`);
            
            // Use set with merge to handle creation for new players and updates for existing ones.
            batch.set(leaguePlayerRef, {
                leaguePoints: increment(leaguePointsGained),
                username: user.displayName,
                equippedCosmetic: userStats.equippedCosmetic
            }, { merge: true });


            // Sync achievements
            if (achievementsToSync.size > 0) {
                await syncAchievements(batch, achievementsToSync);
            }
            
            await batch.commit();
            
            clearAchievementsToSync();
            refetchAchievements();

        } catch (error) {
            console.error("Error updating stats and achievements:", error);
        }
    }, [statsRef, user, db, syncAchievements, clearAchievementsToSync, refetchAchievements, stats]);

    return { stats, isLoading, updateStatsAndAchievements };
};

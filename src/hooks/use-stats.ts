
'use client';

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, writeBatch, increment, setDoc, getDoc as getFirestoreDoc } from 'firebase/firestore';
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
    
    const updateStatsAndAchievements = useCallback(async ({ score, achievementsToSync }: { score: number; foodEaten: number; achievementsToSync: Map<string, { value: number; type: 'max' | 'cumulative' }>}) => {
        if (!statsRef || !user) return;
        
        try {
            const batch = writeBatch(db);
            const bitsEarned = Math.floor(score / 5);
            const leaguePointsGained = Math.floor(score / 10);
            const userStats = stats || { highScore: 0, gamesPlayed: 0, totalScore: 0, neonBits: 0, leaguePoints: 0 };

            // Add cumulative game stats to the sync map
            achievementsToSync.set('first-game', { value: 1, type: 'cumulative' });
            achievementsToSync.set('play-10', { value: 1, type: 'cumulative' });
            achievementsToSync.set('play-50', { value: 1, type: 'cumulative' });
            achievementsToSync.set('play-100', { value: 1, type: 'cumulative' });
            achievementsToSync.set('play-250', { value: 1, type: 'cumulative' });
            achievementsToSync.set('play-500', { value: 1, type: 'cumulative' });
            
            const deathCountAchievement = achievements.find(a => a.id === 'ten-deaths');
            if (deathCountAchievement && !deathCountAchievement.isUnlocked) {
                 achievementsToSync.set('ten-deaths', { value: 1, type: 'cumulative' });
                 achievementsToSync.set('hundred-deaths', { value: 1, type: 'cumulative' });
            }

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
            batch.update(leaguePlayerRef, {
                leaguePoints: increment(leaguePointsGained)
            });

            // Sync achievements
            if (achievementsToSync.size > 0) {
                await syncAchievements(batch, achievementsToSync);
            }
            
            await batch.commit();
            
            clearAchievementsToSync();
            refetchAchievements();

        } catch (error) {
            console.error("Error updating stats and achievements:", error);
             if (error instanceof Error && error.message.includes("No document to update")) {
                const leaguePlayerRef = doc(db, `league-players/${user.uid}`);
                const userStatsDoc = (await getFirestoreDoc(statsRef));
                const currentStats = userStatsDoc.data();
                await setDoc(leaguePlayerRef, {
                    userId: user.uid,
                    username: user.displayName,
                    leaguePoints: currentStats?.leaguePoints ?? 0,
                    equippedCosmetic: currentStats?.equippedCosmetic ?? 'default'
                });
             }
        }
    }, [statsRef, user, db, syncAchievements, clearAchievementsToSync, refetchAchievements, stats, achievements]);

    return { stats, isLoading, updateStatsAndAchievements };
};


'use client';

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
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
        if (!user || !db) return;
        if (!statsRef) return;
        
        const batch = writeBatch(db);
        const bitsEarned = Math.floor(score / 5);
        const leaguePointsGained = Math.floor(score / 5);
        
        const userStats = stats || { highScore: 0, gamesPlayed: 0, totalScore: 0, neonBits: 0, leaguePoints: 0, equippedCosmetic: 'default' };

        const statsUpdatePayload = {
            highScore: Math.max(score, userStats.highScore),
            gamesPlayed: increment(1),
            totalScore: increment(score),
            neonBits: increment(bitsEarned),
            leaguePoints: increment(leaguePointsGained),
        };
        batch.set(statsRef, statsUpdatePayload, { merge: true });
        
        const leaguePlayerRef = doc(db, `league-players/${user.uid}`);
        const leaguePlayerUpdatePayload = {
            leaguePoints: increment(leaguePointsGained),
            username: user.displayName,
            equippedCosmetic: userStats.equippedCosmetic
        };
        batch.set(leaguePlayerRef, leaguePlayerUpdatePayload, { merge: true });

        if (achievementsToSync.size > 0) {
            await syncAchievements(batch, achievementsToSync);
        }
        
        batch.commit()
            .then(() => {
                clearAchievementsToSync();
                refetchAchievements();
            })
            .catch((error) => {
                const permissionError = new FirestorePermissionError({
                    path: `users/${user.uid} (batched write)`,
                    operation: 'update',
                    requestResourceData: {
                        stats: statsUpdatePayload,
                        league: leaguePlayerUpdatePayload,
                        achievements: Object.fromEntries(achievementsToSync.entries())
                    }
                });
                errorEmitter.emit('permission-error', permissionError);
            });

    }, [statsRef, user, db, syncAchievements, clearAchievementsToSync, refetchAchievements, stats]);

    return { stats, isLoading, updateStatsAndAchievements };
};

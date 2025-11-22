
'use client';

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, writeBatch, increment, setDoc, updateDoc } from 'firebase/firestore';
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

    const { data: stats, isLoading, refetch: refetchStats } = useDoc<UserStats>(statsRef);
    
    const updateStatsAndAchievements = useCallback(async ({ score, foodEaten, achievementsToSync }: { score: number; foodEaten: number; achievementsToSync: Map<string, { value: number; type: 'max' | 'cumulative' }>}) => {
        if (!user || !db) return;
        if (!statsRef) return;
        
        const batch = writeBatch(db);
        const bitsEarned = Math.floor(score / 5);
        const leaguePointsGained = Math.floor(score / 50) * 10;
        
        const userStats = stats || { highScore: 0, gamesPlayed: 0, totalScore: 0, neonBits: 0, leaguePoints: 0, equippedCosmetic: 'default', nestId: null };

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
            // Use the actual equipped cosmetic from the stats, not a default
            equippedCosmetic: userStats.equippedCosmetic,
            nestId: userStats.nestId, // Keep nestId in sync
        };
        batch.set(leaguePlayerRef, leaguePlayerUpdatePayload, { merge: true });

        // If user is in a nest, update their leaguePoints there too
        if (userStats.nestId) {
            const nestMemberRef = doc(db, `nests/${userStats.nestId}/members`, user.uid);
            batch.update(nestMemberRef, { leaguePoints: increment(leaguePointsGained) });
        }


        if (achievementsToSync.size > 0) {
            await syncAchievements(batch, achievementsToSync);
        }
        
        batch.commit()
            .then(() => {
                clearAchievementsToSync();
                // Don't need to refetch; useDoc listeners will handle it
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

    }, [statsRef, user, db, syncAchievements, clearAchievementsToSync, stats]);

    const updateSeasonClaim = useCallback(async (seasonId: string, reward: number) => {
        if (!statsRef) return;
        
        const payload = {
            lastSeasonClaimed: seasonId,
            neonBits: increment(reward),
        };

        await updateDoc(statsRef, payload);
        // The useDoc hook will automatically update the stats state
        
    }, [statsRef]);

    return { stats, isLoading, updateStatsAndAchievements, updateSeasonClaim };
};


'use client';

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, writeBatch, increment, setDoc, updateDoc } from 'firebase/firestore';
import type { UserStats } from '@/lib/types';
import { useAchievements } from '@/context/AchievementContext';

export const useStats = () => {
    const { user } = useUser();
    const db = useFirestore();
    const { syncAchievements, clearAchievementsToSync, refetchAchievements } = useAchievements();

    const statsRef = useMemo(
        () => (user ? doc(db, `users/${user.uid}/stats/summary`) : null),
        [user, db]
    );

    const { data: stats, isLoading } = useDoc<UserStats>(statsRef);
    
    const updateStatsAndAchievements = useCallback(async ({ score, achievementsToSync }: { score: number; foodEaten: number; achievementsToSync: Map<string, number>}) => {
        if (!statsRef || !user) return;
        
        try {
            const batch = writeBatch(db);
            const bitsEarned = Math.floor(score / 5);
            // Award league points based on score
            const leaguePointsGained = Math.floor(score / 10);

            // Use set with merge:true to create the document if it doesn't exist, or update it if it does.
            // This prevents the "No document to update" error for new users.
            batch.set(statsRef, {
                highScore: Math.max(score, stats?.highScore ?? 0),
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
            
            // Clear pending achievements and refetch data for UI update.
            clearAchievementsToSync();
            refetchAchievements();

        } catch (error) {
            console.error("Error updating stats and achievements:", error);
            // If the transaction fails, especially on the public doc, we might need a recovery mechanism
            // For now, we just log the error.
             if (error instanceof Error && error.message.includes("No document to update")) {
                // This can happen if the league-players doc doesn't exist yet for some reason.
                // Let's try to create it.
                const leaguePlayerRef = doc(db, `league-players/${user.uid}`);
                const userStats = (await getDoc(statsRef)).data();
                await setDoc(leaguePlayerRef, {
                    userId: user.uid,
                    username: user.displayName,
                    leaguePoints: userStats?.leaguePoints ?? 0,
                    equippedCosmetic: userStats?.equippedCosmetic ?? 'default'
                });
             }
        }
    }, [statsRef, user, db, syncAchievements, clearAchievementsToSync, refetchAchievements, stats?.highScore]);
    
    const getDoc = async (ref: any) => {
        const doc = await ref.get();
        return doc;
    }


    return { stats, isLoading, updateStatsAndAchievements };
};

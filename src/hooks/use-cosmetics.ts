
'use client';

import { useMemo, useCallback, useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { UserCosmetic } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useStats } from './use-stats';
import { useAchievements } from '@/context/AchievementContext';
import { ALL_COSMETICS } from '@/lib/cosmetics';

export const useCosmetics = () => {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const { stats } = useStats();
    const { achievements } = useAchievements();
    const [isPurchasing, setIsPurchasing] = useState(false);

    const cosmeticsRef = useMemo(
        () => (user ? collection(db, `users/${user.uid}/cosmetics`) : null),
        [user, db]
    );

    const { data: unlockedCosmetics, isLoading: isCosmeticsLoading } = useCollection<UserCosmetic>(cosmeticsRef);
    const equippedCosmetic = useMemo(() => stats?.equippedCosmetic || 'default', [stats]);

    const isCosmeticUnlocked = useCallback((cosmeticId: string) => {
        if (!user) return false;
        const cosmetic = ALL_COSMETICS.find(c => c.id === cosmeticId);
        if (!cosmetic) return false;
        if (cosmetic.cost === 0 && !cosmetic.achievementId) return true; // Default skin
        
        // Check if unlocked by achievement
        if (cosmetic.achievementId) {
            const achievement = achievements.find(a => a.id === cosmetic.achievementId);
            if (achievement?.isUnlocked) return true;
        }

        // Check if purchased
        return unlockedCosmetics?.some(c => c.id === cosmeticId) || false;
    }, [unlockedCosmetics, achievements, user]);

    const equipCosmetic = useCallback(async (cosmeticId: string) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to equip cosmetics.' });
            return;
        }
        if (!isCosmeticUnlocked(cosmeticId)) {
            toast({ variant: 'destructive', title: 'Error', description: 'You have not unlocked this cosmetic.' });
            return;
        }

        const batch = writeBatch(db);
        const statsRef = doc(db, `users/${user.uid}/stats/summary`);
        batch.update(statsRef, { equippedCosmetic: cosmeticId });

        // Also update the public league player document
        const leaguePlayerRef = doc(db, `league-players/${user.uid}`);
        batch.update(leaguePlayerRef, { equippedCosmetic: cosmeticId });

        try {
            await batch.commit();
            toast({
                title: "Cosmetic Equipped!",
                description: "Your new look is ready for the grid.",
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    }, [user, db, toast, isCosmeticUnlocked]);

    const purchaseCosmetic = useCallback(async (cosmeticId: string, cost: number) => {
        if (!user || !stats || isPurchasing) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to purchase cosmetics.' });
            return;
        }
        if (stats.neonBits < cost) {
            toast({ variant: 'destructive', title: 'Not enough Neon Bits!', description: 'Play more games to earn currency.' });
            return;
        }

        setIsPurchasing(true);
        const statsRef = doc(db, `users/${user.uid}/stats/summary`);
        const newCosmeticRef = doc(db, `users/${user.uid}/cosmetics`, cosmeticId);

        try {
            await runTransaction(db, async (transaction) => {
                const userStatsDoc = await transaction.get(statsRef);
                if (!userStatsDoc.exists() || userStatsDoc.data().neonBits < cost) {
                    throw new Error("Insufficient funds.");
                }

                // Deduct cost and unlock cosmetic
                transaction.update(statsRef, { neonBits: userStatsDoc.data().neonBits - cost });
                transaction.set(newCosmeticRef, { id: cosmeticId, unlockedAt: serverTimestamp() });
            });

            toast({
                title: 'Purchase Successful!',
                description: 'The new cosmetic has been added to your collection.',
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Purchase Failed', description: error.message });
        } finally {
            setIsPurchasing(false);
        }

    }, [user, db, toast, stats, isPurchasing]);

    const unlockCosmetic = useCallback(async (cosmeticId: string) => {
        if (!user) return; // Guard clause
        if (isCosmeticUnlocked(cosmeticId)) return;
        const cosmeticRef = doc(db, `users/${user.uid}/cosmetics`, cosmeticId);
        try {
            await setDoc(cosmeticRef, { id: cosmeticId, unlockedAt: serverTimestamp() });
             // No need to refetch, useCollection listener will catch this
        } catch(e) {
            console.error("Failed to unlock cosmetic: ", e)
        }

    }, [user, db, isCosmeticUnlocked]);

    return { 
        unlockedCosmetics: unlockedCosmetics || [], 
        isCosmeticsLoading,
        equippedCosmetic, 
        equipCosmetic,
        purchaseCosmetic,
        isPurchasing,
        isCosmeticUnlocked,
        unlockCosmetic,
    };
};

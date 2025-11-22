
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCosmetics } from '@/context/CosmeticsContext';
import { ALL_COSMETICS } from '@/lib/cosmetics';
import { Sparkles, CheckCircle, Lock, ShoppingCart, Trophy, Info } from "lucide-react";
import { useStats } from '@/hooks/use-stats';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Cosmetic, CosmeticRarity } from '@/lib/types';
import { useAchievements } from '@/context/AchievementContext';
import SnakePreview from '@/components/game/SnakePreview';

const CosmeticCard = ({ cosmetic }: { cosmetic: Cosmetic }) => {
    const { equippedCosmetic, equipCosmetic, purchaseCosmetic, isPurchasing, isCosmeticUnlocked } = useCosmetics();
    const { stats } = useStats();
    const { achievements } = useAchievements();
    
    const isUnlocked = isCosmeticUnlocked(cosmetic.id);
    const isEquipped = equippedCosmetic === cosmetic.id;
    const canAfford = stats && cosmetic.cost > 0 && stats.neonBits >= cosmetic.cost;
    const achievement = cosmetic.achievementId ? achievements.find(a => a.id === cosmetic.achievementId) : null;

    const renderUnlockButton = () => {
        if (cosmetic.achievementId) {
            return (
                <Button variant="outline" className="w-full" disabled>
                    <Trophy className="mr-2" /> 
                    {achievement ? `Unlocked by "${achievement.name}"` : 'Unlock via achievement'}
                </Button>
            );
        }
        if (cosmetic.cost > 0) {
             return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="outline" className="w-full" disabled={!canAfford || isPurchasing}>
                            <Lock className="mr-2" />
                            Unlock for {cosmetic.cost} Bits
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to unlock the "{cosmetic.name}" skin for {cosmetic.cost} Neon Bits?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => purchaseCosmetic(cosmetic.id, cosmetic.cost)}>
                                <ShoppingCart className="mr-2"/> Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }
        return null;
    }

    return (
        <Card className={cn("bg-card/50 border-primary/20 flex flex-col justify-between", isEquipped && "border-2 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]")}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{cosmetic.name}</CardTitle>
                    <SnakePreview cosmetic={cosmetic} />
                </div>
                <CardDescription>{cosmetic.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {isEquipped ? (
                    <Button disabled className="w-full">
                        <CheckCircle className="mr-2" /> Equipped
                    </Button>
                ) : isUnlocked ? (
                    <Button onClick={() => equipCosmetic(cosmetic.id)} className="w-full">
                        Equip
                    </Button>
                ) : (
                   renderUnlockButton()
                )}
            </CardContent>
        </Card>
    );
};

const RARITY_ORDER: CosmeticRarity[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Seasonal'];
const RARITY_COLORS: Record<CosmeticRarity, string> = {
    Common: 'text-gray-400',
    Rare: 'text-blue-400',
    Epic: 'text-purple-500',
    Legendary: 'text-yellow-500',
    Seasonal: 'text-teal-400',
};

export default function CosmeticsPage() {
    const { stats, isLoading: isStatsLoading } = useStats();
    const { isCosmeticsLoading } = useCosmetics();

    const groupedCosmetics = React.useMemo(() => {
        const groups: Partial<Record<CosmeticRarity, Cosmetic[]>> = {};
        for (const cosmetic of ALL_COSMETICS) {
            if (!groups[cosmetic.rarity]) {
                groups[cosmetic.rarity] = [];
            }
            groups[cosmetic.rarity]!.push(cosmetic);
        }
        return groups;
    }, []);

    const isLoading = isStatsLoading || isCosmeticsLoading;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="bg-card/50 border-primary/20 mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary" />
                        Snake Cosmetics
                    </CardTitle>
                    <CardDescription>Customize your snake's appearance. Unlock new skins with Neon Bits or by completing achievements!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-lg">
                        Your Balance: 
                        {isStatsLoading ? (
                            <Skeleton className="h-6 w-24 inline-block ml-2" />
                        ) : (
                            <span className="font-bold text-primary ml-2">{stats?.neonBits ?? 0}</span>
                        )}
                        <span className="text-primary ml-1"> Neon Bits</span>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
                 </div>
            ) : (
                <div className="space-y-12">
                    {RARITY_ORDER.map(rarity => {
                        const group = groupedCosmetics[rarity];
                        if (!group || group.length === 0) return null;
                        return (
                            <div key={rarity}>
                                <h2 className={cn("text-3xl font-bold mb-4", RARITY_COLORS[rarity])} style={{ filter: `drop-shadow(0 0 8px currentColor)` }}>
                                    {rarity} Skins
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {group.map(cosmetic => (
                                        <CosmeticCard key={cosmetic.id} cosmetic={cosmetic} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

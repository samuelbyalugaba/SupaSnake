
"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useStats } from '@/hooks/use-stats';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
import { Gift, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Helper to get the current season ID, e.g., "2024-10"
const getCurrentSeasonId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    // The "season" is the *previous* month. So in November, we claim October's rewards.
    const lastMonth = new Date(year, month - 1);
    return `${lastMonth.getFullYear()}-${lastMonth.getMonth()}`;
}

const seasonNames = [ "Genesis", "Glitch", "Bloom", "the Fool", "the Surge", "the Solstice", "the Supernova", "the Harvest", "the Equinox", "the Phantom", "the Nexus", "the Singularity"];

const getSeasonName = (seasonId: string) => {
    const [, monthIndex] = seasonId.split('-').map(Number);
    return `Season of ${seasonNames[monthIndex]}`;
}


const SeasonRewardClaim = () => {
    const { user } = useUser();
    const { stats, updateSeasonClaim } = useStats();
    const [isClaiming, setIsClaiming] = useState(false);
    const { toast } = useToast();

    const currentSeasonId = getCurrentSeasonId();
    const lastClaimedSeason = stats?.lastSeasonClaimed;
    
    // Show the dialog if the user is logged in, stats are loaded, and they haven't claimed the reward for the previous month's season.
    const showClaimDialog = user && stats && lastClaimedSeason !== currentSeasonId;

    const handleClaim = async () => {
        setIsClaiming(true);
        const rewardAmount = 500; // Example reward amount
        try {
            await updateSeasonClaim(currentSeasonId, rewardAmount);
            toast({
                title: "Rewards Claimed!",
                description: `You received ${rewardAmount} Neon Bits for your efforts in the ${getSeasonName(currentSeasonId)}.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Error Claiming Rewards",
                description: error.message,
            });
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <AlertDialog open={showClaimDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Gift className="text-primary"/> A New Season Has Begun!
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        The {getSeasonName(currentSeasonId)} has ended. Claim your rewards and see how you ranked! The leaderboards have now been reset for the new season.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">End-of-Season Reward</p>
                    <p className="text-2xl font-bold text-primary">500 Neon Bits</p>
                </div>
                <AlertDialogFooter>
                    <Button onClick={handleClaim} disabled={isClaiming} className="w-full">
                        {isClaiming ? <Loader2 className="animate-spin" /> : 'Claim Rewards'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default SeasonRewardClaim;

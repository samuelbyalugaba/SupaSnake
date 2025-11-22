
"use client";

import React, { useMemo } from 'react';
import type { leaguePlayer } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User as UserIcon, Crown, Shield, Swords, PlusCircle } from 'lucide-react';
import SnakePreview from './SnakePreview';
import { ALL_COSMETICS } from '@/lib/cosmetics';
import { Button } from '../ui/button';
import { useNests } from '@/hooks/use-nests';
import { NestBanner } from './NestBanner';
import { Skeleton } from '../ui/skeleton';

const rankTiers = [
  { name: 'Serpent King', icon: Crown, color: 'text-yellow-400', minPoints: 10000 },
  { name: 'Master', icon: Swords, color: 'text-red-500', minPoints: 8000 },
  { name: 'Diamond', icon: Shield, color: 'text-cyan-400', minPoints: 5000 },
];

const getRankForPoints = (points: number) => {
    return rankTiers.find(tier => points >= tier.minPoints);
}

const PlayerCard = ({ player }: { player: leaguePlayer }) => {
    const { allNests, isLoading: isNestsLoading } = useNests();
    
    const cosmetic = useMemo(() => {
        return ALL_COSMETICS.find(c => c.id === player.equippedCosmetic) || ALL_COSMETICS[0];
    }, [player.equippedCosmetic]);

    const rank = getRankForPoints(player.leaguePoints);
    
    // This is not efficient, but it's for display purposes.
    // A better implementation would have nest details denormalized on the player object.
    const nest = useMemo(() => {
        if (!player.nestId || isNestsLoading || !allNests) return null;
        return allNests.find(n => n.id === player.nestId);
    }, [player.nestId, allNests, isNestsLoading]);

    return (
        <Card className="bg-card/50 border-primary/20 flex flex-col justify-between">
            <CardHeader className="flex-row gap-4 items-center">
                 <Avatar className="w-12 h-12 border-2 border-primary">
                    <AvatarFallback className="text-xl bg-muted">{player.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-xl font-bold">{player.username}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {rank && <rank.icon className={`w-4 h-4 ${rank.color}`} />}
                        <span>{player.leaguePoints.toLocaleString()} LP</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Equipped Skin</p>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">{cosmetic.name}</span>
                        <SnakePreview cosmetic={cosmetic} segments={3} cellSize={6} />
                    </div>
                </div>

                <div className="p-2 bg-muted/30 rounded-lg h-[90px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1 mr-2">Nest</p>
                    {isNestsLoading ? (
                        <Skeleton className="w-full h-16" />
                    ) : nest ? (
                        <NestBanner nest={nest} className="h-16 p-2 text-xs" />
                    ) : (
                        <p className="text-sm text-muted-foreground">No Nest</p>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2" /> Add Friend
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PlayerCard;

"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { Card } from '../ui/card';
import type { Nest } from '@/lib/types';

export const NEST_BANNERS = {
    colors: [
        'bg-red-900/50 border-red-500/50',
        'bg-blue-900/50 border-blue-500/50',
        'bg-green-900/50 border-green-500/50',
        'bg-purple-900/50 border-purple-500/50',
        'bg-yellow-900/50 border-yellow-500/50',
        'bg-cyan-900/50 border-cyan-500/50',
    ],
    icons: [
        'Crown',
        'Sword',
        'Shield',
        'Skull',
        'Gem',
        'Ghost',
        'Dragon',
        'Cat',
        'Bird',
        'Fish',
        'Rat',
        'Bot'
    ],
};

const getBannerStyle = (emblemId: string = '0-Crown') => {
    const [colorIndexStr, iconName] = emblemId.split('-');
    const colorIndex = parseInt(colorIndexStr, 10) || 0;
    
    const colorClass = NEST_BANNERS.colors[colorIndex % NEST_BANNERS.colors.length];
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.ShieldQuestion;

    return { colorClass, Icon };
}

interface NestBannerProps {
    nest: Nest;
    className?: string;
}

export const NestBanner: React.FC<NestBannerProps> = ({ nest, className }) => {
    const { colorClass, Icon } = getBannerStyle(nest.emblemId);

    return (
        <Card className={cn(
            "relative flex items-center justify-center p-6 h-32 rounded-lg overflow-hidden",
            colorClass,
            className
        )}>
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
                 <Icon className="w-10 h-10 mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />
                 <h2 
                    className="text-3xl font-black uppercase tracking-wider"
                    style={{ filter: `drop-shadow(0 0 8px hsl(var(--primary)))` }}
                >
                    {nest.name}
                </h2>
                <p className="text-sm italic text-muted-foreground">"{nest.motto}"</p>
            </div>
        </Card>
    );
};

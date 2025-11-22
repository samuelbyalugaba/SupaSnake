
"use client";

import type { Cosmetic } from '@/lib/types';

interface SnakePreviewProps {
    cosmetic: Cosmetic;
    segments?: number;
    cellSize?: number;
}

const SnakePreview = ({ cosmetic, segments = 3, cellSize = 12 }: SnakePreviewProps) => {
    const segmentArr = Array.from({ length: segments });
    
    return (
        <div className="flex p-2 rounded-md bg-black/30">
            {segmentArr.map((_, i) => (
                 <div
                    key={i}
                    style={{
                        width: `${cellSize * 2}px`,
                        height: `${cellSize * 2}px`,
                        borderRadius: '50%',
                        background: i === 0 
                            ? `radial-gradient(circle, ${cosmetic.style.headGradient.from}, ${cosmetic.style.headGradient.to})`
                            : `radial-gradient(circle, ${cosmetic.style.bodyGradient.from}, ${cosmetic.style.bodyGradient.to})`,
                        boxShadow: `0 0 8px ${cosmetic.style.shadow}`,
                        transform: `translateX(-${i * (cellSize / 2)}px)`
                    }}
                 />
            ))}
        </div>
    );
};

export default SnakePreview;


"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface PlayerProfileLinkProps {
    userId: string;
    username: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

const PlayerProfileLink = ({ userId, username, className, style, children }: PlayerProfileLinkProps) => {
    return (
        <Link 
            href={`/profile/${username}`} 
            className={cn("font-semibold hover:text-primary hover:underline", className)}
            style={style}
            onClick={(e) => e.stopPropagation()} // Prevent parent clicks
        >
            {children || username}
        </Link>
    );
};

export default PlayerProfileLink;

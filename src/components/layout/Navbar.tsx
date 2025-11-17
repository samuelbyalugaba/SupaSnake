
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  Gamepad2,
  User as UserIcon,
  Settings,
  Home,
  BarChart,
  Trophy,
  Info,
  LogOut,
  Sparkles,
  Swords,
  Shield,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import AuthButton from "../auth/AuthButton";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";


const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/play", label: "Play", icon: Gamepad2 },
  { href: "/nests", label: "Nests", icon: Swords },
  { href: "/leaderboards", label: "Leaderboards", icon: BarChart },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/cosmetics", label: "Cosmetics", icon: Sparkles },
  { href: "/leagues", label: "Leagues", icon: Shield },
];

const Logo = () => (
  <Link href="/" className="flex items-center gap-2" prefetch={false}>
    <Image src="/icon.png" alt="Supa Snake Logo" width={24} height={24} className="w-6 h-6" />
    <span 
      className="text-xl font-bold uppercase tracking-wider"
      style={{ filter: `drop-shadow(0 0 5px hsl(var(--primary)))` }}
    >
      Supa Snake
    </span>
  </Link>
);


const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "transition-colors text-lg md:text-sm whitespace-nowrap",
        isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
      )}
      prefetch={false}
    >
      {children}
    </Link>
  );
};


const UserNav = ({ user, isUserLoading }: { user: User | null; isUserLoading: boolean }) => {
  const auth = useAuth();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      localStorage.removeItem('highScore');
      toast({ title: 'Logged out successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not log out.' });
    }
  };

  if (isUserLoading) {
    return <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />;
  }

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full group">
              <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-colors">
                {user.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} />
                ) : (
                  <AvatarFallback className="bg-muted group-hover:bg-primary/20">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon />}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || 'Player'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile"><DropdownMenuItem><UserIcon className="mr-2" />Profile</DropdownMenuItem></Link>
            <Link href="/settings"><DropdownMenuItem><Settings className="mr-2" />Settings</DropdownMenuItem></Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="hidden lg:flex">
          <AuthButton />
        </div>
      )}
    </>
  );
};


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isUserLoading } = useUser();

  return (
    <div className="flex w-full items-center justify-between">
        <div className="flex-1">
            <Logo />
        </div>

        <nav className="hidden lg:flex justify-center flex-1">
            <div className="flex items-center gap-6 whitespace-nowrap">
            {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
            ))}
            </div>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden lg:block">
            <UserNav user={user} isUserLoading={isUserLoading} />
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/95 pt-12">
                 <SheetTitle className="sr-only">Main Menu</SheetTitle>
                <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                    <NavLink key={link.href} href={link.href} onClick={() => setOpen(false)}>
                        <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                        <Icon className="w-5 h-5 text-primary"/>
                        <span>{link.label}</span>
                        </div>
                    </NavLink>
                    )
                })}
                </nav>
                <div className="mt-8 border-t border-primary/20 pt-6">
                { user ? (
                    <div className="space-y-4">
                        <Link href="/profile" onClick={() => setOpen(false)}><div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted"><UserIcon className="w-5 h-5 text-primary"/> Profile</div></Link>
                        <Link href="/settings" onClick={() => setOpen(false)}><div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted"><Settings className="w-5 h-5 text-primary"/> Settings</div></Link>
                        <AuthButton />
                    </div>
                ) : (
                    <AuthButton />
                )}
                </div>
            </SheetContent>
            </Sheet>
        </div>
    </div>
  );
}

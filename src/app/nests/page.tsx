
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Swords, PlusCircle, Users, Crown, Shield, User, LogOut, Loader2, MoreVertical } from "lucide-react";
import { useStats } from '@/hooks/use-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { useNests } from '@/hooks/use-nests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser } from '@/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { NestMember, NestMemberRole } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const createNestSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(20, "Name cannot be longer than 20 characters"),
  motto: z.string().min(5, "Motto must be at least 5 characters").max(50, "Motto cannot be longer than 50 characters"),
  isPublic: z.boolean().default(true),
});

type CreateNestFormValues = z.infer<typeof createNestSchema>;

const CreateNestForm = () => {
    const { createNest, isCreating } = useNests();
    const { stats } = useStats();
    const NEST_CREATION_COST = 1000;
    const canAfford = stats ? stats.neonBits >= NEST_CREATION_COST : false;

    const form = useForm<CreateNestFormValues>({
        resolver: zodResolver(createNestSchema),
        defaultValues: { name: "", motto: "", isPublic: true },
    });

    return (
        <Card className="bg-card/50 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PlusCircle /> Create a New Nest</CardTitle>
                <CardDescription>
                    Forge a new clan. Cost: <span className="font-bold text-primary">{NEST_CREATION_COST} Neon Bits</span>.
                    Your Balance: <span className="font-bold text-primary">{stats?.neonBits ?? 0}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => createNest(data, NEST_CREATION_COST))} className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nest Name</FormLabel>
                                <FormControl><Input placeholder="The Gilded Vipers" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="motto" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nest Motto</FormLabel>
                                <FormControl><Input placeholder="Strike from the shadows." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="isPublic" render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Public Nest</FormLabel>
                                    <p className="text-sm text-muted-foreground">Allow anyone to join instantly.</p>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full" disabled={isCreating || !canAfford}>
                            {isCreating ? <><Loader2 className="animate-spin" /> Founding...</> : canAfford ? "Found Nest" : "Not Enough Bits"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const NestList = () => {
    const { publicNests, isLoading, joinNest, isJoining } = useNests();
    const { stats } = useStats();

    return (
         <Card className="bg-card/50 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Join a Nest</CardTitle>
                <CardDescription>Find a public Nest and become part of their crew.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                ) : publicNests && publicNests.length > 0 ? (
                    publicNests.map(nest => (
                        <div key={nest.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                                <h4 className="font-bold">{nest.name}</h4>
                                <p className="text-sm text-muted-foreground italic">"{nest.motto}"</p>
                                <p className="text-xs text-muted-foreground">{nest.memberCount} / 50 members</p>
                            </div>
                            <Button onClick={() => joinNest(nest.id)} disabled={isJoining === nest.id || !!stats?.nestId}>
                                {isJoining === nest.id ? <Loader2 className="animate-spin" /> : "Join"}
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground">No public Nests available. Why not create one?</p>
                )}
            </CardContent>
        </Card>
    )
}

const MemberManagementMenu = ({ member, self }: { member: NestMember, self?: NestMember }) => {
    const { kickMember, updateMemberRole, isUpdatingRole, isKicking } = useNests();
    const canManage = self?.role === 'admin' && member.role !== 'admin';

    if (!canManage) return null;

    const isLoading = isUpdatingRole === member.userId || isKicking === member.userId;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin"/> : <MoreVertical />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {member.role === 'member' && (
                    <DropdownMenuItem onSelect={() => updateMemberRole(member.userId, 'moderator')}>
                        <Shield className="mr-2" /> Promote to Moderator
                    </DropdownMenuItem>
                )}
                {member.role === 'moderator' && (
                    <DropdownMenuItem onSelect={() => updateMemberRole(member.userId, 'member')}>
                        <User className="mr-2" /> Demote to Member
                    </DropdownMenuItem>
                )}
                <AlertDialog>
                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                        <LogOut className="mr-2"/> Kick Member
                    </DropdownMenuItem></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Kick {member.username}?</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to remove this member from the Nest? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => kickMember(member.userId)} className="bg-destructive hover:bg-destructive/90">Kick</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const UserNest = () => {
    const { user } = useUser();
    const { userNest, nestMembers, isLoading: isNestDataLoading, leaveNest, isLeaving } = useNests();
    
    if (isNestDataLoading || !userNest) return <Skeleton className="h-96 w-full" />;

    const self = nestMembers.find(m => m.userId === user?.uid);
    const sortedMembers = [...nestMembers].sort((a, b) => {
        const roleOrder = { admin: 0, moderator: 1, member: 2 };
        return roleOrder[a.role] - roleOrder[b.role];
    });

    return (
         <Card className="bg-card/50 border-primary/20">
            <CardHeader>
                <CardTitle className="text-3xl">{userNest.name}</CardTitle>
                <CardDescription>"{userNest.motto}"</CardDescription>
            </CardHeader>
            <CardContent>
                <h3 className="text-xl font-bold mb-4">Members ({userNest.memberCount ?? 0}/50)</h3>
                 <div className="space-y-3">
                    {isNestDataLoading || nestMembers.length === 0 ? (
                        Array.from({length: userNest.memberCount ?? 1}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : sortedMembers.map(member => {
                        const roleIcon = member.role === 'admin' ? <Crown className="text-yellow-400"/> : member.role === 'moderator' ? <Shield className="text-blue-400"/> : <User className="text-gray-400"/>;
                        return (
                            <div key={member.userId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold flex items-center gap-2">{roleIcon} {member.username}</p>
                                        <p className="text-xs text-muted-foreground">Joined {member.joinedAt ? formatDistanceToNow(member.joinedAt.toDate(), { addSuffix: true }) : 'a while ago'}</p>
                                    </div>
                                </div>
                                {user?.uid !== member.userId && <MemberManagementMenu member={member} self={self} />}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
            <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="w-full" disabled={isLeaving}>
                            {isLeaving ? <Loader2 className="animate-spin" /> : <><LogOut /> Leave Nest</>}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Leave {userNest.name}?</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to leave this Nest? You can rejoin later if it's public.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={leaveNest} className="bg-destructive hover:bg-destructive/90">Leave</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}

export default function NestsPage() {
    const { user } = useUser();
    const { stats, isLoading: isStatsLoading } = useStats();
    
    const inNest = !!stats?.nestId;
    const isLoading = isStatsLoading;

    if (!user) {
        return (
             <div className="container mx-auto p-4 md:p-8">
                <Card className="bg-card/50 border-primary/20 text-center p-8">
                    <CardTitle>Login to Join the Fun</CardTitle>
                    <CardDescription className="mt-2">You need to be logged in to create or join a Nest.</CardDescription>
                </Card>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-6">
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
             <h1 className="text-5xl font-black uppercase tracking-wider mb-8 text-center" style={{ filter: `drop-shadow(0 0 10px hsl(var(--primary)))` }}>Nests</h1>
            {inNest ? (
                <UserNest />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <CreateNestForm />
                    <NestList />
                </div>
            )}
        </div>
    );
}

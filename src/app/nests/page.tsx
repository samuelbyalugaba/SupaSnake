
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Swords, PlusCircle, Users, Crown, Shield, User, LogOut, Loader2, MoreVertical, Settings, MessageSquare, Paintbrush } from "lucide-react";
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
import type { Nest, NestMember, NestMemberRole } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NestBanner, NEST_BANNERS } from '@/components/game/NestBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlobalChat from '@/components/game/GlobalChat';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const createNestSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(20, "Name cannot be longer than 20 characters"),
  motto: z.string().min(5, "Motto must be at least 5 characters").max(50, "Motto cannot be longer than 50 characters"),
  isPublic: z.boolean().default(true),
  emblemId: z.string(),
});

type CreateNestFormValues = z.infer<typeof createNestSchema>;

const EmblemPicker = ({ field, form }: { field: any, form: any }) => {
    const [colorIndex, iconName] = field.value?.split('-') || ['0', 'Shield'];

    const handleColorChange = (index: number) => {
        form.setValue('emblemId', `${index}-${iconName}`);
    };
    const handleIconChange = (name: string) => {
        form.setValue('emblemId', `${colorIndex}-${name}`);
    };

    return (
        <Card className="p-4 bg-muted/30">
            <FormLabel>Nest Emblem</FormLabel>
            <div className="my-4">
                <NestBanner nest={{ emblemId: field.value } as Nest} />
            </div>
            <p className="text-sm font-medium mb-2">Color</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {NEST_BANNERS.colors.map((colorClass, index) => (
                    <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn("w-8 h-8 rounded-full", colorClass.split(' ')[0], parseInt(colorIndex) === index && "ring-2 ring-primary ring-offset-2 ring-offset-background")}
                        onClick={() => handleColorChange(index)}
                    />
                ))}
            </div>
             <p className="text-sm font-medium mb-2">Icon</p>
            <ScrollArea className="h-32">
                <div className="grid grid-cols-6 gap-2">
                    {NEST_BANNERS.icons.map((icon, index) => {
                        const IconComponent = (Users as any); // Placeholder, actual icon is in NestBanner
                        return (
                             <Button
                                key={index}
                                type="button"
                                variant={iconName === icon ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => handleIconChange(icon)}
                            >
                                {/* This will just be a generic user icon, but the preview shows the real one */}
                                <User />
                            </Button>
                        )
                    })}
                </div>
            </ScrollArea>
        </Card>
    )
}

const CreateNestForm = () => {
    const { createNest, isCreating } = useNests();
    const { stats } = useStats();
    const NEST_CREATION_COST = 1000;
    const canAfford = stats ? stats.neonBits >= NEST_CREATION_COST : false;

    const form = useForm<CreateNestFormValues>({
        resolver: zodResolver(createNestSchema),
        defaultValues: { name: "", motto: "", isPublic: true, emblemId: '0-Crown' },
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
                         <FormField control={form.control} name="emblemId" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <EmblemPicker field={field} form={form} />
                                </FormControl>
                            </FormItem>
                        )}/>
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

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
        )
    }

    if (!publicNests || publicNests.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No public Nests available. Why not create one?</p>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicNests.map(nest => (
                 <Card key={nest.id} className="bg-card/50 border-primary/20 flex flex-col justify-between">
                    <CardContent className="p-4">
                        <NestBanner nest={nest} />
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <div className="flex justify-around w-full text-sm">
                            <p><Users className="inline mr-1" size={16} />{nest.memberCount} / 50</p>
                            <p><Crown className="inline mr-1" size={16} />{nest.totalScore.toLocaleString()}</p>
                        </div>
                        <Button 
                            onClick={() => joinNest(nest.id)} 
                            disabled={isJoining === nest.id || !!stats?.nestId}
                            className="w-full"
                        >
                            {isJoining === nest.id ? <Loader2 className="animate-spin" /> : "Join"}
                        </Button>
                    </CardFooter>
                 </Card>
            ))}
        </div>
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

const NestMembersTab = () => {
     const { user } = useUser();
    const { nestMembers, isUserNestLoading } = useNests();
    
    if (isUserNestLoading) {
         return <div className="space-y-2">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
    }

    const self = nestMembers.find(m => m.userId === user?.uid);
    const sortedMembers = [...nestMembers].sort((a, b) => {
        const roleOrder = { admin: 0, moderator: 1, member: 2 };
        return roleOrder[a.role] - roleOrder[b.role];
    });

    return (
        <div className="space-y-3">
            {sortedMembers.map(member => {
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
    )
}

const NestSettingsTab = () => {
    return <p className="text-center p-8 text-muted-foreground">Nest settings coming soon!</p>
}


const UserNest = () => {
    const { user } = useUser();
    const { userNest, isUserNestLoading, leaveNest, isLeaving } = useNests();
    
    if (isUserNestLoading || !userNest) return <Skeleton className="h-96 w-full" />;

    return (
         <Card className="bg-card/50 border-primary/20">
            <CardHeader className="p-0">
                <NestBanner nest={userNest} />
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="members" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="members"><Users className="w-4 h-4 mr-2"/>Members ({userNest.memberCount ?? 0})</TabsTrigger>
                        <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2"/>Chat</TabsTrigger>
                        <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2"/>Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="members" className="pt-4">
                        <NestMembersTab />
                    </TabsContent>
                     <TabsContent value="chat" className="pt-4 h-[500px]">
                        <GlobalChat defaultTab='nest' />
                    </TabsContent>
                    <TabsContent value="settings" className="pt-4">
                        <NestSettingsTab />
                    </TabsContent>
                </Tabs>
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

const FindNest = () => {
    const [view, setView] = useState<'find' | 'create'>('find');

    return (
        <div className="space-y-8">
            <div className="text-center">
                 <h1 className="text-5xl font-black uppercase tracking-wider mb-2" style={{ filter: `drop-shadow(0 0 10px hsl(var(--primary)))` }}>Nests</h1>
                 <p className="text-muted-foreground">Team up with other players to dominate the leaderboards.</p>
            </div>
            
            <Tabs value={view} onValueChange={(v) => setView(v as 'find' | 'create')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="find"><Users className="w-4 h-4 mr-2"/>Find a Nest</TabsTrigger>
                    <TabsTrigger value="create"><PlusCircle className="w-4 h-4 mr-2"/>Create a Nest</TabsTrigger>
                </TabsList>
                <TabsContent value="find" className="mt-6">
                    <NestList />
                </TabsContent>
                <TabsContent value="create" className="mt-6">
                    <CreateNestForm />
                </TabsContent>
            </Tabs>
        </div>
    )
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
            {inNest ? <UserNest /> : <FindNest />}
        </div>
    );
}

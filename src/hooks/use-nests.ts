
'use client';

import { useMemo, useCallback, useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, runTransaction, serverTimestamp, writeBatch, query, where, getDocs, deleteDoc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import type { Nest, NestMember, NestMemberRole, UserStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useStats } from './use-stats';

export const useNests = () => {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const { stats } = useStats();
    
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isKicking, setIsKicking] = useState<string | null>(null);
    const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);


    // --- Data Fetching ---
    const nestsCollectionRef = useMemo(() => collection(db, 'nests'), [db]);
    
    const { data: allNests, isLoading: areAllNestsLoading } = useCollection<Nest>(nestsCollectionRef);

    const publicNestsQuery = useMemo(() => query(nestsCollectionRef, where("isPublic", "==", true)), [nestsCollectionRef]);
    const { data: publicNests, isLoading: arePublicNestsLoading } = useCollection<Nest>(publicNestsQuery);
    
    const userNestRef = useMemo(() => (stats?.nestId ? doc(db, 'nests', stats.nestId) : null), [stats?.nestId, db]);
    const { data: userNest, isLoading: isUserNestLoading } = useDoc<Nest>(userNestRef);

    const nestMembersRef = useMemo(() => (stats?.nestId ? collection(db, `nests/${stats.nestId}/members`) : null), [stats?.nestId, db]);
    const { data: nestMembers, isLoading: areMembersLoading } = useCollection<NestMember>(nestMembersRef);


    // --- Actions ---
    const createNest = useCallback(async (data: { name: string; motto: string; isPublic: boolean }, cost: number) => {
        if (!user || !user.displayName) {
            toast({ variant: 'destructive', title: 'You must be logged in and have a username to create a Nest.' });
            return;
        }
        if (!stats) {
            toast({ variant: 'destructive', title: 'User data not loaded yet.' });
            return;
        }
        if (stats.nestId) {
            toast({ variant: 'destructive', title: 'You are already in a Nest.' });
            return;
        }
        if ((stats.neonBits ?? 0) < cost) {
            toast({ variant: 'destructive', title: 'Not enough Neon Bits to create a Nest.' });
            return;
        }

        setIsCreating(true);

        const newNestRef = doc(collection(db, 'nests'));
        const nestNameRef = doc(db, 'nest-names', data.name.toLowerCase());
        const userStatsRef = doc(db, `users/${user.uid}/stats/summary`);
        const nestMemberRef = doc(db, `nests/${newNestRef.id}/members`, user.uid);
        
        try {
            await runTransaction(db, async (transaction) => {
                const nestNameDoc = await transaction.get(nestNameRef);
                if (nestNameDoc.exists()) {
                    throw new Error(`A Nest with the name "${data.name}" already exists.`);
                }
                
                const userStatsDoc = await transaction.get(userStatsRef);
                if (!userStatsDoc.exists() || (userStatsDoc.data().neonBits ?? 0) < cost) {
                    throw new Error("Insufficient funds. Please refresh and try again.");
                }
                
                const nestData = {
                    name: data.name,
                    motto: data.motto,
                    isPublic: data.isPublic,
                    ownerId: user.uid,
                    memberCount: 1,
                    totalScore: stats.totalScore ?? 0,
                    emblemId: 'default',
                };
                transaction.set(newNestRef, nestData);

                const memberData = {
                    userId: user.uid,
                    username: user.displayName!,
                    role: 'admin' as NestMemberRole,
                    joinedAt: serverTimestamp(),
                };
                transaction.set(nestMemberRef, memberData);
                
                transaction.set(nestNameRef, { nestId: newNestRef.id });

                const newNeonBits = (userStatsDoc.data().neonBits ?? 0) - cost;
                const statsUpdate = {
                    neonBits: newNeonBits,
                    nestId: newNestRef.id,
                };
                transaction.update(userStatsRef, statsUpdate);
            });

            toast({ title: "Nest Created!", description: `Welcome to ${data.name}!` });
        } catch (error: any) {
            console.error("Nest creation failed:", error);
            if (error.code?.includes('permission-denied')) {
                 const permissionError = new FirestorePermissionError({
                    path: `(transaction writes)`,
                    operation: 'create',
                    requestResourceData: { nestName: data.name.toLowerCase(), nest: newNestRef.path, member: nestMemberRef.path },
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            toast({ variant: 'destructive', title: 'Failed to create Nest', description: error.message });
        } finally {
            setIsCreating(false);
        }
    }, [user, db, stats, toast]);
    
    const joinNest = useCallback(async (nestId: string) => {
        if (!user || !stats || !user.displayName) {
            toast({ variant: 'destructive', title: 'You must be logged in to join a Nest.' });
            return;
        };
        setIsJoining(nestId);
        const nestRef = doc(db, 'nests', nestId);
        const nestMemberRef = doc(db, `nests/${nestId}/members`, user.uid);
        const userStatsRef = doc(db, `users/${user.uid}/stats/summary`);

        try {
            await runTransaction(db, async (transaction) => {
                const nestDoc = await transaction.get(nestRef);
                if (!nestDoc.exists() || !nestDoc.data().isPublic) throw new Error("This Nest is not public or does not exist.");
                if ((nestDoc.data().memberCount ?? 0) >= 50) throw new Error("This Nest is full.");
                
                const currentTotalScore = nestDoc.data().totalScore ?? 0;
                const userTotalScore = stats.totalScore ?? 0;

                transaction.set(nestMemberRef, { userId: user.uid, username: user.displayName, role: 'member', joinedAt: serverTimestamp() });
                transaction.update(nestRef, { 
                    memberCount: (nestDoc.data().memberCount ?? 0) + 1,
                    totalScore: currentTotalScore + userTotalScore,
                });
                transaction.update(userStatsRef, { nestId: nestId });
            });
            toast({ title: 'Welcome to the Nest!', description: "You have successfully joined."});
        } catch (error: any) {
             if (error.code?.includes('permission-denied')) {
                 const permissionError = new FirestorePermissionError({
                    path: `(transaction writes)`,
                    operation: 'create',
                    requestResourceData: { member: nestMemberRef.path, nest: nestRef.path, userStats: userStatsRef.path },
                });
                errorEmitter.emit('permission-error', permissionError);
            }
             toast({ variant: 'destructive', title: 'Failed to join Nest', description: error.message });
        } finally {
            setIsJoining(null);
        }
    }, [user, db, stats, toast]);

    const leaveNest = useCallback(async () => {
        if (!user || !stats?.nestId || !stats) {
            toast({ variant: 'destructive', title: 'You must be in a Nest to leave it.' });
            return;
        }
        setIsLeaving(true);
        const nestRef = doc(db, 'nests', stats.nestId);
        const selfMemberRef = doc(db, `nests/${stats.nestId}/members`, user.uid);
        const userStatsRef = doc(db, `users/${user.uid}/stats/summary`);

        try {
            await runTransaction(db, async (transaction) => {
                const nestDoc = await transaction.get(nestRef);
                if (!nestDoc.exists()) throw new Error("Nest not found.");

                const currentTotalScore = nestDoc.data()?.totalScore ?? 0;
                const userTotalScore = stats.totalScore ?? 0;
                
                transaction.delete(selfMemberRef);
                transaction.update(nestRef, { 
                    memberCount: (nestDoc.data()?.memberCount ?? 1) - 1,
                    totalScore: Math.max(0, currentTotalScore - userTotalScore),
                });
                transaction.update(userStatsRef, { nestId: null });
            });
            toast({ title: "You have left the Nest." });
        } catch (error: any) {
             if (error.code?.includes('permission-denied')) {
                 const permissionError = new FirestorePermissionError({
                    path: `(transaction writes)`,
                    operation: 'delete',
                    requestResourceData: { member: selfMemberRef.path, nest: nestRef.path, userStats: userStatsRef.path },
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            toast({ variant: 'destructive', title: 'Failed to leave Nest', description: error.message });
        } finally {
            setIsLeaving(false);
        }
    }, [user, db, stats, toast]);

    const kickMember = useCallback(async (userId: string) => {
        if (!user || !stats?.nestId) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be in a Nest to manage members.' });
            return;
        }
        setIsKicking(userId);
        const nestRef = doc(db, 'nests', stats.nestId);
        const memberRef = doc(db, `nests/${stats.nestId}/members`, userId);
        const memberStatsRef = doc(db, `users/${userId}/stats/summary`);
        
        try {
            await runTransaction(db, async (transaction) => {
                const nestDoc = await transaction.get(nestRef);
                const memberStatsDoc = await transaction.get(memberStatsRef);
                const memberStats = memberStatsDoc.data() as UserStats | undefined;
                
                if (!nestDoc.exists()) throw new Error("Nest not found.");

                const currentTotalScore = nestDoc.data()?.totalScore ?? 0;
                const memberTotalScore = memberStats?.totalScore ?? 0;

                transaction.delete(memberRef);
                transaction.update(nestRef, { 
                    memberCount: (nestDoc.data()?.memberCount ?? 1) - 1,
                    totalScore: Math.max(0, currentTotalScore - memberTotalScore),
                });
                transaction.update(memberStatsRef, { nestId: null });
            });
            toast({ title: "Member removed." });
        } catch (error: any) {
             if (error.code?.includes('permission-denied')) {
                 const permissionError = new FirestorePermissionError({
                    path: `(transaction writes)`,
                    operation: 'delete',
                    requestResourceData: { member: memberRef.path, nest: nestRef.path, userStats: memberStatsRef.path },
                });
                errorEmitter.emit('permission-error', permissionError);
            }
             toast({ variant: 'destructive', title: 'Failed to kick member', description: error.message });
        } finally {
            setIsKicking(null);
        }
    }, [user, db, stats?.nestId, toast]);

    const updateMemberRole = useCallback(async (userId: string, role: NestMemberRole) => {
        if (!user || !stats?.nestId) {
             toast({ variant: 'destructive', title: 'Error', description: 'You must be in a Nest to manage members.' });
            return;
        }
        setIsUpdatingRole(userId);
        const memberRef = doc(db, `nests/${stats.nestId}/members`, userId);
        try {
            await updateDoc(memberRef, { role });
            toast({ title: "Role updated." });
        } catch (error: any) {
            if (error.code?.includes('permission-denied')) {
                 const permissionError = new FirestorePermissionError({
                    path: memberRef.path,
                    operation: 'update',
                    requestResourceData: { role },
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            toast({ variant: 'destructive', title: 'Failed to update role', description: error.message });
        } finally {
            setIsUpdatingRole(null);
        }
    }, [user, db, stats?.nestId, toast]);

    const isLoading = areAllNestsLoading || isUserNestLoading || areMembersLoading || arePublicNestsLoading;

    return {
        publicNests: publicNests || [],
        allNests: allNests || [],
        isLoading,
        isCreating, isJoining, isLeaving, isKicking, isUpdatingRole,
        userNest,
        nestMembers: nestMembers || [],
        createNest,
        joinNest,
        leaveNest,
        kickMember,
        updateMemberRole
    };
};

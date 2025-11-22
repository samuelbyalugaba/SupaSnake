
"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch, query, where, getDocs, limit, startAt, endAt, orderBy, setDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { leaguePlayer, FriendRequest, Friend } from '@/lib/types';

export const useFriends = () => {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();

    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState<leaguePlayer[]>([]);
    const [isResponding, setIsResponding] = useState(false);

    // --- Data Fetching ---
    const friendsQuery = useMemo(() => user ? collection(db, `users/${user.uid}/friends`) : null, [user, db]);
    const { data: friendLinks, isLoading: isFriendLinksLoading } = useCollection<Friend>(friendsQuery);

    const [friends, setFriends] = useState<leaguePlayer[]>([]);
    const [isFriendsLoading, setIsFriendsLoading] = useState(true);

    useEffect(() => {
        setIsFriendsLoading(true);
        if (isFriendLinksLoading) return;
        if (!friendLinks || friendLinks.length === 0) {
            setFriends([]);
            setIsFriendsLoading(false);
            return;
        }

        const fetchFriendProfiles = async () => {
            const friendIds = friendLinks.map(f => f.userId);
            if (friendIds.length === 0) {
                setFriends([]);
                setIsFriendsLoading(false);
                return;
            }
            const playersRef = collection(db, 'league-players');
            const q = query(playersRef, where('userId', 'in', friendIds));
            try {
                const snapshot = await getDocs(q);
                const friendProfiles = snapshot.docs.map(d => d.data() as leaguePlayer);
                setFriends(friendProfiles);
            } catch (error) {
                console.error("Error fetching friend profiles:", error);
                setFriends([]);
            } finally {
                setIsFriendsLoading(false);
            }
        };

        fetchFriendProfiles();
    }, [friendLinks, isFriendLinksLoading, db]);

    const friendRequestsQuery = useMemo(() => user ? query(collection(db, `users/${user.uid}/friend-requests`), where('status', '==', 'pending')) : null, [user, db]);
    const { data: friendRequests, isLoading: isRequestsLoading } = useCollection<FriendRequest>(friendRequestsQuery);
    
    // This can be improved by storing sent requests in a dedicated subcollection for the user
    // For now, we'll rely on the UI state after sending a request
    const [sentRequestCache, setSentRequestCache] = useState<string[]>([]);


    // --- Search ---
    const searchPlayers = useCallback(async (username: string) => {
        setIsSearching(true);
        setHasSearched(true);
        const playersRef = collection(db, 'league-players');
        const q = query(
            playersRef,
            orderBy('username'),
            startAt(username),
            endAt(username + '\uf8ff'),
            limit(10)
        );
        try {
            const querySnapshot = await getDocs(q);
            const players = querySnapshot.docs.map(doc => doc.data() as leaguePlayer);
            setSearchResults(players);
        } catch (error) {
            console.error("Error searching for players:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [db]);

    // --- Friend Actions ---
    const sendFriendRequest = useCallback(async (toPlayer: leaguePlayer) => {
        if (!user || !user.displayName) {
            toast({ variant: 'destructive', title: 'You must be logged in to send friend requests.' });
            return;
        }
        setIsResponding(true);
        const requestRef = doc(db, `users/${toPlayer.userId}/friend-requests`, user.uid);
        try {
            await setDoc(requestRef, {
                requestingUserId: user.uid,
                requestingUsername: user.displayName,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            setSentRequestCache(prev => [...prev, toPlayer.userId]);
            toast({ title: 'Friend request sent!' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsResponding(false);
        }
    }, [user, db, toast]);

    const acceptFriendRequest = useCallback(async (request: FriendRequest) => {
        if (!user || !user.displayName) return;
        setIsResponding(true);
        
        const batch = writeBatch(db);

        // 1. Delete the friend request
        const requestRef = doc(db, `users/${user.uid}/friend-requests`, request.requestingUserId);
        batch.delete(requestRef);

        // 2. Add to current user's friend list
        const currentUserFriendRef = doc(db, `users/${user.uid}/friends`, request.requestingUserId);
        batch.set(currentUserFriendRef, {
            userId: request.requestingUserId,
            username: request.requestingUsername,
            since: serverTimestamp(),
        });
        
        // 3. Add to the other user's friend list
        const otherUserFriendRef = doc(db, `users/${request.requestingUserId}/friends`, user.uid);
        batch.set(otherUserFriendRef, {
            userId: user.uid,
            username: user.displayName,
            since: serverTimestamp(),
        });

        try {
            await batch.commit();
            toast({ title: 'Friend added!', description: `You are now friends with ${request.requestingUsername}.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error accepting request', description: error.message });
        } finally {
            setIsResponding(false);
        }
    }, [user, db, toast]);
    
    const rejectFriendRequest = useCallback(async (requestingUserId: string) => {
        if (!user) return;
        setIsResponding(true);
        const requestRef = doc(db, `users/${user.uid}/friend-requests`, requestingUserId);
        try {
            await deleteDoc(requestRef);
            toast({ title: 'Request rejected.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error rejecting request', description: error.message });
        } finally {
            setIsResponding(false);
        }
    }, [user, db, toast]);

    // --- Friendship Status ---
    const friendshipStatus = useCallback((otherUserId: string): 'friends' | 'request_sent' | 'request_received' | 'not_friends' => {
        if (friends?.some(f => f.userId === otherUserId)) return 'friends';
        if (friendRequests?.some(r => r.id === otherUserId)) return 'request_received';
        if (sentRequestCache.includes(otherUserId)) return 'request_sent';
        return 'not_friends';
    }, [friends, friendRequests, sentRequestCache]);
    
    
    return {
        // State
        friends: friends || [],
        friendRequests: friendRequests || [],
        isFriendsLoading,
        isRequestsLoading,
        searchResults,
        isSearching,
        hasSearched,
        isResponding,
        // Actions
        searchPlayers,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        // Helpers
        friendshipStatus,
    };
};

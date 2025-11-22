
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, runTransaction, serverTimestamp, writeBatch } from 'firebase/firestore';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!auth || !db) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service not ready. Please try again.' });
        return;
    }
    if (username.length < 3 || username.length > 15) {
      toast({ variant: 'destructive', title: 'Invalid Username', description: 'Username must be between 3 and 15 characters.' });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        toast({ variant: 'destructive', title: 'Invalid Username', description: 'Username can only contain letters, numbers, and underscores.' });
        return;
    }

    setLoading(true);
    const usernameRef = doc(db, 'usernames', username.toLowerCase());

    try {
      const usernameDoc = await getDoc(usernameRef);
      if (usernameDoc.exists()) {
        throw new Error('Username is already taken.');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: username });
      
      const batch = writeBatch(db);
      batch.set(usernameRef, { userId: user.uid });

      const userStatsRef = doc(db, `users/${user.uid}/stats/summary`);
      batch.set(userStatsRef, {
        highScore: 0,
        gamesPlayed: 0,
        totalScore: 0,
        neonBits: 0,
        equippedCosmetic: 'default',
        nestId: null,
        leaguePoints: 0,
      });

      // Also create the public-facing league player document
      const leaguePlayerRef = doc(db, 'league-players', user.uid);
      batch.set(leaguePlayerRef, {
        userId: user.uid,
        username: username,
        leaguePoints: 0,
        equippedCosmetic: 'default',
      });

      await batch.commit();

      toast({ title: 'Success', description: 'Account created successfully.' });
      onOpenChange(false);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign-up Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service not ready. Please try again.' });
        return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Success', description: 'Logged in successfully.' });
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setUsername('');
      setIsLogin(true);
      setLoading(false);
    }
    onOpenChange(isOpen);
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Log In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {isLogin ? "Log in to your Supa Snake account." : "Create a Supa Snake account to track your progress."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <form onSubmit={handleAuth} className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}</Button>
          </form>
        </div>
        <div className="text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="pl-1">
            {isLogin ? 'Sign Up' : 'Log In'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

    
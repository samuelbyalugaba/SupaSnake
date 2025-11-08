"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const auth = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Success', description: 'Logged in successfully.' });
      } else {
        if (!username) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a username.' });
            setLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: username });
        }
        toast({ title: 'Success', description: 'Account created successfully.' });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    // Reset form state when dialog is closed
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
          <DialogTitle>{isLogin ? 'Log In' : 'Sign Up'} to Save Score</DialogTitle>
          <DialogDescription>
            {isLogin ? "Log in with your email to save high scores." : "Create an account to save your high scores."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <form onSubmit={handleEmailAuth} className="grid gap-4">
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

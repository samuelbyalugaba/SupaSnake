
"use client";

import React, { useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/auth/AuthDialog';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LogIn, LogOut } from 'lucide-react';

const AuthButton = () => {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('highScore');
      toast({ title: 'Logged out successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not log out.' });
    }
  };

  if (isUserLoading) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  return (
    <>
      {user ? (
        <Button onClick={handleLogout} variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      ) : (
        <Button onClick={() => setIsAuthDialogOpen(true)} variant="outline" size="sm">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      )}
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
};

export default AuthButton;

"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useFriends as useFriendsData } from '@/hooks/use-friends';

type FriendsHookType = ReturnType<typeof useFriendsData>;

const FriendsContext = createContext<FriendsHookType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const friendsData = useFriendsData();
  return <FriendsContext.Provider value={friendsData}>{children}</FriendsContext.Provider>;
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};
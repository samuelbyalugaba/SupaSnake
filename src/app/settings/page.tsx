
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon, User, KeyRound, Volume2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSettings } from '@/context/SettingsContext';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAchievements } from '@/context/AchievementContext';

const profileFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(20, { message: "Username must not be longer than 20 characters." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);
  const { isMuted, toggleMute, theme, setTheme } = useSettings();
  const { resetAchievements, updateAchievementProgress } = useAchievements();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.displayName || "",
    },
    mode: "onChange",
  });
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSubmittingUsername(true);
    try {
      await updateProfile(user, { displayName: data.username });
      toast({
        title: "Success",
        description: "Your username has been updated.",
      });
      // Logic for the 'change-username' achievement
      updateAchievementProgress('change-username', 1);
      // Reset form with new values to make it pristine
      form.reset({ username: data.username });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating username",
        description: error.message,
      });
    } finally {
      setIsSubmittingUsername(false);
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email address found for this account.",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Email Sent",
        description: `An email has been sent to ${user.email} with instructions to reset your password.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending reset email",
        description: error.message,
      });
    }
  };
  
  const handleResetProgress = async () => {
    await resetAchievements();
    updateAchievementProgress('reset-progress', 1);
  };


  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <SettingsIcon className="text-primary" />
            Settings
          </CardTitle>
          <CardDescription>Customize your game experience.</CardDescription>
        </CardHeader>
      </Card>

      {/* Account Settings */}
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Your username" {...field} />
                        <Button type="submit" disabled={isSubmittingUsername || !form.formState.isDirty}>
                          {isSubmittingUsername ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="flex items-center gap-2">
              <Input type="password" value="************" disabled />
              <Button variant="outline" onClick={handlePasswordReset}>Change Password</Button>
            </div>
            <p className="text-sm text-muted-foreground">Click "Change Password" to receive a reset link via email.</p>
          </div>
        </CardContent>
      </Card>

      {/* Audio & Visual Settings */}
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Volume2 /> Audio & Visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center justify-between">
            <Label htmlFor="sound-switch" className="flex flex-col gap-1">
              <span>Sound Effects</span>
              <span className="font-normal text-muted-foreground text-sm">Toggle game sound effects.</span>
            </Label>
            <Switch id="sound-switch" checked={!isMuted} onCheckedChange={toggleMute} />
          </div>
           <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(newTheme) => {
                setTheme(newTheme as 'neon' | 'light' | 'dark');
                updateAchievementProgress('theme-switcher', 1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neon">Neon</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Change the application's color scheme.</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card/50 border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
             <div>
                <Label className="font-bold">Reset Progress</Label>
                <p className="text-sm text-muted-foreground">This will permanently reset your achievements. This action cannot be undone.</p>
             </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset Progress</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently reset your achievement data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetProgress}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  Settings,
  Bell,
  Moon,
  Shield,
  Volume2,
  Languages,
  Keyboard,
  Trash2,
  Clock,
  Palette,
  MessageSquare,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mentions: true,
    taskUpdates: true,
    achievements: true
  });
  const [sounds, setSounds] = useState({
    messageSound: true,
    notificationSound: true
  });
  const [privacy, setPrivacy] = useState({
    onlineStatus: true,
    readReceipts: true,
    activityStatus: true
  });

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="container max-w-5xl py-6 space-y-8 px-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="w-full flex flex-wrap gap-2 h-auto p-2">
            <TabsTrigger value="general" className="flex-1 min-w-[120px]">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 min-w-[120px]">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1 min-w-[120px]">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1 min-w-[120px]">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Your Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage your profile information
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/dashboard/settings/profile">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
                <Separator />
                <div className="space-y-4">
                  {/* Language Settings */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Language</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred language
                      </p>
                    </div>
                    <Button variant="outline">
                      <Languages className="h-4 w-4 mr-2" />
                      English (US)
                    </Button>
                  </div>
                  {/* Time Zone Settings */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Time Zone</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your local time zone
                      </p>
                    </div>
                    <Button variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      UTC-05:00
                    </Button>
                  </div>
                  {/* Keyboard Shortcuts */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Keyboard Shortcuts</Label>
                      <p className="text-sm text-muted-foreground">
                        View and customize keyboard shortcuts
                      </p>
                    </div>
                    <Button variant="outline">
                      <Keyboard className="h-4 w-4 mr-2" />
                      View Shortcuts
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your email notification preferences
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Task Updates */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about your task updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, taskUpdates: checked }))
                      }
                    />
                  </div>
                  {/* Mentions */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mentions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone mentions you
                      </p>
                    </div>
                    <Switch
                      checked={notifications.mentions}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, mentions: checked }))
                      }
                    />
                  </div>
                  {/* Achievements */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Achievements</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new achievements
                      </p>
                    </div>
                    <Switch
                      checked={notifications.achievements}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, achievements: checked }))
                      }
                    />
                  </div>
                </div>
                <Separator />
                {/* Sound Settings */}
                <div>
                  <h3 className="text-lg font-medium">Sound Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure notification sounds
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Message Sounds */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Message Sounds</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sound when receiving messages
                      </p>
                    </div>
                    <Switch
                      checked={sounds.messageSound}
                      onCheckedChange={(checked) =>
                        setSounds(prev => ({ ...prev, messageSound: checked }))
                      }
                    />
                  </div>
                  {/* Notification Sounds */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notification Sounds</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sound for other notifications
                      </p>
                    </div>
                    <Switch
                      checked={sounds.notificationSound}
                      onCheckedChange={(checked) =>
                        setSounds(prev => ({ ...prev, notificationSound: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Theme Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize the appearance of your workspace
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle dark mode on or off
                      </p>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) =>
                        setTheme(checked ? "dark" : "light")
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Privacy Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Control your privacy preferences
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Online Status */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Online Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Show when you're online
                      </p>
                    </div>
                    <Switch
                      checked={privacy.onlineStatus}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, onlineStatus: checked }))
                      }
                    />
                  </div>
                  {/* Read Receipts */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Read Receipts</Label>
                      <p className="text-sm text-muted-foreground">
                        Show when you've read messages
                      </p>
                    </div>
                    <Switch
                      checked={privacy.readReceipts}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, readReceipts: checked }))
                      }
                    />
                  </div>
                  {/* Activity Status */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Activity Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Show your activity status
                      </p>
                    </div>
                    <Switch
                      checked={privacy.activityStatus}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, activityStatus: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-4 sm:p-6 border-destructive">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Irreversible and destructive actions
              </p>
            </div>
            <div className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="w-full sm:w-auto bg-destructive text-destructive-foreground">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
}
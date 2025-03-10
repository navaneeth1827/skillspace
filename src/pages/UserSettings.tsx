
import { useState } from "react";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { UserCircle, Bell, Moon, Sun, Shield, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import UserAvatar, { avatarOptions } from "@/components/UserAvatar";
import { toast } from "@/components/ui/use-toast";

const UserSettings = () => {
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    username: "alexjohnson",
    avatarUrl: avatarOptions[0].url,
    notificationsEnabled: true,
    darkModeEnabled: false,
    twoFactorEnabled: false
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setUser({ ...user, avatarUrl });
    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated.",
    });
  };
  
  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold mb-6 accent-gradient">Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle size={16} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Sun size={16} />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            Security
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 glass-card">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information here</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={user.name}
                        onChange={e => setUser({...user, name: e.target.value})}
                        className="bg-white/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={user.username}
                        onChange={e => setUser({...user, username: e.target.value})}
                        className="bg-white/5"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user.email}
                      onChange={e => setUser({...user, email: e.target.value})}
                      className="bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      rows={4}
                      className="w-full rounded-md border border-white/10 bg-white/5 p-2"
                      placeholder="Tell us a bit about yourself"
                    ></textarea>
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Choose your avatar</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <UserAvatar 
                  avatarUrl={user.avatarUrl} 
                  username={user.name}
                  size="xl"
                />
                
                <div className="grid grid-cols-3 gap-2">
                  {avatarOptions.map(avatar => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarChange(avatar.url)}
                      className={`rounded-md p-1 transition-all ${user.avatarUrl === avatar.url ? 'ring-2 ring-purple-400' : 'hover:bg-white/5'}`}
                    >
                      <UserAvatar 
                        avatarUrl={avatar.url} 
                        username={avatar.name}
                        size="sm"
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch 
                      checked={user.notificationsEnabled} 
                      onCheckedChange={(checked) => setUser({...user, notificationsEnabled: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Job Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified about new job opportunities</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Message Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <Button type="submit">Save Preferences</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun size={16} />
                    <Switch 
                      checked={user.darkModeEnabled} 
                      onCheckedChange={(checked) => setUser({...user, darkModeEnabled: checked})}
                    />
                    <Moon size={16} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account's security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch 
                    checked={user.twoFactorEnabled} 
                    onCheckedChange={(checked) => setUser({...user, twoFactorEnabled: checked})}
                  />
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" className="bg-white/5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" className="bg-white/5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" className="bg-white/5" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
                <Button variant="outline" className="border-red-400/30 text-red-400 hover:bg-red-950/20">
                  <LogOut size={16} className="mr-2" />
                  Sign Out of All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;

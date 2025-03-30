
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "./UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          const profileDataConverted: ProfileData = {
            id: data.id,
            full_name: data.full_name || "",
            title: data.title || "",
            location: data.location || "",
            bio: data.bio || "",
            hourly_rate: data.hourly_rate || 0,
            skills: typeof data.skills === 'string' && data.skills 
              ? data.skills.split(',').map(s => s.trim()) 
              : Array.isArray(data.skills) ? data.skills : [],
            avatar_url: data.avatar_url,
            user_type: data.user_type || "freelancer",
            company_name: data.company_name,
            website: data.website,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          
          setProfileData(profileDataConverted);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchProfileData();
  }, [user]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const displayName = profileData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = profileData?.avatar_url || null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="focus:outline-none">
        <UserAvatar username={displayName} avatarUrl={avatarUrl} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2 w-56 bg-navy-light/90 backdrop-blur-md border border-white/10">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

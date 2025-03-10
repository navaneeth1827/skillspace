
import { User, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const avatarOptions = [
  { id: "default", url: "/placeholder.svg", name: "Default" },
  { id: "cat", url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901", name: "Cat" },
  { id: "penguin", url: "https://images.unsplash.com/photo-1441057206919-63d19fac2369", name: "Penguin" },
  { id: "kitten", url: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1", name: "Kitten" },
  { id: "monkey", url: "https://images.unsplash.com/photo-1501286353178-1ec871214838", name: "Monkey" },
  { id: "fruit", url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9", name: "Fruit" },
];

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const UserAvatar = ({ 
  avatarUrl, 
  username = "User", 
  size = "md", 
  className 
}: UserAvatarProps) => {
  // Determine the size
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  // Determine the icon size
  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const initials = username
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], "border border-white/10", className)}>
      <AvatarImage 
        src={avatarUrl || ""} 
        alt={username} 
        className="object-cover"
      />
      <AvatarFallback className="bg-purple-900/50">
        {avatarUrl ? (
          <UserCircle size={iconSize[size]} className="text-purple-400" />
        ) : initials ? (
          initials
        ) : (
          <User size={iconSize[size]} className="text-purple-400" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;

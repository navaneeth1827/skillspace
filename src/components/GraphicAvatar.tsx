
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export type AvatarStyle = "abstract" | "identicon" | "initials" | "bottts" | "pixel";

export interface GraphicAvatarProps {
  username: string;
  style?: AvatarStyle;
  seed?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32"
};

const GraphicAvatar = ({
  username,
  style = "bottts",
  seed,
  size = "md",
  className,
  onClick,
  selected = false
}: GraphicAvatarProps) => {
  // Use username as seed if no custom seed is provided
  const finalSeed = seed || username;
  
  // Generate avatar URL based on style
  const getAvatarUrl = () => {
    switch (style) {
      case "abstract":
        return `https://avatars.dicebear.com/api/abstract/${finalSeed}.svg`;
      case "identicon":
        return `https://avatars.dicebear.com/api/identicon/${finalSeed}.svg`;
      case "initials":
        return `https://avatars.dicebear.com/api/initials/${finalSeed}.svg`;
      case "bottts":
        return `https://avatars.dicebear.com/api/bottts/${finalSeed}.svg`;
      case "pixel":
        return `https://avatars.dicebear.com/api/pixel-art/${finalSeed}.svg`;
      default:
        return `https://avatars.dicebear.com/api/bottts/${finalSeed}.svg`;
    }
  };
  
  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center bg-white/5 cursor-pointer transition-all",
        sizeClasses[size],
        onClick && "hover:ring-2 hover:ring-blue-400",
        selected && "ring-2 ring-blue-400",
        className
      )}
      onClick={onClick}
    >
      <img
        src={getAvatarUrl()}
        alt={`${username}'s avatar`}
        className="w-full h-full object-cover"
      />
      {selected && (
        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
          <Check className="text-blue-400" />
        </div>
      )}
    </div>
  );
};

export const AvatarSelector = ({
  username,
  selectedStyle,
  onSelect
}: {
  username: string;
  selectedStyle: AvatarStyle;
  onSelect: (style: AvatarStyle) => void;
}) => {
  const styles: AvatarStyle[] = ["abstract", "identicon", "initials", "bottts", "pixel"];
  
  return (
    <Card className="glass-card">
      <CardContent className="pt-6 pb-4">
        <div className="mb-4 flex justify-center">
          <GraphicAvatar
            username={username}
            style={selectedStyle}
            size="lg"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {styles.map((style) => (
            <GraphicAvatar
              key={style}
              username={username}
              style={style}
              size="sm"
              selected={style === selectedStyle}
              onClick={() => onSelect(style)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GraphicAvatar;


import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, CheckCircle } from "lucide-react";

interface ProfileImageUploadProps {
  userId: string;
  avatarUrl: string | null;
  username: string;
  onSuccess: (url: string) => Promise<void>;
}

export default function ProfileImageUpload({ 
  userId, 
  avatarUrl, 
  username,
  onSuccess
}: ProfileImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      setIsSuccess(false);
      
      const files = event.target.files;
      if (!files || files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/profile-${Math.random()}.${fileExt}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      await onSuccess(publicUrl);
      
      setIsSuccess(true);
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <UserAvatar 
        avatarUrl={avatarUrl} 
        username={username}
        size="xl"
        className={isUploading ? "opacity-50" : ""}
      />
      
      {/* Upload button */}
      <div className="absolute -bottom-2 -right-2">
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <div className="rounded-full bg-primary h-10 w-10 flex items-center justify-center hover:bg-primary/90 transition-colors">
            {isUploading ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : isSuccess ? (
              <CheckCircle size={18} className="text-white" />
            ) : (
              <Camera size={18} className="text-white" />
            )}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}

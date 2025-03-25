
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EducationSection from "./EducationSection";
import { EducationItem } from "@/types/profile";

interface AboutSectionProps {
  bio: string;
  education: EducationItem[];
  isEditing: boolean;
  onBioChange: (value: string) => void;
  onUpdateBio: () => Promise<boolean>;
  onAddEducation: (item: EducationItem) => Promise<any>;
  onUpdateEducation: (id: string, updates: Partial<EducationItem>) => Promise<boolean>;
  onDeleteEducation: (id: string) => Promise<boolean>;
}

export default function AboutSection({
  bio,
  education,
  isEditing,
  onBioChange,
  onUpdateBio,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation
}: AboutSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBio = async () => {
    setIsSaving(true);
    await onUpdateBio();
    setIsSaving(false);
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold mb-3">About Me</h3>
      
      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            className="min-h-[150px]"
            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
          />
          <Button 
            onClick={handleSaveBio} 
            disabled={isSaving} 
            size="sm"
          >
            {isSaving ? "Saving..." : "Save Bio"}
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground whitespace-pre-line">
          {bio || "No bio yet. Click Edit Profile to add one."}
        </p>
      )}
      
      <EducationSection
        items={education}
        isEditing={isEditing}
        onAdd={onAddEducation}
        onUpdate={onUpdateEducation}
        onDelete={onDeleteEducation}
      />
    </div>
  );
}

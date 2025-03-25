import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, Edit, MapPin, Plus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { useProfileData } from "@/hooks/useProfileData";
import PortfolioSection from "@/components/profile/PortfolioSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import ReviewsSection from "@/components/profile/ReviewsSection";
import AboutSection from "@/components/profile/AboutSection";
import ProfileImageUpload from "@/components/profile/ProfileImageUpload";
import UserAvatar from "@/components/UserAvatar";

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvailableForWork, setIsAvailableForWork] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    title: "",
    location: "",
    bio: "",
    hourly_rate: 0,
    skills: [],
    avatar_url: null,
    user_type: "freelancer"
  });
  
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  
  const {
    isLoading: isProfileDataLoading,
    portfolio,
    experience,
    education,
    reviews,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    addExperienceItem,
    updateExperienceItem,
    deleteExperienceItem,
    addEducationItem,
    updateEducationItem,
    deleteEducationItem
  } = useProfileData(user?.id);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
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
          const skillsArray = Array.isArray(data.skills) 
            ? data.skills 
            : data.skills 
              ? typeof data.skills === 'string' 
                ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
                : []
              : [];
              
          const profileDataFormatted: ProfileData = {
            full_name: data.full_name || "",
            title: data.title || "",
            location: data.location || "",
            bio: data.bio || "",
            hourly_rate: data.hourly_rate || 0,
            skills: skillsArray,
            avatar_url: data.avatar_url,
            user_type: data.user_type || "freelancer"
          };
          
          setProfileData(profileDataFormatted);
          setName(profileDataFormatted.full_name);
          setTitle(profileDataFormatted.title || "");
          setLocation(profileDataFormatted.location || "");
          setBio(profileDataFormatted.bio || "");
          setHourlyRate(profileDataFormatted.hourly_rate?.toString() || "");
          setSkills(Array.isArray(profileDataFormatted.skills) ? profileDataFormatted.skills : []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleUpdateAvatar = async (avatarUrl: string): Promise<void> => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      setProfileData(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));
      
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const skillsString = skills.join(',');
      
      const updates = {
        id: user.id,
        full_name: name,
        location,
        bio,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        skills: skillsString,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setProfileData(prev => ({
        ...prev,
        full_name: name,
        title,
        location,
        bio,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        skills
      }));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleUpdateBio = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        toast({
          title: "Error updating bio",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      setProfileData(prev => ({
        ...prev,
        bio
      }));
      
      toast({
        title: "Bio updated",
        description: "Your bio has been successfully updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Please sign in to view your profile</h1>
            <p className="text-muted-foreground">You need to be logged in to access this page.</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Profile" : "My Profile"}
            </h1>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
          
          {isLoading || isProfileDataLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1">
                <div className="glass-card p-6 mb-6">
                  <div className="flex flex-col items-center text-center">
                    {isEditing ? (
                      <ProfileImageUpload
                        userId={user.id}
                        avatarUrl={profileData.avatar_url}
                        username={profileData.full_name}
                        onSuccess={handleUpdateAvatar}
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full glass-card flex items-center justify-center mb-4 relative">
                        <UserAvatar 
                          avatarUrl={profileData.avatar_url} 
                          username={profileData.full_name}
                          size="xl"
                        />
                      </div>
                    )}
                    
                    {isEditing ? (
                      <div className="w-full space-y-4 mt-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="title">Professional Title</Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold">{profileData.full_name}</h2>
                        <p className="text-navy-accent mt-1">{profileData.title || "Add your professional title"}</p>
                        <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center">
                          <MapPin size={14} className="mr-1" />
                          {profileData.location || "Add your location"}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="border-t border-white/10 mt-6 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Available for work</span>
                      <Switch
                        checked={isAvailableForWork}
                        onCheckedChange={setIsAvailableForWork}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Hourly Rate:</span>
                        {isEditing ? (
                          <div className="flex w-20">
                            <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-white/20 bg-navy-light">
                              $
                            </span>
                            <Input
                              type="number"
                              min="1"
                              value={hourlyRate}
                              onChange={(e) => setHourlyRate(e.target.value)}
                              className="rounded-l-none w-full"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-medium">${profileData.hourly_rate || "0"}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Jobs Completed:</span>
                        <span className="text-sm font-medium">{reviews.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Rating:</span>
                        <span className="text-sm font-medium flex items-center">
                          {reviews.length > 0 
                            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
                            : "N/A"}
                          {reviews.length > 0 && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 ml-1" />}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-3">Skills</h3>
                  
                  {isEditing && (
                    <div className="flex mb-3">
                      <Input
                        placeholder="Add a skill"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        className="flex-1 mr-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <Button size="sm" onClick={handleAddSkill}>
                        <Plus size={16} />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <Badge 
                          key={skill} 
                          className="bg-navy-accent/20 hover:bg-navy-accent/30 text-navy-accent"
                        >
                          {skill}
                          {isEditing && (
                            <button 
                              className="ml-1 text-navy-accent/70 hover:text-navy-accent"
                              onClick={() => handleRemoveSkill(skill)}
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <Tabs defaultValue="about">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about">
                    <AboutSection
                      bio={bio}
                      education={education}
                      isEditing={isEditing}
                      onBioChange={setBio}
                      onUpdateBio={handleUpdateBio}
                      onAddEducation={addEducationItem}
                      onUpdateEducation={updateEducationItem}
                      onDeleteEducation={deleteEducationItem}
                    />
                  </TabsContent>
                  
                  <TabsContent value="portfolio">
                    <PortfolioSection
                      items={portfolio}
                      isEditing={isEditing}
                      onAdd={addPortfolioItem}
                      onUpdate={updatePortfolioItem}
                      onDelete={deletePortfolioItem}
                    />
                  </TabsContent>
                  
                  <TabsContent value="experience">
                    <ExperienceSection
                      items={experience}
                      isEditing={isEditing}
                      onAdd={addExperienceItem}
                      onUpdate={updateExperienceItem}
                      onDelete={deleteExperienceItem}
                    />
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <ReviewsSection
                      reviews={reviews}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Profile;

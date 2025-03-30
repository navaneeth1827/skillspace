import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/validations/profile";
import PortfolioForm from "@/components/PortfolioForm";
import ExperienceForm from "@/components/ExperienceForm";
import EducationForm from "@/components/EducationForm";
import ReviewCard from "@/components/ReviewCard";
import { parseSkills } from "@/types/profile";

import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileData, PortfolioItem, ExperienceItem, EducationItem } from "@/types/profile";
import { Briefcase, Calendar, Edit, MapPin, Save, X } from "lucide-react";
import PortfolioSection from "@/components/profile/PortfolioSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";

type ProfileFormValues = {
  id: string;
  full_name: string;
  title?: string;
  location?: string;
  bio?: string;
  hourly_rate?: number;
  skills?: string[];
  avatar_url?: string | null;
  user_type: string;
  company_name?: string | null;
  website?: string | null;
  created_at?: string;
  updated_at?: string;
};

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Determine if this is the user's own profile
  const isOwnProfile = user?.id === userId || (!userId && user);
  const profileId = userId || user?.id;
  
  // Initialize the form with profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      id: "",
      full_name: "",
      title: "",
      location: "",
      bio: "",
      hourly_rate: 0,
      skills: [],
      avatar_url: null,
      user_type: "freelancer",
      company_name: null,
      website: null
    }
  });
  
  // Get portfolio, experience, education, and reviews data
  const {
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
  } = useProfileData(profileId);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profileId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error",
            description: "Failed to load profile data. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          const profileDataFormatted = {
            id: data.id,
            full_name: data.full_name || "",
            title: data.title || "",
            location: data.location || "",
            bio: data.bio || "",
            hourly_rate: data.hourly_rate || 0,
            skills: parseSkills(data.skills),
            avatar_url: data.avatar_url,
            user_type: data.user_type || "freelancer",
            company_name: data.company_name,
            website: data.website,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          
          setProfileData(profileDataFormatted);
          setOriginalProfileData(profileDataFormatted);

          // Set form state if this is the user's own profile
          if (isOwnProfile) {
            form.reset(profileDataFormatted);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [profileId, toast, isOwnProfile, form]);

  const handleFormSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true);

      // Format skills array properly
      let skillsArray = values.skills || [];
      if (typeof values.skills === 'string') {
        skillsArray = parseSkills(values.skills);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          title: values.title,
          bio: values.bio,
          location: values.location,
          hourly_rate: values.hourly_rate,
          skills: skillsArray,
          user_type: values.user_type,
          company_name: values.company_name,
          website: values.website
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setProfileData({
        ...profileData!,
        ...values,
        skills: skillsArray
      });
      
      setOriginalProfileData({
        ...profileData!,
        ...values,
        skills: skillsArray
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original data
    if (originalProfileData) {
      form.reset(originalProfileData);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-navy-accent rounded-full border-t-transparent"></div>
            </div>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Profile not found.</p>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Sidebar */}
            <div className="md:col-span-1">
              <div className="glass-card p-6 text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profileData.avatar_url || undefined} alt={profileData.full_name} />
                    <AvatarFallback className="text-3xl">{profileData.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isOwnProfile && isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Avatar</span>
                    </Button>
                  )}
                </div>
                
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 text-left">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Title</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hourly_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value || ''} 
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{profileData.full_name}</h1>
                    {profileData.title && <p className="text-muted-foreground mt-1">{profileData.title}</p>}
                    
                    <div className="mt-4 space-y-2">
                      {profileData.location && (
                        <div className="flex items-center justify-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{profileData.location}</span>
                        </div>
                      )}
                      
                      {profileData.hourly_rate && profileData.hourly_rate > 0 && (
                        <div className="flex items-center justify-center text-sm">
                          <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>${profileData.hourly_rate}/hr</span>
                        </div>
                      )}
                      
                      {profileData.created_at && (
                        <div className="flex items-center justify-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Member since {new Date(profileData.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {isOwnProfile && (
                      <Button 
                        className="mt-4" 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </>
                )}
              </div>
              
              {/* Skills Section */}
              <div className="glass-card p-6 mt-6">
                <h2 className="font-semibold mb-4">Skills</h2>
                
                {isEditing ? (
                  <Form {...form}>
                    <form className="space-y-4">
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills (comma separated)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value?.join(', ') || ''} 
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value.split(',').map(s => s.trim()).filter(Boolean));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills && profileData.skills.length > 0 ? (
                      profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No skills listed yet.</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Bio Section */}
              <div className="glass-card p-6 mt-6">
                <h2 className="font-semibold mb-4">About</h2>
                
                {isEditing ? (
                  <Form {...form}>
                    <form className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                value={field.value || ''} 
                                placeholder="Write a short bio about yourself..."
                                rows={6}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {profileData.bio ? (
                      <p className="text-muted-foreground">{profileData.bio}</p>
                    ) : (
                      <p className="text-muted-foreground text-sm">No bio available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  {/* Portfolio Preview */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Portfolio</h2>
                      {portfolio.length > 0 && (
                        <Button 
                          variant="link" 
                          onClick={() => setActiveTab("portfolio")}
                        >
                          View All
                        </Button>
                      )}
                    </div>
                    
                    {portfolio.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.slice(0, 2).map((item, index) => (
                          <div 
                            key={item.id || index} 
                            className="glass-card overflow-hidden"
                          >
                            <div className="aspect-video w-full relative overflow-hidden">
                              <img 
                                src={item.image_url || "/placeholder.svg"} 
                                alt={item.title} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No portfolio items added yet.</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Experience Preview */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Experience</h2>
                      {experience.length > 0 && (
                        <Button 
                          variant="link" 
                          onClick={() => setActiveTab("experience")}
                        >
                          View All
                        </Button>
                      )}
                    </div>
                    
                    {experience.length > 0 ? (
                      <div className="space-y-4">
                        {experience.slice(0, 2).map((item, index) => (
                          <div 
                            key={item.id || index} 
                            className="glass-card p-4"
                          >
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-navy-accent text-sm">{item.company}</p>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin size={12} className="mr-1" />
                              <span>{item.location}</span>
                              <span className="mx-2">•</span>
                              <span>{item.end_date ? `${item.start_date} - ${item.end_date}` : `${item.start_date} - Present`}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No experience added yet.</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Education Preview */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Education</h2>
                    </div>
                    
                    {education.length > 0 ? (
                      <div className="space-y-4">
                        {education.map((item, index) => (
                          <div 
                            key={item.id || index} 
                            className="glass-card p-4"
                          >
                            <h3 className="font-medium">{item.degree}</h3>
                            <p className="text-navy-accent text-sm">{item.school}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.year_range}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No education added yet.</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Reviews Preview */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Reviews</h2>
                      {reviews.length > 0 && (
                        <Button 
                          variant="link" 
                          onClick={() => setActiveTab("reviews")}
                        >
                          View All
                        </Button>
                      )}
                    </div>
                    
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.slice(0, 2).map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No reviews yet.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="portfolio">
                  <PortfolioSection 
                    items={portfolio}
                    isEditing={isOwnProfile}
                    onAdd={addPortfolioItem}
                    onUpdate={updatePortfolioItem}
                    onDelete={deletePortfolioItem}
                  />
                </TabsContent>
                
                <TabsContent value="experience">
                  <ExperienceSection 
                    items={experience}
                    isEditing={isOwnProfile}
                    onAdd={addExperienceItem}
                    onUpdate={updateExperienceItem}
                    onDelete={deleteExperienceItem}
                  />
                  
                  <EducationSection 
                    items={education}
                    isEditing={isOwnProfile}
                    onAdd={addEducationItem}
                    onUpdate={updateEducationItem}
                    onDelete={deleteEducationItem}
                  />
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="glass-card p-6">
                    <h2 className="font-semibold mb-6">Client Reviews</h2>
                    
                    {reviews.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No reviews yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Profile;

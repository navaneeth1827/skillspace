import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { format } from "date-fns";

import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData, PortfolioItem, ExperienceItem, EducationItem, ReviewItem } from "@/types/profile";
import { profileSchema } from "@/lib/validations/profile";
import PortfolioForm from "@/components/PortfolioForm";
import ExperienceForm from "@/components/ExperienceForm";
import EducationForm from "@/components/EducationForm";
import ReviewCard from "@/components/ReviewCard";
import { useProfileData } from "@/hooks/useProfileData";

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [selectedExperienceItem, setSelectedExperienceItem] = useState<ExperienceItem | null>(null);
  const [selectedEducationItem, setSelectedEducationItem] = useState<EducationItem | null>(null);
  const {
    isLoading,
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
  
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      id: user?.id || "",
      full_name: "",
      title: "",
      location: "",
      bio: "",
      hourly_rate: 0,
      skills: [],
      avatar_url: "",
      user_type: "freelancer",
      company_name: "",
      website: "",
      created_at: "",
      updated_at: ""
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    if (!user) return;
    
    const fetchProfileData = async () => {
      setLoading(true);
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
          // Handle skills properly with better type checking
          let skillsArray: string[] = [];
          if (Array.isArray(data.skills)) {
            skillsArray = data.skills;
          } else if (data.skills) {
            if (typeof data.skills === 'string') {
              skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
            }
          }
          
          const profileDataConverted: ProfileData = {
            id: data.id,
            full_name: data.full_name || "",
            title: data.title || "",
            location: data.location || "",
            bio: data.bio || "",
            hourly_rate: data.hourly_rate || 0,
            skills: skillsArray,
            avatar_url: data.avatar_url,
            user_type: data.user_type || "freelancer",
            company_name: data.company_name,
            website: data.website,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          
          setProfileData(profileDataConverted);
          setAvatarUrl(data.avatar_url || null);
          form.reset(profileDataConverted);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, form]);
  
  const onSubmit = async (data: ProfileData) => {
    if (!user) return;
    
    try {
      // Convert skills to array if it's a string
      let skillsArray: string[] = [];
      if (Array.isArray(data.skills)) {
        skillsArray = data.skills;
      } else if (data.skills) {
        if (typeof data.skills === 'string') {
          skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      
      const formData = { 
        ...data,
        skills: skillsArray
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setProfileData(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      setIsEditMode(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }
    
    try {
      const filePath = `avatars/${user.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        toast({
          title: "Error",
          description: "Failed to upload avatar. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
      setAvatarUrl(publicURL);
      
      // Update the profile data with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicURL })
        .eq('id', user.id);
        
      if (updateError) {
        console.error("Error updating profile with avatar URL:", updateError);
        toast({
          title: "Error",
          description: "Failed to update profile with avatar. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setProfileData(prev => ({ ...prev, avatar_url: publicURL }) as ProfileData);
      form.setValue("avatar_url", publicURL);
      toast({
        title: "Success",
        description: "Avatar uploaded successfully.",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-navy-accent"></div>
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-muted-foreground">
          No profile data found.
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-20 border-b border-white/5">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Header */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      {isEditMode ? "Edit your profile details." : "View your profile details."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 relative">
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={profileData?.full_name} className="object-cover" />
                      <AvatarFallback>{profileData?.full_name?.charAt(0)}</AvatarFallback>
                      {isEditMode && (
                        <Label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-muted hover:bg-muted-foreground text-muted-foreground hover:text-secondary rounded-full p-2 cursor-pointer transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.713 1.037h1.49a5.25 5.25 0 002.214-1.32L19.513 8.199z" />
                          </svg>
                          <Input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            onChange={handleAvatarUpload}
                            accept="image/*"
                          />
                        </Label>
                      )}
                    </Avatar>
                    <div className="space-y-2 text-center mt-4">
                      <h3 className="text-xl font-semibold">{profileData?.full_name}</h3>
                      <p className="text-muted-foreground">{profileData?.title || "No title"}</p>
                      <p className="text-muted-foreground">
                        <CalendarIcon className="mr-2 inline-block h-4 w-4" />
                        {profileData?.location || "No location"}
                      </p>
                      {profileData?.website && (
                        <Link to={profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">
                          Website
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </Link>
                      )}
                      <div className="flex gap-2">
                        <a href="#" className="hover:text-primary">
                          <Github className="h-5 w-5" />
                        </a>
                        <a href="#" className="hover:text-primary">
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a href="#" className="hover:text-primary">
                          <Twitter className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                    
                    {/* Edit Button */}
                    {!isEditMode ? (
                      <Button onClick={() => setIsEditMode(true)} className="mt-4 w-full">
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex justify-between w-full mt-4">
                        <Button variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                          Save
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Profile Form */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>
                      {isEditMode ? "Update your personal details." : "View your personal details."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input disabled={!isEditMode} placeholder="Your full name" {...field} />
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
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input disabled={!isEditMode} placeholder="Your title" {...field} />
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
                                <Input disabled={!isEditMode} placeholder="Your location" {...field} />
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
                              <FormLabel>Hourly Rate</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  disabled={!isEditMode}
                                  placeholder="Your hourly rate"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skills</FormLabel>
                              <FormControl>
                                <Input disabled={!isEditMode} placeholder="Your skills (comma-separated)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea disabled={!isEditMode} placeholder="Write something about yourself." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Portfolio Section */}
            <section className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-tighter">Portfolio</h2>
                <Button onClick={() => {
                  setSelectedPortfolioItem(null);
                  setIsPortfolioModalOpen(true);
                }}>
                  Add Portfolio Item
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-navy-accent"></div>
                </div>
              ) : portfolio.length === 0 ? (
                <p className="text-muted-foreground">No portfolio items added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>
                          {item.description?.substring(0, 50) || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {item.image_url && (
                          <img src={item.image_url} alt={item.title} className="rounded-md mb-4 h-32 w-full object-cover" />
                        )}
                        {item.link && (
                          <Link to={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">
                            View Project
                            <ExternalLink className="ml-1 h-4 w-4" />
                          </Link>
                        )}
                        <div className="flex justify-end mt-4">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPortfolioItem(item);
                              setIsPortfolioModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.id && window.confirm("Are you sure you want to delete this item?")) {
                                deletePortfolioItem(item.id);
                              }
                            }}
                            className="ml-2"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
            
            {/* Experience Section */}
            <section className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-tighter">Experience</h2>
                <Button onClick={() => {
                  setSelectedExperienceItem(null);
                  setIsExperienceModalOpen(true);
                }}>
                  Add Experience
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-navy-accent"></div>
                </div>
              ) : experience.length === 0 ? (
                <p className="text-muted-foreground">No experience items added yet.</p>
              ) : (
                <div className="space-y-4">
                  {experience.map((item) => (
                    <Accordion type="single" collapsible key={item.id} className="w-full">
                      <AccordionItem value={item.id}>
                        <AccordionTrigger>
                          <div className="flex justify-between w-full">
                            <div>
                              <h3 className="text-lg font-semibold">{item.title}</h3>
                              <p className="text-muted-foreground">{item.company}</p>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="secondary">{item.start_date} - {item.end_date || 'Present'}</Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{item.description || 'No description provided.'}</p>
                          <div className="flex justify-end mt-4">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExperienceItem(item);
                                setIsExperienceModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.id && window.confirm("Are you sure you want to delete this item?")) {
                                  deleteExperienceItem(item.id);
                                }
                              }}
                              className="ml-2"
                            >
                              Delete
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              )}
            </section>
            
            {/* Education Section */}
            <section className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-tighter">Education</h2>
                <Button onClick={() => {
                  setSelectedEducationItem(null);
                  setIsEducationModalOpen(true);
                }}>
                  Add Education
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-navy-accent"></div>
                </div>
              ) : education.length === 0 ? (
                <p className="text-muted-foreground">No education items added yet.</p>
              ) : (
                <div className="space-y-4">
                  {education.map((item) => (
                    <Accordion type="single" collapsible key={item.id} className="w-full">
                      <AccordionItem value={item.id}>
                        <AccordionTrigger>
                          <div className="flex justify-between w-full">
                            <div>
                              <h3 className="text-lg font-semibold">{item.degree}</h3>
                              <p className="text-muted-foreground">{item.school}</p>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="secondary">{item.year_range}</Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex justify-end mt-4">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEducationItem(item);
                                setIsEducationModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.id && window.confirm("Are you sure you want to delete this item?")) {
                                  deleteEducationItem(item.id);
                                }
                              }}
                              className="ml-2"
                            >
                              Delete
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              )}
            </section>
            
            {/* Reviews Section */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold tracking-tighter mb-4">Reviews</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-navy-accent"></div>
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
      
      <FooterSection />
      
      {/* Portfolio Modal */}
      <PortfolioForm
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        onSubmit={async (item) => {
          if (item.id) {
            await updatePortfolioItem(item.id, item);
            toast({
              title: "Success",
              description: "Portfolio item updated successfully.",
            });
          } else {
            await addPortfolioItem(item);
            toast({
              title: "Success",
              description: "Portfolio item added successfully.",
            });
          }
          setIsPortfolioModalOpen(false);
        }}
        item={selectedPortfolioItem}
      />
      
      {/* Experience Modal */}
      <ExperienceForm
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        onSubmit={async (item) => {
          if (item.id) {
            await updateExperienceItem(item.id, item);
            toast({
              title: "Success",
              description: "Experience item updated successfully.",
            });
          } else {
            await addExperienceItem(item);
            toast({
              title: "Success",
              description: "Experience item added successfully.",
            });
          }
          setIsExperienceModalOpen(false);
        }}
        item={selectedExperienceItem}
      />
      
      {/* Education Modal */}
      <EducationForm
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        onSubmit={async (item) => {
          if (item.id) {
            await updateEducationItem(item.id, item);
            toast({
              title: "Success",
              description: "Education item updated successfully.",
            });
          } else {
            await addEducationItem(item);
            toast({
              title: "Success",
              description: "Education item added successfully.",
            });
          }
          setIsEducationModalOpen(false);
        }}
        item={selectedEducationItem}
      />
    </div>
  );
};

export default Profile;

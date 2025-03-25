
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AnimatedCard from "@/components/AnimatedCard";
import { Briefcase, DollarSign, Edit, MapPin, Plus, Star, Trophy, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserAvatar from "@/components/UserAvatar";

type ProfileData = {
  full_name: string;
  title?: string;
  location?: string;
  bio?: string;
  hourly_rate?: number;
  skills?: string[];
  avatar_url?: string | null;
  user_type?: string;
};

// Sample data for education, experience, portfolio, and completed jobs
// These would ideally come from the database in a real implementation
const sampleData = {
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      year: "2016 - 2020"
    }
  ],
  experience: [
    {
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      period: "Jan 2022 - Present",
      description: "Lead frontend development for multiple projects. Implemented performance optimizations that resulted in 40% faster page loads."
    },
    {
      title: "Frontend Developer",
      company: "StartupX",
      location: "Remote",
      period: "Mar 2020 - Dec 2021",
      description: "Built responsive user interfaces using React and TypeScript. Collaborated with UX designers to implement pixel-perfect designs."
    }
  ],
  portfolio: [
    {
      title: "E-commerce Platform",
      description: "A modern e-commerce platform built with React, Next.js and GraphQL",
      image: "/placeholder.svg",
      link: "#"
    },
    {
      title: "Project Management Tool",
      description: "Collaborative tool for teams to manage projects efficiently",
      image: "/placeholder.svg",
      link: "#"
    },
    {
      title: "Healthcare Dashboard",
      description: "Analytics dashboard for healthcare providers",
      image: "/placeholder.svg",
      link: "#"
    }
  ],
  completedJobs: [
    {
      title: "React Dashboard UI Development",
      client: "DataViz Corp",
      completedDate: "Aug 2023",
      rating: 5,
      review: "John delivered exceptional work. He understood our requirements perfectly and provided valuable suggestions. Will definitely work with him again."
    },
    {
      title: "E-commerce Website Optimization",
      client: "Fashion Retailer",
      completedDate: "May 2023",
      rating: 4.8,
      review: "Great work on the performance optimization. Our page load times decreased significantly."
    }
  ]
};

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvailableForWork, setIsAvailableForWork] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile state
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
  
  // Form states
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  
  // Fetch user profile data
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
          setProfileData(data);
          setName(data.full_name || "");
          setTitle(data.title || "");
          setLocation(data.location || "");
          setBio(data.bio || "");
          setHourlyRate(data.hourly_rate?.toString() || "");
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const updates = {
        id: user.id,
        full_name: name,
        title,
        location,
        bio,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        skills,
        updated_at: new Date()
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
      
      // Update local state with new data
      setProfileData(prev => ({
        ...prev,
        ...updates
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
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Sidebar */}
              <div className="col-span-1">
                <div className="glass-card p-6 mb-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-32 w-32 rounded-full glass-card flex items-center justify-center mb-4 relative">
                      <UserAvatar 
                        avatarUrl={profileData.avatar_url} 
                        username={profileData.full_name}
                        size="xl"
                      />
                      {isEditing && (
                        <Button variant="outline" size="sm" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0">
                          <Edit size={14} />
                        </Button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="w-full space-y-4">
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
                        <span className="text-sm font-medium">{sampleData.completedJobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Rating:</span>
                        <span className="text-sm font-medium flex items-center">
                          4.9
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Skills Section */}
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
              
              {/* Main Profile Content */}
              <div className="col-span-2">
                <Tabs defaultValue="about">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  {/* About Tab */}
                  <TabsContent value="about">
                    <div className="glass-card p-6">
                      <h3 className="font-semibold mb-3">About Me</h3>
                      
                      {isEditing ? (
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="min-h-[150px]"
                          placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                        />
                      ) : (
                        <p className="text-muted-foreground whitespace-pre-line">
                          {profileData.bio || "No bio yet. Click Edit Profile to add one."}
                        </p>
                      )}
                      
                      <h3 className="font-semibold mt-6 mb-3">Education</h3>
                      {sampleData.education.map((edu, index) => (
                        <div key={index} className="mb-4">
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-muted-foreground text-sm">{edu.school}</p>
                          <p className="text-muted-foreground text-sm">{edu.year}</p>
                        </div>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm" className="mt-2">
                          <Plus size={14} className="mr-1" />
                          Add Education
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Portfolio Tab */}
                  <TabsContent value="portfolio">
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Portfolio Projects</h3>
                        {isEditing && (
                          <Button size="sm">
                            <Plus size={14} className="mr-1" />
                            Add Project
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sampleData.portfolio.map((project, index) => (
                          <AnimatedCard
                            key={index}
                            className="hover-shadow overflow-hidden"
                            delay={`${index * 0.1}s`}
                          >
                            <div className="aspect-video w-full relative overflow-hidden rounded-t-lg">
                              <img 
                                src={project.image} 
                                alt={project.title} 
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                              />
                            </div>
                            <div className="p-4">
                              <h4 className="font-medium text-lg">{project.title}</h4>
                              <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
                              <div className="mt-3">
                                <Button size="sm" asChild>
                                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                                    View Project
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </AnimatedCard>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Experience Tab */}
                  <TabsContent value="experience">
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Work Experience</h3>
                        {isEditing && (
                          <Button size="sm">
                            <Plus size={14} className="mr-1" />
                            Add Experience
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        {sampleData.experience.map((exp, index) => (
                          <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-navy-accent">
                            <h4 className="font-medium">{exp.title}</h4>
                            <p className="text-navy-accent text-sm">{exp.company}</p>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin size={12} className="mr-1" />
                              <span>{exp.location}</span>
                              <span className="mx-2">•</span>
                              <span>{exp.period}</span>
                            </div>
                            <p className="text-muted-foreground mt-2">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Reviews Tab */}
                  <TabsContent value="reviews">
                    <div className="glass-card p-6">
                      <h3 className="font-semibold mb-6">Client Reviews</h3>
                      
                      <div className="space-y-6">
                        {sampleData.completedJobs.map((job, index) => (
                          <div key={index} className="border-b border-white/10 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{job.title}</h4>
                                <p className="text-navy-accent text-sm">{job.client}</p>
                                <p className="text-muted-foreground text-sm">{job.completedDate}</p>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-1 font-medium">{job.rating}</span>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={14} 
                                      className={`${i < Math.floor(job.rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-500"}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-muted-foreground italic">"{job.review}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {sampleData.completedJobs.length === 0 && (
                        <div className="text-center py-8">
                          <Trophy className="h-12 w-12 text-navy-accent mx-auto mb-3" />
                          <h4 className="text-lg font-medium">No reviews yet</h4>
                          <p className="text-muted-foreground mt-1">
                            Complete jobs to start collecting client reviews.
                          </p>
                        </div>
                      )}
                    </div>
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

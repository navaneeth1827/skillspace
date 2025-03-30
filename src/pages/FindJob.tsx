import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/Button";
import { Briefcase, DollarSign, MapPin, Search, Star } from "lucide-react";
import AnimatedCard from "@/components/AnimatedCard";
import UserAvatar from "@/components/UserAvatar";
import { parseSkills } from "@/types/profile";

const FindJob = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    jobType: "all",
    location: "all",
    salary: "all"
  });

  useEffect(() => {
    const fetchProfileData = async () => {
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
          const profileDataFormatted = {
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
            updated_at: data.updated_at,
            id: data.id
          };
          
          setProfileData(profileDataFormatted);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const jobListings = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp",
      location: "Remote",
      salary: "$100k - $130k",
      posted: "2 days ago",
      description: "We're looking for an experienced React developer...",
      tags: ["React", "TypeScript", "Redux"],
      matchScore: 94
    },
    {
      id: 2,
      title: "Frontend Engineer",
      company: "StartupX",
      location: "New York, NY",
      salary: "$90k - $120k",
      posted: "5 days ago",
      description: "Join our team building the next generation of web apps...",
      tags: ["JavaScript", "Vue.js", "CSS"],
      matchScore: 82
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <div className="glass-card p-6 mb-6">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin h-6 w-6 border-2 border-navy-accent rounded-full border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <UserAvatar 
                      username={profileData?.full_name || "User"} 
                      avatarUrl={profileData?.avatar_url} 
                      size="lg" 
                      className="mb-4"
                    />
                    <h2 className="font-bold text-xl">{profileData?.full_name || "User"}</h2>
                    <p className="text-sm text-muted-foreground">{profileData?.title || "Professional"}</p>
                    
                    {profileData?.location && (
                      <p className="text-xs flex items-center justify-center mt-2">
                        <MapPin size={12} className="mr-1" />
                        {profileData.location}
                      </p>
                    )}
                  </div>
                )}
                
                {!isLoading && profileData?.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-medium mb-2">Your Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          className="bg-navy-accent/20 hover:bg-navy-accent/30 text-navy-accent"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Type</label>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Salary Range</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Find Your Next Job</h1>
              </div>
              
              <div className="relative mb-6">
                <Input
                  placeholder="Search for jobs by title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Button 
                  size="sm" 
                  className="absolute right-2 top-2"
                  variant="ghost"
                >
                  Advanced Search
                </Button>
              </div>
              
              <div className="space-y-4">
                {jobListings.map((job, index) => (
                  <AnimatedCard
                    key={job.id}
                    className="hover-shadow"
                    delay={`${index * 0.05}s`}
                  >
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          {job.matchScore > 90 && (
                            <Badge className="bg-navy-accent text-navy font-medium">
                              <Star className="mr-1 h-3 w-3 fill-current" /> 
                              Top Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{job.company}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                            <Briefcase className="mr-1 h-3 w-3" />
                            Full-time
                          </div>
                          <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                            <MapPin className="mr-1 h-3 w-3" />
                            {job.location}
                          </div>
                          <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                            <DollarSign className="mr-1 h-3 w-3" />
                            {job.salary}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.tags.map((tag) => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between items-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          Posted {job.posted}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8"
                          >
                            <Star className="h-3.5 w-3.5 mr-1" />
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default FindJob;

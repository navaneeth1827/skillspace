import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Briefcase, DollarSign, Filter, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Button from "@/components/Button";
import AnimatedCard from "@/components/AnimatedCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface JobApplication {
  job_id: string;
  user_id: string;
  cover_letter: string;
}

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all-types");
  const [selectedCategory, setSelectedCategory] = useState<string>("all-categories");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching jobs:", error);
          return;
        }

        if (data) {
          const transformedJobs = data.map(item => {
            return {
              id: item.id,
              title: item.title,
              company: item.company || 'Unknown Company',
              location: item.location || 'Remote',
              job_type: item.job_type || 'Full-time',
              salary: item.budget_min && item.budget_max ? 
                `$${item.budget_min} - $${item.budget_max}` : 
                (item.salary || 'Competitive'),
              category: item.category || 'Development',
              description: item.description || '',
              skills: item.skills || [],
              recruiter_id: item.recruiter_id,
              status: item.status || 'active',
              budget_min: item.budget_min,
              budget_max: item.budget_max,
              created_at: item.created_at,
              updated_at: item.updated_at
            };
          });
          setJobs(transformedJobs as Job[]);
          
          const tagsSet = new Set<string>();
          transformedJobs.forEach(job => {
            job.skills?.forEach(skill => {
              tagsSet.add(skill);
            });
          });
          setAllTags(Array.from(tagsSet));
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Fetch user's applied jobs
    const fetchAppliedJobs = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('user_id', user.id);
          
        if (error) {
          console.error("Error fetching applied jobs:", error);
          return;
        }
        
        if (data) {
          setAppliedJobs(data.map(item => item.job_id));
        }
      } catch (error) {
        console.error("Failed to fetch applied jobs:", error);
      }
    };
    
    fetchAppliedJobs();

    const channel = supabase
      .channel('public:jobs')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'jobs' 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedJob) return;
    
    if (!coverLetter.trim()) {
      toast({
        title: "Cover Letter Required",
        description: "Please provide a cover letter for your application",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsApplying(true);
      
      const application: JobApplication = {
        job_id: selectedJob.id,
        user_id: user.id,
        cover_letter: coverLetter.trim()
      };
      
      const { error } = await supabase
        .from('job_applications')
        .insert(application);
        
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Applied",
            description: "You have already applied for this job",
            variant: "destructive"
          });
        } else {
          console.error("Error applying for job:", error);
          throw error;
        }
      } else {
        toast({
          title: "Application Submitted",
          description: "Your job application has been submitted successfully"
        });
        
        // Update the applied jobs list
        setAppliedJobs([...appliedJobs, selectedJob.id]);
        
        // Close the dialog and reset form
        setShowApplyDialog(false);
        setCoverLetter("");
        setSelectedJob(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      selectedType === "all-types" || 
      job.job_type === selectedType;
    
    const matchesCategory = 
      selectedCategory === "all-categories" || 
      job.category === selectedCategory;
    
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some(tag => job.skills.includes(tag));
    
    return matchesSearch && matchesType && matchesCategory && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };

  const openApplyDialog = (job: Job) => {
    setSelectedJob(job);
    setShowApplyDialog(true);
  };

  const clearFilters = () => {
    setSelectedType("all-types");
    setSelectedCategory("all-categories");
    setSelectedTags([]);
    setSearchTerm("");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-20 border-b border-white/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Find Your Next Job</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Browse through the latest opportunities matching your skills and interests
              </p>
            </div>
            
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, company, or keywords..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="min-w-[150px]">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="min-w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All Categories</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                
                {(selectedType !== "all-types" || selectedCategory !== "all-categories" || selectedTags.length > 0 || searchTerm) && (
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4" />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4 p-4 rounded-lg glass-card animate-fade-in">
                <h3 className="font-medium mb-3">Filter by skills</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <div 
                      key={tag} 
                      className="flex items-center space-x-2"
                    >
                      <Checkbox 
                        id={`tag-${tag}`} 
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      />
                      <Label 
                        htmlFor={`tag-${tag}`}
                        className="text-sm cursor-pointer"
                      >
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin h-8 w-8 border-2 border-navy-accent rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-6">
                    {filteredJobs.length} 
                    {filteredJobs.length === 1 ? ' Job' : ' Jobs'} Found
                  </h2>
                  
                  <div className="space-y-4">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job, index) => (
                        <AnimatedCard
                          key={job.id}
                          className="hover-shadow"
                          delay={`${index * 0.05}s`}
                        >
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <p className="text-muted-foreground">{job.company}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                                  <Briefcase className="mr-1 h-3 w-3" />
                                  {job.job_type}
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
                              
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {job.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mt-3">
                                {job.skills.slice(0, 5).map((tag) => (
                                  <span 
                                    key={tag} 
                                    className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {job.skills.length > 5 && (
                                  <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs">
                                    +{job.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col justify-between items-end gap-2">
                              <span className="text-xs text-muted-foreground">
                                Posted {formatDate(job.created_at || '')}
                              </span>
                              {appliedJobs.includes(job.id) ? (
                                <Button disabled>Already Applied</Button>
                              ) : user?.id === job.recruiter_id ? (
                                <Button disabled>Your Job Post</Button>
                              ) : (
                                <Button onClick={() => openApplyDialog(job)}>Apply Now</Button>
                              )}
                            </div>
                          </div>
                        </AnimatedCard>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No jobs match your filters. Try adjusting your search criteria.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
      
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Submit your application to {selectedJob?.company} for the {selectedJob?.title} position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cover-letter">Cover Letter</Label>
              <Textarea 
                id="cover-letter" 
                placeholder="Write a brief introduction and explain why you're a good fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={isApplying}>
              {isApplying ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;

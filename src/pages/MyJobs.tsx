import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/profile";
import { parseSkills } from "@/types/profile";

import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, DollarSign, MapPin, File, Clock } from "lucide-react";
import Button from "@/components/Button";
import AnimatedCard from "@/components/AnimatedCard";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  cover_letter: string;
  created_at: string;
  job?: Job;
}

const MyJobs = () => {
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchMyJobs = async () => {
      setIsLoading(true);
      try {
        // Fetch jobs posted by the user
        const { data: postedJobsData, error: postedJobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false });

        if (postedJobsError) {
          console.error("Error fetching posted jobs:", postedJobsError);
          throw postedJobsError;
        }

        // Transform posted jobs data
        const transformedPostedJobs = postedJobsData.map(item => ({
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
          skills: parseSkills(item.skills),
          recruiter_id: item.recruiter_id,
          status: item.status || 'active',
          budget_min: item.budget_min,
          budget_max: item.budget_max,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));

        setPostedJobs(transformedPostedJobs);

        // Fetch applications made by the user
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user.id);

        if (applicationsError) {
          console.error("Error fetching job applications:", applicationsError);
          throw applicationsError;
        }

        if (applicationsData.length > 0) {
          // Get job details for each application
          const jobIds = applicationsData.map(app => app.job_id);
          
          const { data: jobsData, error: jobsError } = await supabase
            .from('jobs')
            .select('*')
            .in('id', jobIds);

          if (jobsError) {
            console.error("Error fetching applied jobs details:", jobsError);
            throw jobsError;
          }

          // Transform jobs data
          const jobsMap = new Map();
          jobsData.forEach(job => {
            jobsMap.set(job.id, {
              id: job.id,
              title: job.title,
              company: job.company || 'Unknown Company',
              location: job.location || 'Remote',
              job_type: job.job_type || 'Full-time',
              salary: job.budget_min && job.budget_max ? 
                `$${job.budget_min} - $${job.budget_max}` : 
                (job.salary || 'Competitive'),
              category: job.category || 'Development',
              description: job.description || '',
              skills: parseSkills(job.skills),
              recruiter_id: job.recruiter_id,
              status: job.status || 'active',
              created_at: job.created_at,
              updated_at: job.updated_at
            });
          });

          // Merge application data with job details
          const applicationsWithJobDetails = applicationsData.map(app => ({
            ...app,
            job: jobsMap.get(app.job_id)
          }));

          setAppliedJobs(applicationsWithJobDetails);
        } else {
          setAppliedJobs([]);
        }
      } catch (error) {
        console.error("Error fetching jobs data:", error);
        toast({
          title: "Error",
          description: "Failed to load jobs data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyJobs();
  }, [user, toast]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Active</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container px-4 md:px-6 max-w-4xl py-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter">My Jobs</h1>
              <p className="text-muted-foreground">
                Please sign in to view your jobs
              </p>
              <Button>Sign In</Button>
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
      <main className="flex-1">
        <div className="container px-4 md:px-6 max-w-4xl py-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tighter">My Jobs</h1>
            <p className="text-muted-foreground">
              Manage your job postings and applications
            </p>
          </div>

          <Tabs defaultValue="posted" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posted">Jobs Posted</TabsTrigger>
              <TabsTrigger value="applied">Jobs Applied</TabsTrigger>
            </TabsList>

            <TabsContent value="posted" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin h-8 w-8 border-2 border-navy-accent rounded-full border-t-transparent"></div>
                </div>
              ) : postedJobs.length > 0 ? (
                postedJobs.map((job, index) => (
                  <AnimatedCard
                    key={job.id}
                    className="hover-shadow"
                    delay={`${index * 0.05}s`}
                  >
                    <div className="flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        
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
                          <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                            <Clock className="mr-1 h-3 w-3" />
                            Posted on {formatDate(job.created_at)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2">
                          {job.description.length > 150 
                            ? `${job.description.substring(0, 150)}...` 
                            : job.description}
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
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">View Applications</Button>
                        <Button variant={job.status === 'active' ? 'default' : 'default'}>
                          {job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                        </Button>
                      </div>
                    </div>
                  </AnimatedCard>
                ))
              ) : (
                <div className="text-center py-12 glass-card">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Jobs Posted Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't posted any jobs yet. Create a job listing to find the perfect freelancer for your project.
                  </p>
                  <Button>Post a Job</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="applied" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin h-8 w-8 border-2 border-navy-accent rounded-full border-t-transparent"></div>
                </div>
              ) : appliedJobs.length > 0 ? (
                appliedJobs.map((application, index) => (
                  <AnimatedCard
                    key={application.id}
                    className="hover-shadow"
                    delay={`${index * 0.05}s`}
                  >
                    {application.job ? (
                      <div className="flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{application.job.title}</h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-muted-foreground">{application.job.company}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                              <Briefcase className="mr-1 h-3 w-3" />
                              {application.job.job_type}
                            </div>
                            <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                              <MapPin className="mr-1 h-3 w-3" />
                              {application.job.location}
                            </div>
                            <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                              <DollarSign className="mr-1 h-3 w-3" />
                              {application.job.salary}
                            </div>
                            <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                              <File className="mr-1 h-3 w-3" />
                              Applied on {formatDate(application.created_at)}
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 bg-black/30 rounded-md">
                            <h4 className="text-sm font-medium mb-1">Your Cover Letter:</h4>
                            <p className="text-sm text-muted-foreground">
                              {application.cover_letter.length > 150 
                                ? `${application.cover_letter.substring(0, 150)}...` 
                                : application.cover_letter}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button variant="outline">View Job Details</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Job information no longer available</p>
                      </div>
                    )}
                  </AnimatedCard>
                ))
              ) : (
                <div className="text-center py-12 glass-card">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't applied to any jobs yet. Browse available jobs and start applying.
                  </p>
                  <Button>Browse Jobs</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default MyJobs;

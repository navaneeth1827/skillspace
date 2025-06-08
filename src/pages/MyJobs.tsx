
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJobApplications } from "@/hooks/useJobApplications";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job, JobApplication } from "@/types/job";

const MyJobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getApplicantApplications } = useJobApplications();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (user?.user_metadata?.user_type === 'recruiter') {
        // Fetch posted jobs for recruiters
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;
        setPostedJobs(jobsData || []);
      } else {
        // Fetch applications for freelancers
        const applicationsData = await getApplicantApplications();
        setApplications(applicationsData as JobApplication[]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getApplicationCount = async (jobId: string) => {
    const { count } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);
    return count || 0;
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8 pt-24">
          <h1 className="text-2xl font-bold mb-6">My Jobs</h1>
          <p>Please sign in to view your jobs.</p>
        </div>
      </div>
    );
  }

  const isRecruiter = user.user_metadata?.user_type === 'recruiter';

  return (
    <div>
      <Navbar />
      <div className="container py-8 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Jobs</h1>
          {isRecruiter ? (
            <div className="space-x-2">
              <Link to="/applications">
                <Button variant="outline">View Applications</Button>
              </Link>
              <Link to="/post-job">
                <Button>Post New Job</Button>
              </Link>
            </div>
          ) : (
            <Link to="/jobs">
              <Button>Find Jobs</Button>
            </Link>
          )}
        </div>

        {isRecruiter ? (
          // Posted Jobs for Recruiters
          isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : postedJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first job posting to find talented candidates.
                </p>
                <Link to="/post-job">
                  <Button>Post Your First Job</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedJobs.map((job) => (
                <Card key={job.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="mt-1">{job.company}</CardDescription>
                      </div>
                      <Badge className="capitalize">{job.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.job_type}</span>
                      <span>•</span>
                      <span>{job.salary}</span>
                    </div>
                    <p className="line-clamp-3 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills?.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-white/5">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {job.application_count || 0} Applications
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/applications')}
                    >
                      View Applications
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        ) : (
          // Applications for Freelancers
          isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Browse available jobs and submit your first application.
                </p>
                <Link to="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          {application.job?.title}
                        </CardTitle>
                        <CardDescription>
                          {application.job?.company} - {application.job?.location}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={
                            application.status === 'pending' ? 'outline' : 
                            application.status === 'accepted' ? 'default' : 
                            application.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {application.status}
                        </Badge>
                        {application.status === 'accepted' && (
                          <div className="text-xs text-green-600 font-medium">
                            🎉 Congratulations!
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Your Cover Letter</h4>
                      <p className="text-muted-foreground">{application.cover_letter}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {application.job?.skills?.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-white/5">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Applied {new Date(application.created_at).toLocaleDateString()}
                    </div>
                    {application.job?.recruiter_id && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/messages/${application.job!.recruiter_id!}`)}
                      >
                        Message Recruiter
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyJobs;

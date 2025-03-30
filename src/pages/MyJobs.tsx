import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activeTab, setActiveTab] = useState("posted-jobs");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserJobs = async () => {
      setIsLoading(true);
      try {
        if (user.user_metadata?.user_type === 'recruiter') {
          const { data: jobsData, error: jobsError } = await supabase
            .from('jobs')
            .select(`
              *,
              recruiter_info:profiles!jobs_recruiter_id_fkey(full_name, avatar_url, title)
            `)
            .eq('recruiter_id', user.id)
            .order('created_at', { ascending: false });

          if (jobsError) throw jobsError;

          if (jobsData && jobsData.length > 0) {
            const jobIds = jobsData.map(job => job.id);
            const { data: applicationsData, error: applicationsError } = await supabase
              .from('job_applications')
              .select(`
                *,
                user_info:profiles!job_applications_user_id_fkey(full_name, avatar_url, title)
              `)
              .in('job_id', jobIds)
              .order('created_at', { ascending: false });

            if (applicationsError) throw applicationsError;

            const processedApplications = applicationsData.map(app => {
              if ('error' in app.user_info) {
                return {
                  ...app,
                  user_info: {
                    full_name: 'Unknown User',
                    avatar_url: '',
                    title: 'No title information'
                  }
                };
              }
              return app;
            });

            setApplications(processedApplications as JobApplication[]);
          }

          const processedJobs = jobsData.map(job => ({
            ...job,
            skills: job.skills || [],
            budget: job.budget_min || 0
          }));

          setPostedJobs(processedJobs as Job[]);
        } else {
          const { data: appliedJobsData, error: appliedJobsError } = await supabase
            .from('job_applications')
            .select(`
              *,
              job:jobs(
                *,
                recruiter_info:profiles!jobs_recruiter_id_fkey(full_name, avatar_url, title)
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (appliedJobsError) throw appliedJobsError;

          const processedApplications = appliedJobsData.map(app => {
            return {
              ...app,
              user_info: {
                full_name: user.user_metadata?.full_name || 'Unknown User',
                avatar_url: user.user_metadata?.avatar_url || '',
                title: user.user_metadata?.title || 'No title information'
              },
              job: app.job ? {
                ...app.job,
                skills: app.job.skills || [],
                budget: app.job.budget_min || 0
              } : undefined
            };
          });

          setApplications(processedApplications as JobApplication[]);
          setActiveTab("my-applications");
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        toast({
          title: "Error",
          description: "Failed to load your jobs. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserJobs();
  }, [user, toast]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus } 
            : app
        )
      );

      toast({
        title: "Success",
        description: `Application ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully.`
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-6">My Jobs</h1>
          <p>Please sign in to view your jobs.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">My Jobs</h1>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {user.user_metadata?.user_type === 'recruiter' && (
              <TabsTrigger value="posted-jobs">Posted Jobs</TabsTrigger>
            )}
            {user.user_metadata?.user_type === 'recruiter' ? (
              <TabsTrigger value="received-applications">Received Applications</TabsTrigger>
            ) : (
              <TabsTrigger value="my-applications">My Applications</TabsTrigger>
            )}
          </TabsList>

          {user.user_metadata?.user_type === 'recruiter' && (
            <TabsContent value="posted-jobs">
              {isLoading ? (
                <p>Loading your posted jobs...</p>
              ) : postedJobs.length === 0 ? (
                <div className="text-center p-8">
                  <h3 className="text-xl font-semibold mb-2">You haven't posted any jobs yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first job posting to find talented freelancers.</p>
                  <Link to="/post-job">
                    <Button variant="default">Post a Job</Button>
                  </Link>
                </div>
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
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value={user.user_metadata?.user_type === 'recruiter' ? "received-applications" : "my-applications"}>
            {isLoading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <div className="text-center p-8">
                <h3 className="text-xl font-semibold mb-2">
                  {user.user_metadata?.user_type === 'recruiter' 
                    ? "No applications received" 
                    : "You haven't applied to any jobs yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {user.user_metadata?.user_type === 'recruiter'
                    ? "Advertise your job to attract talented freelancers."
                    : "Browse available jobs and submit your first application."}
                </p>
                <Link to={user.user_metadata?.user_type === 'recruiter' ? "/post-job" : "/jobs"}>
                  <Button variant="default">
                    {user.user_metadata?.user_type === 'recruiter' ? "Post a Job" : "Browse Jobs"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((application) => {
                  const isRecruiter = user.user_metadata?.user_type === 'recruiter';
                  const jobInfo = isRecruiter 
                    ? postedJobs.find(job => job.id === application.job_id) 
                    : application.job;
                  
                  if (!jobInfo && isRecruiter) return null;

                  return (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={isRecruiter ? application.user_info?.avatar_url : jobInfo?.recruiter_info?.avatar_url} />
                              <AvatarFallback>
                                {isRecruiter 
                                  ? application.user_info?.full_name?.charAt(0) || '?' 
                                  : jobInfo?.recruiter_info?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {isRecruiter 
                                  ? application.user_info?.full_name 
                                  : jobInfo?.title}
                              </CardTitle>
                              <CardDescription>
                                {isRecruiter 
                                  ? application.user_info?.title || 'No title'
                                  : jobInfo?.company}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={application.status === 'pending' ? 'outline' : application.status === 'accepted' ? 'default' : 'secondary'}>
                            {application.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isRecruiter ? (
                          <>
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Cover Letter</h4>
                              <p className="text-muted-foreground">{application.cover_letter}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                              <Button 
                                onClick={() => updateApplicationStatus(application.id, 'accepted')}
                                disabled={application.status !== 'pending'}
                                variant="default"
                                className="flex-1"
                              >
                                Accept
                              </Button>
                              <Button 
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                disabled={application.status !== 'pending'}
                                variant="outline" 
                                className="flex-1"
                              >
                                Reject
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => {/* Navigate to messages with this user */}}
                              >
                                Message
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <span>{jobInfo?.location}</span>
                              <span>•</span>
                              <span>{jobInfo?.job_type}</span>
                              <span>•</span>
                              <span>{jobInfo?.salary}</span>
                            </div>
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Your Cover Letter</h4>
                              <p className="text-muted-foreground">{application.cover_letter}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {jobInfo?.skills?.map((skill, index) => (
                                <Badge key={index} variant="outline" className="bg-white/5">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          Applied {new Date(application.created_at).toLocaleDateString()}
                        </div>
                        {!isRecruiter && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {/* Navigate to messages with this recruiter */}}
                          >
                            Message Recruiter
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyJobs;

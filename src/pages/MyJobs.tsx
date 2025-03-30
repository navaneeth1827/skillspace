
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Job type definition
interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  recruiter_id: string;
  created_at: string;
  status: 'open' | 'closed' | 'pending' | 'active';
  skills_required: string[];
  deadline: string | null;
  recruiter_info?: {
    full_name: string;
    avatar_url: string;
    company_name: string;
  };
}

// Application type definition
interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  cover_letter: string;
  created_at: string;
  job?: Job;
  user_info?: {
    full_name: string;
    avatar_url: string;
    title: string;
  };
}

const MyJobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchMyJobs = async () => {
      setIsLoading(true);
      
      try {
        // Fetch jobs posted by the user
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            recruiter_info:profiles!jobs_recruiter_id_fkey(
              full_name,
              avatar_url,
              company_name
            )
          `)
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false });
        
        if (jobsError) throw jobsError;
        
        // Fetch applications for the user's jobs
        const jobIds = jobsData?.map(job => job.id) || [];
        
        let applicationsData: JobApplication[] = [];
        
        if (jobIds.length > 0) {
          const { data: appData, error: appError } = await supabase
            .from('job_applications')
            .select(`
              *,
              user_info:profiles!job_applications_user_id_fkey(
                full_name,
                avatar_url,
                title
              )
            `)
            .in('job_id', jobIds);
          
          if (appError) throw appError;
          applicationsData = appData || [];
        }
        
        // Fetch jobs the user has applied to
        const { data: appliedData, error: appliedError } = await supabase
          .from('job_applications')
          .select(`
            *,
            job:jobs(
              *,
              recruiter_info:profiles!jobs_recruiter_id_fkey(
                full_name,
                avatar_url,
                company_name
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (appliedError) throw appliedError;
        
        setPostedJobs(jobsData || []);
        setApplications(applicationsData);
        setAppliedJobs(appliedData || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMyJobs();
  }, [user, toast]);

  const handleCloseJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'closed' })
        .eq('id', jobId);
      
      if (error) throw error;
      
      setPostedJobs(prev => 
        prev.map(job => job.id === jobId ? { ...job, status: 'closed' } : job)
      );
      
      toast({
        title: 'Success',
        description: 'Job has been closed.',
      });
    } catch (error) {
      console.error('Error closing job:', error);
      toast({
        title: 'Error',
        description: 'Failed to close the job.',
        variant: 'destructive',
      });
    }
  };

  const handleReOpenJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'open' })
        .eq('id', jobId);
      
      if (error) throw error;
      
      setPostedJobs(prev => 
        prev.map(job => job.id === jobId ? { ...job, status: 'open' } : job)
      );
      
      toast({
        title: 'Success',
        description: 'Job has been reopened.',
      });
    } catch (error) {
      console.error('Error reopening job:', error);
      toast({
        title: 'Error',
        description: 'Failed to reopen the job.',
        variant: 'destructive',
      });
    }
  };

  const handleApplicationAction = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      // Update local state
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? { ...app, status } : app)
      );
      
      toast({
        title: 'Success',
        description: `Application ${status}.`,
      });
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the application status.',
        variant: 'destructive',
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <Button onClick={() => navigate('/post-job')}>Post New Job</Button>
        </div>
        
        <Tabs defaultValue="posted" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posted">Jobs Posted</TabsTrigger>
            <TabsTrigger value="applications">Applications Received</TabsTrigger>
            <TabsTrigger value="applied">Jobs Applied</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posted" className="space-y-6">
            {isLoading ? (
              <p>Loading your posted jobs...</p>
            ) : postedJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
                <Button onClick={() => navigate('/post-job')}>Post Your First Job</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postedJobs.map((job) => (
                  <Card key={job.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <Badge 
                          variant={job.status === 'open' ? 'default' : 'outline'}
                        >
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'No date'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Budget: ${job.budget}</p>
                        <p className="text-sm line-clamp-3">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.skills_required?.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {applications.filter(app => app.job_id === job.id).length} applications
                        </p>
                      </div>
                      {job.status === 'open' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCloseJob(job.id)}
                        >
                          Close Job
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReOpenJob(job.id)}
                        >
                          Reopen Job
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="applications" className="space-y-6">
            {isLoading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't received any applications yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => {
                  const matchingJob = postedJobs.find(job => job.id === application.job_id);
                  return (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Application for: {matchingJob?.title || 'Unknown Job'}
                            </CardTitle>
                            <CardDescription>
                              From: {application.user_info?.full_name || 'Unknown User'}
                            </CardDescription>
                          </div>
                          <Badge>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{application.cover_letter}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied on: {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleApplicationAction(application.id, 'rejected')}
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleApplicationAction(application.id, 'accepted')}
                            >
                              Accept
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="applied" className="space-y-6">
            {isLoading ? (
              <p>Loading your applications...</p>
            ) : appliedJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                <Button onClick={() => navigate('/jobs')}>Browse Available Jobs</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appliedJobs.map((application) => {
                  const job = application.job as Job;
                  return (
                    <Card key={application.id} className="h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{job?.title || 'Unknown Job'}</CardTitle>
                          <Badge 
                            variant={application.status === 'accepted' ? 'default' : (
                              application.status === 'rejected' ? 'outline' : 'secondary'
                            )}
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {job?.recruiter_info?.company_name || 'Unknown Company'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Budget: ${job?.budget || 0}</p>
                          <p className="text-sm line-clamp-3">{job?.description || 'No description'}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job?.skills_required?.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                          Applied on: {new Date(application.created_at).toLocaleDateString()}
                        </p>
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

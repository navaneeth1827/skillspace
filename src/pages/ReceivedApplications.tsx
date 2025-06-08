import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJobApplications } from "@/hooks/useJobApplications";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobApplication } from "@/types/job";
import ApplicationDetails from "@/components/ApplicationDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReceivedApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateApplicationStatus } = useJobApplications();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [applicationType, setApplicationType] = useState<'received' | 'sent'>('received');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching applications for user:', user.id, 'Type:', applicationType);
        
        if (applicationType === 'received') {
          // Fetch applications for recruiter's jobs
          const { data: jobsData, error: jobsError } = await supabase
            .from('jobs')
            .select('id')
            .eq('recruiter_id', user.id);

          if (jobsError) {
            console.error('Error fetching jobs:', jobsError);
            throw jobsError;
          }

          console.log('Jobs found:', jobsData);

          if (jobsData && jobsData.length > 0) {
            const jobIds = jobsData.map(job => job.id);
            
            const { data: applicationsData, error } = await supabase
              .from('job_applications')
              .select(`
                *,
                user_info:profiles!job_applications_user_id_fkey(full_name, avatar_url, title),
                job:jobs(*)
              `)
              .in('job_id', jobIds)
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Error fetching applications:', error);
              throw error;
            }

            console.log('Applications fetched:', applicationsData);

            const processedApplications = applicationsData?.map(app => {
              if (!app.user_info || 'error' in app.user_info) {
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
            }) || [];

            setApplications(processedApplications as JobApplication[]);
          } else {
            console.log('No jobs found for recruiter');
            setApplications([]);
          }
        } else {
          // Fetch applications submitted by the current user
          const { data: appliedApplications, error } = await supabase
            .from('job_applications')
            .select(`
              *,
              job:jobs(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching sent applications:', error);
            throw error;
          }

          console.log('Sent applications fetched:', appliedApplications);
          setApplications(appliedApplications as JobApplication[]);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error",
          description: "Failed to load applications. Please try again.",
          variant: "destructive"
        });
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();

    // Setup realtime subscription for job applications
    const jobApplicationsChannel = supabase
      .channel('job_applications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_applications'
      }, (payload) => {
        console.log("Real-time update received:", payload);
        fetchApplications(); // Refetch data when changes occur
      })
      .subscribe();

    return () => {
      supabase.removeChannel(jobApplicationsChannel);
    };
  }, [user, toast, applicationType]);

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setIsUpdating(applicationId);
    console.log('Handling status update:', { applicationId, newStatus });
    
    try {
      const success = await updateApplicationStatus(applicationId, newStatus);
      
      if (success) {
        console.log('Status update successful, updating local state');
        // Update local state to reflect the change immediately
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus, updated_at: new Date().toISOString() } 
              : app
          )
        );

        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
        }

        toast({
          title: 'Success',
          description: `Application ${newStatus} successfully`,
        });
      }
    } catch (error) {
      console.error('Error in handleUpdateApplicationStatus:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleViewDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsDetailsDialogOpen(true);
  };

  const handleMessageApplicant = (userId: string) => {
    navigate(`/messages/${userId}`);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'interview':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-6">Applications</h1>
          <p>Please sign in to view applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container py-8 pt-24 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Applications</h1>
        
        <Tabs defaultValue="received" onValueChange={(value) => setApplicationType(value as 'received' | 'sent')} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="received">Received Applications</TabsTrigger>
            <TabsTrigger value="sent">Sent Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="received">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">No applications received</h3>
                    <p className="text-muted-foreground">When you post jobs and receive applications, they will appear here.</p>
                    <Button 
                      onClick={() => navigate('/post-job')} 
                      className="mt-4"
                    >
                      Post a Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {applications.map((application) => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={application.user_info?.avatar_url} />
                            <AvatarFallback>
                              {application.user_info?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {application.user_info?.full_name}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                              Applied for: {application.job?.title || 'Unknown Job'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Applied on: {new Date(application.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={getBadgeVariant(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-4 mt-4 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(application)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProfile(application.user_id)}
                        >
                          View Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMessageApplicant(application.user_id)}
                        >
                          Message
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleUpdateApplicationStatus(application.id, 'accepted')}
                              disabled={isUpdating === application.id}
                            >
                              {isUpdating === application.id ? 'Accepting...' : 'Accept'}
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                              disabled={isUpdating === application.id}
                            >
                              {isUpdating === application.id ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </>
                        )}
                        {application.status === 'accepted' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateApplicationStatus(application.id, 'interview')}
                            disabled={isUpdating === application.id}
                          >
                            {isUpdating === application.id ? 'Moving...' : 'Move to Interview'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sent">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">No applications sent</h3>
                    <p className="text-muted-foreground">When you apply for jobs, they will appear here.</p>
                    <Button 
                      onClick={() => navigate('/jobs')} 
                      className="mt-4"
                    >
                      Find Jobs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {applications.map((application) => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {application.job?.title || 'Unknown Job'}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {application.job?.company || 'Unknown Company'} - {application.job?.location || 'Unknown Location'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getBadgeVariant(application.status)}>
                            {application.status}
                          </Badge>
                          {application.status === 'accepted' && (
                            <div className="text-xs text-green-600 font-medium">
                              🎉 Congratulations!
                            </div>
                          )}
                          {application.status === 'rejected' && (
                            <div className="text-xs text-muted-foreground">
                              Better luck next time
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-4 mt-4 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(application)}
                        >
                          View Details
                        </Button>
                        {application.job?.recruiter_id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMessageApplicant(application.job!.recruiter_id!)}
                          >
                            Message Recruiter
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Application Details Dialog */}
        {selectedApplication && (
          <ApplicationDetails
            application={selectedApplication}
            isOpen={isDetailsDialogOpen}
            onClose={() => setIsDetailsDialogOpen(false)}
            onStatusUpdate={handleUpdateApplicationStatus}
            onMessage={handleMessageApplicant}
          />
        )}
      </div>
    </div>
  );
};

export default ReceivedApplications;


import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJobApplications } from "@/hooks/useJobApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobApplication } from "@/types/job";
import { useNavigate } from 'react-router-dom';

const ReceivedApplicationsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateApplicationStatus } = useJobApplications();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchReceivedApplications = async () => {
      setIsLoading(true);
      try {
        // First, get all jobs posted by the current user
        const { data: userJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id')
          .eq('recruiter_id', user.id);

        if (jobsError) throw jobsError;

        if (!userJobs || userJobs.length === 0) {
          setApplications([]);
          return;
        }

        const jobIds = userJobs.map(job => job.id);

        // Then get all applications for those jobs
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('job_applications')
          .select(`
            *,
            user_info:profiles!job_applications_user_id_fkey(full_name, avatar_url, title),
            job:jobs(title, company, location)
          `)
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });

        if (applicationsError) throw applicationsError;

        setApplications(applicationsData || []);
      } catch (error) {
        console.error("Error fetching received applications:", error);
        toast({
          title: "Error",
          description: "Failed to load applications. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivedApplications();

    // Set up real-time subscription
    const channel = supabase
      .channel('applications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_applications'
      }, () => {
        fetchReceivedApplications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    setIsUpdating(applicationId);
    try {
      const success = await updateApplicationStatus(applicationId, newStatus);
      if (success) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus } 
              : app
          )
        );
        toast({
          title: 'Success',
          description: `Application ${newStatus} successfully`,
        });
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setIsUpdating(null);
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
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
    );
  }

  return (
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
                    {application.user_info?.full_name || 'Unknown Applicant'}
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
            {application.cover_letter && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Cover Letter:</h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {application.cover_letter}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/profile/${application.user_id}`)}
              >
                View Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/messages/${application.user_id}`)}
              >
                Message
              </Button>
              {application.status === 'pending' && (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleUpdateStatus(application.id, 'accepted')}
                    disabled={isUpdating === application.id}
                  >
                    {isUpdating === application.id ? 'Accepting...' : 'Accept'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleUpdateStatus(application.id, 'rejected')}
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
                  onClick={() => handleUpdateStatus(application.id, 'interview')}
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
  );
};

export default ReceivedApplicationsList;

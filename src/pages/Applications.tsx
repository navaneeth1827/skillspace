
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useJobApplications } from "@/hooks/useJobApplications";
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobApplication } from "@/types/job";
import { useToast } from "@/hooks/use-toast";

const Applications = () => {
  const { user } = useAuth();
  const { updateApplicationStatus, getRecruiterApplications } = useJobApplications();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (user.user_metadata?.user_type !== 'recruiter') {
      toast({
        title: 'Access denied',
        description: 'Only recruiters can view this page',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    fetchApplications();
  }, [user, navigate, toast]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await getRecruiterApplications();
      setApplications(data as JobApplication[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      const success = await updateApplicationStatus(applicationId, newStatus);
      if (success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus, updated_at: new Date().toISOString() } 
              : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'interview': return 'secondary';
      default: return 'outline';
    }
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div className="container py-8 pt-24 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <Button variant="outline" onClick={() => navigate('/post-job')}>
            Post New Job
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">
                When candidates apply to your jobs, they will appear here.
              </p>
              <Button onClick={() => navigate('/post-job')}>
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={application.applicant?.avatar_url} />
                        <AvatarFallback>
                          {application.applicant?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {application.applicant?.full_name || 'Unknown Applicant'}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          Applied for: {application.job?.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getBadgeVariant(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Cover Letter</h4>
                    <p className="text-muted-foreground">
                      {application.cover_letter || 'No cover letter provided'}
                    </p>
                  </div>
                  
                  {application.expected_salary && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Expected Salary</h4>
                      <p className="text-muted-foreground">{application.expected_salary}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
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
                          onClick={() => handleStatusUpdate(application.id, 'accepted')}
                          disabled={updatingId === application.id}
                        >
                          {updatingId === application.id ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          disabled={updatingId === application.id}
                        >
                          {updatingId === application.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </>
                    )}
                    
                    {application.status === 'accepted' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusUpdate(application.id, 'interview')}
                        disabled={updatingId === application.id}
                      >
                        {updatingId === application.id ? 'Moving...' : 'Schedule Interview'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;

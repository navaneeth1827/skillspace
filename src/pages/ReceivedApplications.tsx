
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { useJobApplications } from "@/hooks/useJobApplications";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobApplication } from "@/types/job";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const ReceivedApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateApplicationStatus, getRecruiterApplications, getApplicantApplications } = useJobApplications();
  const [receivedApplications, setReceivedApplications] = useState<JobApplication[]>([]);
  const [sentApplications, setSentApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // Fetch received applications (for recruiters)
      const received = await getRecruiterApplications();
      setReceivedApplications(received as JobApplication[]);

      // Fetch sent applications (for all users)
      const sent = await getApplicantApplications();
      setSentApplications(sent as JobApplication[]);
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
        setReceivedApplications(prev => 
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

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8 pt-24">
          <h1 className="text-2xl font-bold mb-6">Applications</h1>
          <p>Please sign in to view applications.</p>
        </div>
      </div>
    );
  }

  const isRecruiter = user.user_metadata?.user_type === 'recruiter';

  return (
    <div>
      <Navbar />
      <div className="container py-8 pt-24 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Applications</h1>
        
        <Tabs defaultValue={isRecruiter ? "received" : "sent"} className="mb-6">
          <TabsList className="mb-4">
            {isRecruiter && <TabsTrigger value="received">Received Applications</TabsTrigger>}
            <TabsTrigger value="sent">My Applications</TabsTrigger>
          </TabsList>
          
          {isRecruiter && (
            <TabsContent value="received">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : receivedApplications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">No applications received</h3>
                      <p className="text-muted-foreground">When you post jobs and receive applications, they will appear here.</p>
                      <Button onClick={() => navigate('/post-job')} className="mt-4">
                        Post a Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {receivedApplications.map((application) => (
                    <Card key={application.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/30 pb-4">
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
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Cover Letter</h4>
                          <p className="text-muted-foreground">
                            {application.cover_letter || 'No cover letter provided'}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4 justify-end">
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
            </TabsContent>
          )}
          
          <TabsContent value="sent">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : sentApplications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">No applications sent</h3>
                    <p className="text-muted-foreground">When you apply for jobs, they will appear here.</p>
                    <Button onClick={() => navigate('/jobs')} className="mt-4">
                      Find Jobs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {sentApplications.map((application) => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {application.job?.title || 'Unknown Job'}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {application.job?.company} - {application.job?.location}
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
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Your Cover Letter</h4>
                        <p className="text-muted-foreground">
                          {application.cover_letter || 'No cover letter provided'}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4 justify-end">
                        {application.job?.recruiter_id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/messages/${application.job!.recruiter_id!}`)}
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
      </div>
    </div>
  );
};

export default ReceivedApplications;

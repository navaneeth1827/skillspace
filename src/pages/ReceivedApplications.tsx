
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ReceivedApplications = () => {
  const { user } = useAuth();
  const { 
    applications, 
    isLoading, 
    updateApplicationStatus, 
    getRecruiterApplications,
    getApplicantApplications 
  } = useJobApplications();

  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
  const [sentApplications, setSentApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        const [received, sent] = await Promise.all([
          getRecruiterApplications(),
          getApplicantApplications()
        ]);
        
        setReceivedApplications(received);
        setSentApplications(sent);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      // Refresh received applications
      const updated = await getRecruiterApplications();
      setReceivedApplications(updated);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Applications</h1>
          <p className="text-muted-foreground">
            Manage received and sent job applications
          </p>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList>
            <TabsTrigger value="received">
              Received ({receivedApplications.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedApplications.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No applications received</h3>
                    <p className="text-muted-foreground">
                      Applications for your job postings will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              receivedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {application.applicant?.full_name || 'Unknown Applicant'}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          Applied for: {application.job?.title}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Email:</p>
                          <p className="text-sm text-muted-foreground">
                            {application.applicant?.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Applied:</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(application.created_at), 'PPp')}
                          </p>
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div>
                          <p className="text-sm font-medium mb-2">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {application.status === 'pending' && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => handleStatusUpdate(application.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentApplications.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No applications sent</h3>
                    <p className="text-muted-foreground">
                      Your job applications will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              sentApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{application.job?.title}</CardTitle>
                        <p className="text-muted-foreground">
                          {application.job?.company} • {application.job?.location}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Applied:</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(application.created_at), 'PPp')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Last Updated:</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(application.updated_at), 'PPp')}
                          </p>
                        </div>
                      </div>

                      {application.notes && (
                        <div>
                          <p className="text-sm font-medium mb-2">Notes from Recruiter:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {application.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReceivedApplications;

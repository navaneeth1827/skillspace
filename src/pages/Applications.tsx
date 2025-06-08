
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobApplications, JobApplication } from '@/hooks/useJobApplications';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Applications = () => {
  const { user } = useAuth();
  const { 
    applications, 
    isLoading, 
    updateApplicationStatus, 
    getRecruiterApplications 
  } = useJobApplications();

  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    if (user) {
      getRecruiterApplications();
    }
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
      // Refresh the list
      getRecruiterApplications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const groupedApplications = applications.reduce((acc, app) => {
    const jobId = app.job?.id || 'unknown';
    if (!acc[jobId]) {
      acc[jobId] = {
        job: app.job,
        applications: []
      };
    }
    acc[jobId].applications.push(app);
    return acc;
  }, {} as Record<string, { job: any; applications: JobApplication[] }>);

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
          <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
          <p className="text-muted-foreground">
            Manage applications received for your job postings
          </p>
        </div>

        {Object.keys(groupedApplications).length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground">
                  Applications for your job postings will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedApplications).map(({ job, applications: jobApplications }) => (
              <Card key={job?.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job?.title}</CardTitle>
                      <p className="text-muted-foreground">{job?.company} • {job?.location}</p>
                    </div>
                    <Badge variant="secondary">
                      {jobApplications.length} application{jobApplications.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobApplications.map((application) => (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">
                              {application.applicant?.full_name || 'Unknown Applicant'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {application.applicant?.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium">Applied:</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(application.created_at), 'PPp')}
                            </p>
                          </div>
                          {application.expected_salary && (
                            <div>
                              <p className="text-sm font-medium">Expected Salary:</p>
                              <p className="text-sm text-muted-foreground">
                                {application.expected_salary}
                              </p>
                            </div>
                          )}
                        </div>

                        {application.cover_letter && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-1">Cover Letter:</p>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}

                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(application.id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
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

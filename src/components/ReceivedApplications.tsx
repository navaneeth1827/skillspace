
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

const ReceivedApplications = () => {
  const { user } = useAuth();
  const { 
    applications, 
    isLoading, 
    updateApplicationStatus, 
    getRecruiterApplications 
  } = useJobApplications();

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
      getRecruiterApplications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Received Applications</h2>
        <Badge variant="secondary">{applications.length} total</Badge>
      </div>

      {applications.length === 0 ? (
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
        <div className="space-y-4">
          {applications.map((application) => (
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
                    <p className="text-sm text-muted-foreground">
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
                    {application.expected_salary && (
                      <div>
                        <p className="text-sm font-medium">Expected Salary:</p>
                        <p className="text-sm text-muted-foreground">
                          {application.expected_salary}
                        </p>
                      </div>
                    )}
                    {application.availability_date && (
                      <div>
                        <p className="text-sm font-medium">Available From:</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(application.availability_date), 'PP')}
                        </p>
                      </div>
                    )}
                  </div>

                  {application.cover_letter && (
                    <div>
                      <p className="text-sm font-medium mb-2">Cover Letter:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  {application.portfolio_url && (
                    <div>
                      <p className="text-sm font-medium mb-2">Portfolio:</p>
                      <a 
                        href={application.portfolio_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {application.portfolio_url}
                      </a>
                    </div>
                  )}

                  {application.status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleStatusUpdate(application.id, 'accepted')}
                      >
                        Accept Application
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate(application.id, 'rejected')}
                      >
                        Reject Application
                      </Button>
                    </div>
                  )}

                  {application.notes && (
                    <div>
                      <p className="text-sm font-medium mb-2">Notes:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {application.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedApplications;

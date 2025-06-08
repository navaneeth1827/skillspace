
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { JobApplication, ApplicationStatusHistory } from '@/types/job';

export const useJobApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const applyToJob = async (
    jobId: string, 
    coverLetter: string, 
    portfolioUrl?: string,
    expectedSalary?: string,
    availabilityDate?: string
  ) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to apply for jobs',
        variant: 'destructive'
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Check if user already applied to this job
      const { data: existingApplications } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .single();

      if (existingApplications) {
        toast({
          title: 'Already applied',
          description: 'You have already applied to this job',
          variant: 'destructive'
        });
        return null;
      }

      // Create application
      const { data: application, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          cover_letter: coverLetter,
          status: 'pending',
          portfolio_url: portfolioUrl,
          expected_salary: expectedSalary,
          availability_date: availabilityDate
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Get job and applicant details for notification
      const { data: job } = await supabase
        .from('jobs')
        .select('title, recruiter_id')
        .eq('id', jobId)
        .single();

      const { data: applicantProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Create notification for recruiter
      if (job?.recruiter_id) {
        await supabase.from('notifications').insert({
          user_id: job.recruiter_id,
          title: 'New Job Application',
          message: `${applicantProfile?.full_name || 'Someone'} has applied to your job "${job.title}"`,
          type: 'new_application',
          related_id: application.id
        });
      }

      // Create notification for applicant confirming submission
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Application Submitted',
        message: `Your application for "${job?.title}" has been successfully submitted`,
        type: 'application_submitted',
        related_id: application.id
      });

      toast({
        title: 'Application submitted',
        description: 'Your application has been submitted successfully'
      });

      return application;
    } catch (error) {
      console.error('Error applying to job:', error);
      toast({
        title: 'Application failed',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string,
    notes?: string
  ) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to update applications',
        variant: 'destructive'
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Get application details first for notifications
      const { data: applicationData, error: applicationError } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(title, recruiter_id),
          user_info:profiles!job_applications_user_id_fkey(full_name)
        `)
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;
      
      // Update application status
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create status history entry
      const { error: historyError } = await supabase
        .from('job_application_status_history')
        .insert({
          application_id: applicationId,
          status: newStatus,
          notes: notes || null,
          changed_by: user.id
        });

      if (historyError) throw historyError;

      // Get recruiter profile for notification
      const { data: recruiterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Create notification for the applicant
      if (applicationData && applicationData.user_id) {
        const jobTitle = applicationData.job?.title || 'a job';
        const statusMessage = getStatusMessage(newStatus);
        const recruiterName = recruiterProfile?.full_name || 'The recruiter';

        await supabase.from('notifications').insert({
          user_id: applicationData.user_id,
          title: `Application ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: `${recruiterName} has ${statusMessage} your application for "${jobTitle}"`,
          type: 'application_update',
          related_id: applicationId
        });
      }

      // Create notification for the recruiter (activity log)
      if (applicationData?.job?.recruiter_id && applicationData.job.recruiter_id === user.id) {
        const applicantName = applicationData.user_info?.full_name || 'Unknown applicant';
        const jobTitle = applicationData.job?.title || 'a job';

        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Application Status Updated',
          message: `You ${newStatus === 'accepted' ? 'accepted' : newStatus === 'rejected' ? 'rejected' : 'updated'} ${applicantName}'s application for "${jobTitle}"`,
          type: 'recruiter_activity',
          related_id: applicationId
        });
      }

      toast({
        title: 'Status updated',
        description: `Application status changed to ${newStatus}`
      });
      
      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update application status. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get appropriate status message
  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'accepted':
        return 'accepted';
      case 'rejected':
        return 'rejected';
      case 'interview':
        return 'moved to interview stage for';
      case 'reviewing':
        return 'is reviewing';
      default:
        return `updated to ${status}`;
    }
  };

  const getApplicationHistory = async (applicationId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('job_application_status_history')
        .select(`
          *,
          changed_by:profiles!inner(full_name, avatar_url)
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching application history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application history',
        variant: 'destructive'
      });
      return [];
    }
  };

  return {
    applyToJob,
    updateApplicationStatus,
    getApplicationHistory,
    isLoading
  };
};

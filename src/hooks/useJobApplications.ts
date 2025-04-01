
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

      // Create notification for recruiter
      const { data: job } = await supabase
        .from('jobs')
        .select('title, recruiter_id')
        .eq('id', jobId)
        .single();

      if (job?.recruiter_id) {
        await supabase.from('notifications').insert({
          user_id: job.recruiter_id,
          title: 'New Job Application',
          message: `Someone has applied to your job "${job.title}"`,
          type: 'new_application',
          related_id: application.id
        });
      }

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

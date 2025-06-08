
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { JobApplication } from '@/types/job';

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
      // Check if user already applied
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingApplication) {
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

      if (error) throw error;

      // Get job and applicant details
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

      // Notify recruiter
      if (job?.recruiter_id) {
        await supabase.from('notifications').insert({
          user_id: job.recruiter_id,
          title: 'New Job Application',
          message: `${applicantProfile?.full_name || 'Someone'} applied to your job "${job.title}"`,
          type: 'new_application',
          related_id: application.id
        });
      }

      // Notify applicant
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Application Submitted',
        message: `Your application for "${job?.title}" has been submitted successfully`,
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
    if (!user) return false;

    setIsLoading(true);
    try {
      // Get application details
      const { data: application, error: fetchError } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(title, recruiter_id),
          applicant:profiles!job_applications_user_id_fkey(full_name)
        `)
        .eq('id', applicationId)
        .single();

      if (fetchError) throw fetchError;

      // Update status
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create status history
      await supabase
        .from('job_application_status_history')
        .insert({
          application_id: applicationId,
          status: newStatus,
          notes: notes || null,
          changed_by: user.id
        });

      // Get recruiter profile
      const { data: recruiterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Notify applicant about status change
      if (application?.user_id) {
        const statusMessages = {
          accepted: 'accepted',
          rejected: 'rejected',
          interview: 'scheduled an interview for',
          reviewing: 'is reviewing'
        };

        const action = statusMessages[newStatus as keyof typeof statusMessages] || `updated to ${newStatus}`;
        
        await supabase.from('notifications').insert({
          user_id: application.user_id,
          title: `Application ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: `${recruiterProfile?.full_name || 'The recruiter'} has ${action} your application for "${application.job?.title}"`,
          type: 'application_update',
          related_id: applicationId
        });
      }

      // Notify recruiter about their action
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Application Status Updated',
        message: `You ${newStatus} ${application.applicant?.full_name}'s application for "${application.job?.title}"`,
        type: 'recruiter_activity',
        related_id: applicationId
      });

      toast({
        title: 'Status updated',
        description: `Application ${newStatus} successfully`
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

  const getRecruiterApplications = async () => {
    if (!user) return [];

    try {
      // Get all jobs posted by the recruiter
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('recruiter_id', user.id);

      if (jobsError) throw jobsError;
      if (!jobs || jobs.length === 0) return [];

      const jobIds = jobs.map(job => job.id);

      // Get all applications for those jobs
      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(*),
          applicant:profiles!job_applications_user_id_fkey(full_name, avatar_url, title)
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      return applications || [];
    } catch (error) {
      console.error('Error fetching recruiter applications:', error);
      return [];
    }
  };

  const getApplicantApplications = async () => {
    if (!user) return [];

    try {
      const { data: applications, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return applications || [];
    } catch (error) {
      console.error('Error fetching applicant applications:', error);
      return [];
    }
  };

  return {
    applyToJob,
    updateApplicationStatus,
    getRecruiterApplications,
    getApplicantApplications,
    isLoading
  };
};

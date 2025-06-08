
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  cover_letter?: string;
  portfolio_url?: string;
  expected_salary?: string;
  availability_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
    job_type: string;
    salary_range: string;
    created_by: string;
  };
  applicant?: {
    id: string;
    email: string;
    full_name: string;
    user_metadata: any;
  };
}

export const useJobApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Apply to a job
  const applyToJob = async (
    jobId: string,
    coverLetter: string,
    portfolioUrl?: string,
    expectedSalary?: string,
    availabilityDate?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setIsLoading(true);

      // Check if user already applied
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('applicant_id', user.id)
        .single();

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          cover_letter: coverLetter,
          portfolio_url: portfolioUrl,
          expected_salary: expectedSalary,
          availability_date: availabilityDate,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Get job details for notification
      const { data: jobData } = await supabase
        .from('jobs')
        .select('title, created_by')
        .eq('id', jobId)
        .single();

      // Create notification for recruiter
      if (jobData) {
        await supabase
          .from('notifications')
          .insert({
            user_id: jobData.created_by,
            type: 'new_application',
            title: 'New Job Application',
            message: `New application received for ${jobData.title}`,
            related_id: data.id
          });
      }

      toast({
        title: 'Application submitted',
        description: 'Your job application has been sent successfully.',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update application status (for recruiters)
  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string,
    notes?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('job_applications')
        .update({
          status: newStatus,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select(`
          *,
          job:jobs(title, company),
          applicant:profiles(full_name, email)
        `)
        .single();

      if (error) throw error;

      // Create notification for applicant
      await supabase
        .from('notifications')
        .insert({
          user_id: data.applicant_id,
          type: 'application_update',
          title: 'Application Status Updated',
          message: `Your application for ${data.job?.title} has been ${newStatus}`,
          related_id: applicationId
        });

      toast({
        title: 'Status updated',
        description: `Application status changed to ${newStatus}`,
      });

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as any, notes, updated_at: new Date().toISOString() }
            : app
        )
      );

      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get applications for recruiter (received applications)
  const getRecruiterApplications = async () => {
    if (!user) return [];

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs!inner(
            id,
            title,
            company,
            location,
            job_type,
            salary_range,
            created_by
          ),
          applicant:profiles(
            id,
            email,
            full_name,
            user_metadata
          )
        `)
        .eq('job.created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching recruiter applications:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get applications for applicant (sent applications)
  const getApplicantApplications = async () => {
    if (!user) return [];

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(
            id,
            title,
            company,
            location,
            job_type,
            salary_range,
            created_by
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching applicant applications:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get application history (for ApplicationDetails component)
  const getApplicationHistory = async (applicationId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(title, company),
          applicant:profiles(full_name, email)
        `)
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching application history:', error);
      return null;
    }
  };

  return {
    applications,
    isLoading,
    applyToJob,
    updateApplicationStatus,
    getRecruiterApplications,
    getApplicantApplications,
    getApplicationHistory
  };
};

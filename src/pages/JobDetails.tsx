
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobApplication } from '@/types/job';
import { Briefcase, Calendar, DollarSign, MapPin, User, MessageSquare, Share, Bookmark, Building, Clock } from 'lucide-react';
import ApplyJobForm from '@/components/ApplyJobForm';
import { format } from 'date-fns';

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [recruiter, setRecruiter] = useState<{ full_name: string; avatar_url: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            recruiter_info:profiles!jobs_recruiter_id_fkey(full_name, avatar_url, title)
          `)
          .eq('id', jobId)
          .single();

        if (jobError) throw jobError;
        
        setJob(jobData);
        setRecruiter(jobData.recruiter_info);
        
        // Check if user has applied
        if (user) {
          const { data: applicationData, error: applicationError } = await supabase
            .from('job_applications')
            .select('id, status')
            .eq('job_id', jobId)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!applicationError && applicationData) {
            setHasApplied(true);
            setApplicationStatus(applicationData.status);
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, user]);

  const handleApplySuccess = () => {
    setIsApplyDialogOpen(false);
    setHasApplied(true);
    setApplicationStatus('pending');
  };

  const handleMessageRecruiter = () => {
    if (job?.recruiter_id) {
      navigate(`/messages/${job.recruiter_id}`);
    }
  };

  const getStatusBadge = () => {
    if (!applicationStatus) return null;
    
    let color;
    switch (applicationStatus) {
      case 'accepted':
        color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        break;
      case 'rejected':
        color = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        break;
      case 'interview':
        color = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        break;
      default:
        color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${color}`}>
        {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-16">
          <div className="container">
            <div className="flex justify-center items-center h-[60vh]">
              <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
            </div>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-16">
          <div className="container text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-8">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/jobs')}>Browse All Jobs</Button>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Job Header */}
              <div className="space-y-6">
                <Button 
                  variant="ghost" 
                  className="flex items-center text-sm"
                  onClick={() => navigate('/jobs')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1 h-4 w-4"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to Jobs
                </Button>
                
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{job.company}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-sm">
                    <Briefcase className="mr-1 h-4 w-4" />
                    {job.job_type}
                  </div>
                  <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-sm">
                    <MapPin className="mr-1 h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-sm">
                    <DollarSign className="mr-1 h-4 w-4" />
                    {job.budget_min && job.budget_max 
                      ? `$${job.budget_min} - $${job.budget_max}` 
                      : job.salary || 'Competitive salary'}
                  </div>
                  {job.deadline && (
                    <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-sm">
                      <Calendar className="mr-1 h-4 w-4" />
                      Deadline: {format(new Date(job.deadline), 'PPP')}
                    </div>
                  )}
                  <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-sm">
                    <Clock className="mr-1 h-4 w-4" />
                    Posted {format(new Date(job.created_at), 'PP')}
                  </div>
                </div>
                
                {hasApplied && (
                  <div className="py-2 px-4 bg-muted rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Application Status:</span>
                      {getStatusBadge()}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/my-jobs')}
                    >
                      View Application
                    </Button>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Job Description</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
              </div>
              
              {/* Requirements */}
              {job.requirements && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Requirements</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">{job.requirements}</p>
                  </div>
                </div>
              )}
              
              {/* Skills */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills && job.skills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-sm"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Application Instructions */}
              {job.application_instructions && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Application Instructions</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">{job.application_instructions}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Action Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Job Actions</CardTitle>
                  <CardDescription>Apply for this position or contact the recruiter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasApplied ? (
                    <div className="text-center space-y-2">
                      <p>You have already applied to this job.</p>
                      <span className="block">{getStatusBadge()}</span>
                    </div>
                  ) : (
                    <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">Apply Now</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Apply for {job.title}</DialogTitle>
                        </DialogHeader>
                        <ApplyJobForm 
                          job={job} 
                          onSuccess={handleApplySuccess}
                          onCancel={() => setIsApplyDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleMessageRecruiter}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recruiter Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Posted by</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={recruiter?.avatar_url} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{recruiter?.full_name || 'Recruiter'}</p>
                      <p className="text-sm text-muted-foreground">{recruiter?.title || 'Hiring Manager'}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleMessageRecruiter}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Recruiter
                  </Button>
                </CardContent>
              </Card>
              
              {/* Similar Jobs Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Similar job recommendations coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default JobDetails;

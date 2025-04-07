
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJobApplications } from '@/hooks/useJobApplications';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarIcon, MessageSquare } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Job } from '@/types/job';
import ChatButton from '@/components/ChatButton';

interface ApplyJobFormProps {
  job: Job;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ApplyJobForm = ({ job, onSuccess, onCancel }: ApplyJobFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { applyToJob, isLoading } = useJobApplications();
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/sign-in', { state: { from: `/jobs/${job.id}` } });
      return;
    }
    
    if (!coverLetter.trim()) {
      return;
    }
    
    const availabilityDateStr = availabilityDate ? availabilityDate.toISOString() : undefined;
    
    const result = await applyToJob(
      job.id, 
      coverLetter,
      portfolioUrl || undefined,
      expectedSalary || undefined,
      availabilityDateStr
    );
    
    if (result && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cover-letter">Cover Letter</Label>
        <Textarea
          id="cover-letter"
          placeholder="Tell the recruiter why you're a great fit for this position..."
          className="min-h-[120px]"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="portfolio-url">Portfolio URL (Optional)</Label>
        <Input
          id="portfolio-url"
          type="url"
          placeholder="https://your-portfolio.com"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="expected-salary">Expected Salary (Optional)</Label>
        <Input
          id="expected-salary"
          placeholder="e.g. $70,000/year or $40/hour"
          value={expectedSalary}
          onChange={(e) => setExpectedSalary(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Availability Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !availabilityDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {availabilityDate ? format(availabilityDate, "PPP") : "When can you start?"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={availabilityDate}
              onSelect={setAvailabilityDate}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        {job.recruiter_id && (
          <ChatButton userId={job.recruiter_id} buttonText="Message Recruiter" />
        )}
        
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        <Button type="submit" disabled={isLoading || !coverLetter.trim()}>
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};

export default ApplyJobForm;

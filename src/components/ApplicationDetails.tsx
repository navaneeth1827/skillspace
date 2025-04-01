
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useJobApplications } from '@/hooks/useJobApplications';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, ClockIcon, ExternalLinkIcon, MessageSquareIcon, UserIcon } from 'lucide-react';
import { JobApplication, ApplicationStatusHistory } from '@/types/job';
import { cn } from '@/lib/utils';

interface ApplicationDetailsProps {
  application: JobApplication;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (applicationId: string, newStatus: string) => void;
  onMessage?: (userId: string) => void;
}

const ApplicationDetails = ({
  application,
  isOpen,
  onClose,
  onStatusUpdate,
  onMessage
}: ApplicationDetailsProps) => {
  const { getApplicationHistory, updateApplicationStatus, isLoading } = useJobApplications();
  const [statusHistory, setStatusHistory] = useState<ApplicationStatusHistory[]>([]);
  const [newStatus, setNewStatus] = useState(application.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchStatusHistory();
    }
  }, [isOpen, application.id]);

  const fetchStatusHistory = async () => {
    setLoadingHistory(true);
    const history = await getApplicationHistory(application.id);
    setStatusHistory(history);
    setLoadingHistory(false);
  };

  const handleStatusUpdate = async () => {
    if (newStatus === application.status) return;
    
    const success = await updateApplicationStatus(application.id, newStatus, statusNotes);
    
    if (success) {
      fetchStatusHistory();
      if (onStatusUpdate) {
        onStatusUpdate(application.id, newStatus);
      }
      setStatusNotes('');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'interview':
        return 'accent';
      case 'reviewing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleMessageClick = () => {
    if (onMessage && application.user_id) {
      onMessage(application.user_id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            {application.job?.title} - {application.job?.company}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-2 space-y-6">
            {/* Applicant Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Applicant Information</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={application.user_info?.avatar_url} />
                  <AvatarFallback>
                    {application.user_info?.full_name?.charAt(0) || <UserIcon className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{application.user_info?.full_name}</div>
                  <div className="text-sm text-muted-foreground">{application.user_info?.title || 'No title'}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {application.expected_salary && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Salary Expectation:</span>
                    <span>{application.expected_salary}</span>
                  </div>
                )}
                
                {application.availability_date && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Available From:</span>
                    <span>{format(new Date(application.availability_date), 'PPP')}</span>
                  </div>
                )}
                
                {application.portfolio_url && (
                  <div className="col-span-full">
                    <a 
                      href={application.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      View Portfolio <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={getStatusBadgeVariant(application.status)}
                >
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Applied {format(new Date(application.created_at), 'PPP')}
                </div>
              </div>
            </div>
            
            {/* Cover Letter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Cover Letter</h3>
              <div className="whitespace-pre-line text-sm border rounded-md p-4 bg-muted/20">
                {application.cover_letter}
              </div>
            </div>
            
            {/* Status History */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Status History</h3>
              {loadingHistory ? (
                <div className="text-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
                </div>
              ) : statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No status updates yet.</p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <div className="relative pl-6">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-muted-foreground/20"></div>
                    
                    {statusHistory.map((history, index) => (
                      <div key={history.id} className={cn("relative py-4 px-2", index !== statusHistory.length - 1 && "border-b")}>
                        <div className="absolute left-[-21px] top-5 h-2 w-2 rounded-full bg-primary"></div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div className="space-y-1">
                            <Badge variant={getStatusBadgeVariant(history.status)}>
                              {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                            </Badge>
                            {history.notes && (
                              <p className="text-sm">{history.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                            <ClockIcon className="mr-1 h-3 w-3" />
                            {format(new Date(history.created_at), 'PPP p')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Update Status Form */}
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="font-semibold">Update Status</h3>
              
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add notes about this status change"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="h-20"
                />
              </div>
              
              <Button 
                onClick={handleStatusUpdate} 
                disabled={isLoading || newStatus === application.status}
                className="w-full"
              >
                {isLoading ? "Updating..." : "Update Status"}
              </Button>
            </div>
            
            {/* Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold">Actions</h3>
              
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleMessageClick}
                >
                  <MessageSquareIcon className="mr-2 h-4 w-4" /> 
                  Message Applicant
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={`/profile/${application.user_id}`}>
                    <UserIcon className="mr-2 h-4 w-4" /> 
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetails;

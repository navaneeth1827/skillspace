
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useProfileData } from '@/hooks/useProfileData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, ExternalLinkIcon, GlobeIcon, MailIcon, MessageSquareIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { JobApplication, ApplicationStatusHistory } from '@/types/job';
import { PortfolioItem, ExperienceItem, EducationItem } from '@/types/profile';
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
  const navigate = useNavigate();
  const { getApplicationHistory, updateApplicationStatus, isLoading } = useJobApplications();
  const { portfolio, experience, education, isLoading: isLoadingProfile } = useProfileData(application.user_id);
  const [statusHistory, setStatusHistory] = useState<ApplicationStatusHistory[]>([]);
  const [newStatus, setNewStatus] = useState(application.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

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

  // Updated function to use only supported Badge variants
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'interview':
        return 'secondary';
      case 'reviewing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleMessageClick = () => {
    if (onMessage && application.user_id) {
      onMessage(application.user_id);
    } else if (application.user_id) {
      navigate(`/messages/${application.user_id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            {application.job?.title} - {application.job?.company}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="profile">Applicant Profile</TabsTrigger>
            <TabsTrigger value="application">Application Details</TabsTrigger>
            <TabsTrigger value="history">Status History</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column - Basic Info */}
              <div className="md:w-1/3 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={application.user_info?.avatar_url} />
                    <AvatarFallback>
                      {application.user_info?.full_name?.charAt(0) || <UserIcon className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{application.user_info?.full_name}</h3>
                    <p className="text-muted-foreground">{application.user_info?.title || 'No title'}</p>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <Badge className="capitalize">
                        {application.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        Applied {format(new Date(application.created_at), 'PPP')}
                      </div>
                    </div>
                    
                    {application.expected_salary && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Salary Expectation:</span>
                        <span>{application.expected_salary}</span>
                      </div>
                    )}
                    
                    {application.availability_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Available From:</span>
                        <span>{format(new Date(application.availability_date), 'PPP')}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 flex flex-col gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="w-full"
                        onClick={handleMessageClick}
                      >
                        <MessageSquareIcon className="mr-2 h-4 w-4" />
                        Message Applicant
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link to={`/profile/${application.user_id}`}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          View Full Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Contact & Links Section */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-medium text-sm">Contact Information</h4>
                    <div className="flex flex-col gap-2 text-sm">
                      {application.portfolio_url && (
                        <a 
                          href={application.portfolio_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <GlobeIcon className="h-4 w-4" />
                          Portfolio Website
                        </a>
                      )}
                      <div className="flex items-center gap-2">
                        <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Via Platform Messaging</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Experience, Education, Portfolio */}
              <div className="md:w-2/3 space-y-6">
                {/* Experience Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Experience</h3>
                  {isLoadingProfile ? (
                    <div className="text-center p-4">
                      <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading experience...</p>
                    </div>
                  ) : experience && experience.length > 0 ? (
                    <div className="space-y-4">
                      {experience.map((item: ExperienceItem) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.company}</p>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.start_date} - {item.end_date || 'Present'}
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-sm mt-2">{item.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No experience information available.</p>
                  )}
                </div>
                
                {/* Education Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Education</h3>
                  {isLoadingProfile ? (
                    <div className="text-center p-4">
                      <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading education...</p>
                    </div>
                  ) : education && education.length > 0 ? (
                    <div className="space-y-4">
                      {education.map((item: EducationItem) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{item.degree}</h4>
                                <p className="text-sm text-muted-foreground">{item.school}</p>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.year_range}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No education information available.</p>
                  )}
                </div>
                
                {/* Portfolio Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Portfolio</h3>
                  {isLoadingProfile ? (
                    <div className="text-center p-4">
                      <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading portfolio...</p>
                    </div>
                  ) : portfolio && portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {portfolio.map((item: PortfolioItem) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.description && (
                              <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                            {item.link && (
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline mt-2 inline-flex items-center"
                              >
                                View Project <ExternalLinkIcon className="ml-1 h-3 w-3" />
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No portfolio items available.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Application Tab */}
          <TabsContent value="application" className="space-y-6">
            {/* Cover Letter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Cover Letter</h3>
              <div className="whitespace-pre-line text-sm border rounded-md p-4 bg-muted/20">
                {application.cover_letter}
              </div>
            </div>
            
            {/* Update Status Form */}
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-semibold">Update Application Status</h3>
              
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
          </TabsContent>
          
          {/* Status History Tab */}
          <TabsContent value="history">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetails;
